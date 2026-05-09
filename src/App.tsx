/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toolbar } from './components/Toolbar';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { RadiographViewer } from './components/RadiographViewer';
import { LandingPage } from './components/LandingPage';
import { PatientDashboard } from './components/PatientDashboard';
import { Point, Landmark, ImageSettings, AnalysisResult, Calibration, Measurement, ToolType } from './types';
import { ANALYSIS_GROUPS, ANALYSIS_TYPES, LANDMARK_DEFINITIONS } from './constants';
import { runSteinerAnalysis, runJarabakAnalysis, runEastmanAnalysis, runRickettsAnalysis } from './lib/analyses';
import { detectLandmarks, detectLandmarksWithHRNet } from './services/ai';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useAuth } from './contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function EditorView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [mode, setMode] = useState<ToolType>('view');
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [activeLandmarkId, setActiveLandmarkId] = useState<string | null>(LANDMARK_DEFINITIONS[0].id);
  const [isDetecting, setIsDetecting] = useState(false);
  const [calibration, setCalibration] = useState<Calibration>({
    p1: null,
    p2: null,
    distanceMm: 10,
    pixelsPerMm: null
  });
  const [isCalibrateDialogOpen, setIsCalibrateDialogOpen] = useState(false);
  const [tempCalibrationDistance, setTempCalibrationDistance] = useState('10');
  const [analysisType, setAnalysisType] = useState('steiner');

  const [settings, setSettings] = useState<ImageSettings>({
    brightness: 100,
    contrast: 100,
    zoom: 0.8,
    pan: { x: 50, y: 50 }
  });

  const [history, setHistory] = useState<{landmarks: Landmark[], measurements: Measurement[], calibration: Calibration}[]>([{ landmarks: [], measurements: [], calibration: { p1: null, p2: null, distanceMm: 10, pixelsPerMm: null } }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = (newState: {landmarks: Landmark[], measurements: Measurement[], calibration: Calibration}) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const prevState = history[historyIndex - 1];
      setLandmarks(prevState.landmarks);
      setMeasurements(prevState.measurements);
      setCalibration(prevState.calibration);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextState = history[historyIndex + 1];
      setLandmarks(nextState.landmarks);
      setMeasurements(nextState.measurements);
      setCalibration(nextState.calibration);
    }
  };

  // Keep all the handler functions here
  const handleSaveAnalysis = async () => {
    if (!user || !image) return;
    try {
      await addDoc(collection(db, 'analyses'), {
        ownerId: user.uid,
        patientId: 'demo-patient', 
        landmarks,
        // Don't save results directly since they are computed, but we can store them to make life easier
        results: analysisResults,
        calibration,
        createdAt: serverTimestamp()
      });
      toast.success("Analysis synchronized to cloud registry.");
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'analyses');
    }
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re => setImage(re.target?.result as string));
        reader.readAsDataURL(file);
        toast.success("Radiograph imported successfully.");
      }
    };
    input.click();
  };

  const handlePlacePoint = (point: Point) => {
    if (mode === 'landmark' && activeLandmarkId) {
      const def = LANDMARK_DEFINITIONS.find(d => d.id === activeLandmarkId);
      if (!def) return;

      const filtered = landmarks.filter(lm => lm.id !== activeLandmarkId);
      const newLandmarks = [...filtered, { ...def, ...point }];
      
      setLandmarks(newLandmarks);
      pushHistory({ landmarks: newLandmarks, measurements, calibration });

      const currentIndex = LANDMARK_DEFINITIONS.findIndex(d => d.id === activeLandmarkId);
      if (currentIndex < LANDMARK_DEFINITIONS.length - 1) {
        setActiveLandmarkId(LANDMARK_DEFINITIONS[currentIndex + 1].id);
      }
    } else if (mode === 'calibrate') {
      if (!calibration.p1) {
        setCalibration({ ...calibration, p1: point });
      } else if (!calibration.p2) {
        setCalibration({ ...calibration, p2: point });
        setIsCalibrateDialogOpen(true);
      } else {
        setCalibration({ ...calibration, p1: point, p2: null });
      }
    }
  };

  const handleApplyCalibration = () => {
    const dist = parseFloat(tempCalibrationDistance);
    if (isNaN(dist) || !calibration.p1 || !calibration.p2) return;

    const pixelDist = Math.sqrt(
      Math.pow(calibration.p2.x - calibration.p1.x, 2) + 
      Math.pow(calibration.p2.y - calibration.p1.y, 2)
    );
    
    const newCalibration = {
      ...calibration,
      distanceMm: dist,
      pixelsPerMm: pixelDist / dist
    };
    setCalibration(newCalibration);
    pushHistory({ landmarks, measurements, calibration: newCalibration });
    
    setIsCalibrateDialogOpen(false);
    setMode('landmark');
    toast.success(`System calibrated: ${(pixelDist / dist).toFixed(2)} px/mm`);
  };

  const [aiModel, setAiModel] = useState<'gemini' | 'hrnet'>('gemini');

  const handleAutoDetect = async () => {
    if (!image) {
      toast.error("Diagnostic source missing. Please upload radiance file.");
      return;
    }

    setIsDetecting(true);
    try {
      let detected;
      if (aiModel === 'gemini') {
        detected = await detectLandmarks(image);
      } else {
        // Here you would connect to your specific HRNet model endpoint.
        // For demonstration purposes, we are simulating a failure if the URL is not set.
        const HRNET_API_URL = (import.meta as any).env?.VITE_HRNET_API_URL || "";
        if (!HRNET_API_URL) {
          throw new Error("HRNet API URL missing. Set VITE_HRNET_API_URL to your Python HRNet backend.");
        }
        detected = await detectLandmarksWithHRNet(image, HRNET_API_URL);
      }
      
      const imgElement = new Image();
      imgElement.src = image;
      await new Promise((resolve) => {
        imgElement.onload = resolve;
      });
      
      const width = imgElement.width;
      const height = imgElement.height;

      const mappedLandmarks = detected.map((d: any) => {
        const def = LANDMARK_DEFINITIONS.find(l => l.id === d.id);
        return {
          ...def,
          x: d.x > 1 ? (d.x / 100) * width : d.x * width,
          y: d.y > 1 ? (d.y / 100) * height : d.y * height,
        };
      }).filter((l: any) => l?.name);

      setLandmarks(mappedLandmarks);
      pushHistory({ landmarks: mappedLandmarks, measurements, calibration });
      setMode('view');
      toast.success("AI Landmark detection synchronized accurately.");
    } catch (e) {
      console.error(e);
      toast.error("AI Neural sync failed.");
    } finally {
      setIsDetecting(false);
    }
  };

  let analysisResults: AnalysisResult[] = [];
  switch (analysisType) {
    case 'jarabak':
      analysisResults = runJarabakAnalysis(landmarks);
      break;
    case 'ricketts':
      analysisResults = runRickettsAnalysis(landmarks, calibration.pixelsPerMm || 1);
      break;
    case 'eastman':
      analysisResults = runEastmanAnalysis(landmarks);
      break;
    case 'steiner':
    default:
      analysisResults = runSteinerAnalysis(landmarks);
  }

  const calibrationPoints = [];
  if (calibration.p1) calibrationPoints.push(calibration.p1);
  if (calibration.p2) calibrationPoints.push(calibration.p2);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f172a] text-slate-200 font-sans overflow-hidden">
      <Toolbar 
        onUpload={handleUpload}
        onReset={() => setSettings({ brightness: 100, contrast: 100, zoom: 0.8, pan: { x: 50, y: 50 } })}
        onAutoDetect={handleAutoDetect}
        isDetecting={isDetecting}
        settings={settings}
        onSettingsChange={setSettings}
        aiModel={aiModel}
        setAiModel={setAiModel}
      />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar 
          landmarks={landmarks}
          activeLandmarkId={activeLandmarkId}
          setActiveLandmarkId={setActiveLandmarkId}
          mode={mode}
          setMode={setMode}
        />
        <main className="flex-1 relative flex flex-col bg-black">
          <RadiographViewer 
            image={image}
            landmarks={landmarks}
            settings={settings}
            mode={mode}
            activeLandmarkId={activeLandmarkId}
            setActiveLandmarkId={setActiveLandmarkId}
            onPlaceLandmark={handlePlacePoint}
            onUpdateLandmark={(id, pt) => {
              const newLandmarks = landmarks.map(l => l.id === id ? { ...l, ...pt } : l);
              setLandmarks(newLandmarks);
              pushHistory({ landmarks: newLandmarks, measurements, calibration });
            }}
            calibrationPoints={calibrationPoints}
            onZoom={(val) => setSettings(s => ({ ...s, zoom: Math.max(0.1, s.zoom + val) }))}
            onReset={() => setSettings({ brightness: 100, contrast: 100, zoom: 0.8, pan: { x: 50, y: 50 } })}
            measurements={measurements}
            onAddMeasurement={(m) => {
              const newMeasurements = [...measurements, m];
              setMeasurements(newMeasurements);
              pushHistory({ landmarks, measurements: newMeasurements, calibration });
            }}
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleUndo} disabled={historyIndex === 0} title="Undo (Ctrl+Z)">Undo</Button>
            <Button variant="secondary" size="sm" onClick={handleRedo} disabled={historyIndex === history.length - 1} title="Redo (Ctrl+Y)">Redo</Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>Dashboard</Button>
            <Button variant="default" size="sm" onClick={handleSaveAnalysis} className="bg-cyan-600">Save Analysis</Button>
          </div>
          <div className="absolute top-20 left-8 pointer-events-none group">
            <div className={`px-4 py-1.5 rounded-full border shadow-2xl backdrop-blur-xl transition-all ${
              mode === 'calibrate' ? 'bg-amber-950/40 border-amber-500/30' : 
              mode === 'landmark' ? 'bg-cyan-950/40 border-cyan-500/30' : 
              'bg-slate-900/40 border-slate-700/30'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${
                   mode === 'calibrate' ? 'bg-amber-400 animate-pulse' : 
                   mode === 'landmark' ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'
                }`} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Mode: <span className="text-white">{mode}</span>
                </span>
              </div>
            </div>
          </div>
        </main>
        <RightSidebar 
          analysisResults={analysisResults} 
          measurements={measurements} 
          analysisType={analysisType}
          setAnalysisType={setAnalysisType}
        />
      </div>
      
      <footer className="h-6 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-4 text-[9px] text-slate-500 font-mono">
        <div className="flex gap-6">
          <span className="flex gap-2">ZOOM: <span className="text-slate-300">{Math.round(settings.zoom * 100)}%</span></span>
          <span className="flex gap-2">SCALE: <span className="text-slate-300">{calibration.pixelsPerMm ? `${calibration.pixelsPerMm.toFixed(2)} px/mm` : 'Uncalibrated'}</span></span>
          <span className="flex gap-2 uppercase">Core: <span className="text-cyan-400">Stable</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
          <span className="uppercase font-bold tracking-tighter">AI Subsystem Active</span>
        </div>
      </footer>

      <Dialog open={isCalibrateDialogOpen} onOpenChange={setIsCalibrateDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-widest text-cyan-400">Spatial Calibration</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Synchronize digital grid with physical scale. Enter known distance between selected calibration nodes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="distance" className="text-[10px] uppercase font-bold text-slate-500">Known Metric Distance (mm)</Label>
              <Input 
                id="distance" 
                value={tempCalibrationDistance} 
                onChange={(e) => setTempCalibrationDistance(e.target.value)}
                className="bg-slate-800 border-slate-700 font-mono text-cyan-400 h-10 text-lg"
                type="number"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" className="text-slate-500 text-xs" onClick={() => {
              setIsCalibrateDialogOpen(false);
              setCalibration(prev => ({ ...prev, p1: null, p2: null }));
            }}>Abort</Button>
            <Button onClick={handleApplyCalibration} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase text-[10px] tracking-widest px-6 h-10 shadow-lg shadow-cyan-900/20">Apply Scale</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function App() {
  const { user, loading: authLoading } = useAuth();
  
  if (authLoading) return <div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center"><div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/dashboard" element={user ? <PatientDashboard onNewAnalysis={() => window.location.href = "/analyze"} onSelectAnalysis={(id) => {}} /> : <Navigate to="/" />} />
        <Route path="/analyze" element={user ? <EditorView /> : <Navigate to="/" />} />
      </Routes>
      <Toaster position="bottom-right" theme="dark" closeButton richColors />
    </BrowserRouter>
  );
}
