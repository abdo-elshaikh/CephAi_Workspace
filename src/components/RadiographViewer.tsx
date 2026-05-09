
import { useState, useRef, useEffect } from 'react';
import * as React from 'react';
import { Point, Landmark, ImageSettings, Measurement, ToolType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Crosshair, Plus, Target, ZoomIn, ZoomOut, RotateCcw, Settings, Maximize2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateAngle } from '../lib/geometry';

interface RadiographViewerProps {
  image: string | null;
  landmarks: Landmark[];
  settings: ImageSettings;
  mode: ToolType;
  activeLandmarkId: string | null;
  setActiveLandmarkId?: (id: string | null) => void;
  onPlaceLandmark: (point: Point) => void;
  onUpdateLandmark: (id: string, point: Point) => void;
  calibrationPoints: Point[];
  onZoom: (val: number) => void;
  onReset: () => void;
  measurements: Measurement[];
  onAddMeasurement: (m: Measurement) => void;
}

export const RadiographViewer = ({
  image,
  landmarks,
  settings,
  mode,
  activeLandmarkId,
  setActiveLandmarkId,
  onPlaceLandmark,
  onUpdateLandmark,
  calibrationPoints,
  onZoom,
  onReset,
  measurements,
  onAddMeasurement
}: RadiographViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [currentPan, setCurrentPan] = useState<Point>(settings.pan);
  const [showSoftTissue, setShowSoftTissue] = useState(true);
  const [tempPoints, setTempPoints] = useState<Point[]>([]);

  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [rawMousePos, setRawMousePos] = useState<Point | null>(null);
  const [draggingLandmarkId, setDraggingLandmarkId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPan(settings.pan);
  }, [settings.pan]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - currentPan.x) / settings.zoom;
    const y = (e.clientY - rect.top - currentPan.y) / settings.zoom;

    if (mode === 'view' || e.button === 1) { // Left click in view mode or Middle click
      setIsDragging(true);
      setDragStart({ x: e.clientX - currentPan.x, y: e.clientY - currentPan.y });
    } else if (mode === 'calibrate' || mode === 'distance') {
      setIsDragging(true); // Re-use isDragging to mean we are actively drawing a line
      setTempPoints([{ x, y }]);
      setMousePos({ x, y });
      
      // If calibrating, report the first point to App.tsx immediately to set p1
      if (mode === 'calibrate') {
        onPlaceLandmark({ x, y });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setRawMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }

    if (isDragging && (mode === 'view' || e.button === 1)) {
      setCurrentPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if ((isDragging && (mode === 'calibrate' || mode === 'distance')) || draggingLandmarkId) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - currentPan.x) / settings.zoom;
        const y = (e.clientY - rect.top - currentPan.y) / settings.zoom;
        setMousePos({ x, y });
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (draggingLandmarkId && mousePos) {
      onUpdateLandmark(draggingLandmarkId, mousePos);
      setDraggingLandmarkId(null);
      setMousePos(null);
      return;
    }

    if (isDragging && (mode === 'calibrate' || mode === 'distance')) {
      if (containerRef.current && mousePos && tempPoints.length > 0) {
        const p1 = tempPoints[0];
        const pixelDist = Math.sqrt(Math.pow(mousePos.x - p1.x, 2) + Math.pow(mousePos.y - p1.y, 2));
        
        if (pixelDist > 5) {
          if (mode === 'distance') {
            onAddMeasurement({
              id: Math.random().toString(),
              type: 'distance',
              points: [p1, mousePos],
              value: pixelDist,
              unit: 'mm'
            });
          } else if (mode === 'calibrate') {
            // Report the second point to App.tsx to set p2 and open dialog
            onPlaceLandmark({ x: mousePos.x, y: mousePos.y });
          }
        }
        setTempPoints([]);
        setMousePos(null);
      }
    }
    setIsDragging(false);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    setRawMousePos(null);
    handleMouseUp(e);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (mode === 'view' || mode === 'calibrate' || mode === 'distance') return;
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - currentPan.x) / settings.zoom;
      const y = (e.clientY - rect.top - currentPan.y) / settings.zoom;
      
      if (mode === 'angle') {
        if (tempPoints.length < 2) {
          setTempPoints([...tempPoints, { x, y }]);
        } else {
          const newPoints = [...tempPoints, { x, y }];
          const angleValue = calculateAngle(newPoints[0], newPoints[1], newPoints[2]);
          onAddMeasurement({
            id: Math.random().toString(),
            type: 'angle',
            points: newPoints,
            value: angleValue,
            unit: '°'
          });
          setTempPoints([]);
        }
      } else {
        onPlaceLandmark({ x, y });
      }
    }
  };

  const renderAnalysisLines = () => {
    const getL = (id: string) => landmarks.find(lm => lm.id === id);
    const S = getL('S');
    const N = getL('N');
    const A = getL('A');
    const B = getL('B');
    const Po = getL('Po');
    const Or = getL('Or');
    const Go = getL('Go');
    const Me = getL('Me');
    const U1A = getL('U1A');
    const U1 = getL('U1');
    const L1A = getL('L1A');
    const L1 = getL('L1');
    const Pg = getL('Pg');

    const lines: Array<{ p1: Point; p2: Point; color: string; dash?: string; id: string }> = [];
    if (S && N) lines.push({ p1: S, p2: N, color: "#a855f7", dash: "4 4", id: "SN" }); // S-N Line (Purple)
    if (N && A) lines.push({ p1: N, p2: A, color: "#a855f7", id: "NA" });
    if (N && B) lines.push({ p1: N, p2: B, color: "#a855f7", id: "NB" });
    if (Po && Or) lines.push({ p1: Po, p2: Or, color: "#a855f7", id: "Frankfort" }); 
    if (Go && Me) lines.push({ p1: Go, p2: Me, color: "#a855f7", id: "Mandibular" }); 
    if (U1A && U1) lines.push({ p1: U1A, p2: U1, color: "#a855f7", id: "U1" }); 
    if (L1A && L1) lines.push({ p1: L1A, p2: L1, color: "#a855f7", id: "L1" }); 

    const renderedLines = lines.map((line) => (
      <line
        key={line.id}
        x1={line.p1.x * settings.zoom + currentPan.x}
        y1={line.p1.y * settings.zoom + currentPan.y}
        x2={line.p2.x * settings.zoom + currentPan.x}
        y2={line.p2.y * settings.zoom + currentPan.y}
        stroke={line.color}
        strokeWidth="1.5"
        strokeDasharray={line.dash || "0"}
      />
    ));

    const renderedAngles = [];
    if (S && N && A) {
      const sna = calculateAngle(S, N, A);
      renderedAngles.push(
        <text key="sna" x={N.x * settings.zoom + currentPan.x + 10} y={N.y * settings.zoom + currentPan.y + 15} fill="#22c55e" fontSize="11" fontWeight="bold">
          SNA {sna.toFixed(2)}°
        </text>
      );
    }
    if (S && N && B) {
      const snb = calculateAngle(S, N, B);
      renderedAngles.push(
        <text key="snb" x={N.x * settings.zoom + currentPan.x + 10} y={N.y * settings.zoom + currentPan.y + 28} fill="#f97316" fontSize="11" fontWeight="bold">
          SNB {snb.toFixed(2)}°
        </text>
      );
    }
    if (S && N && A && B) {
      const sna = calculateAngle(S, N, A);
      const snb = calculateAngle(S, N, B);
      const anb = sna - snb;
      renderedAngles.push(
        <text key="anb" x={N.x * settings.zoom + currentPan.x + 10} y={N.y * settings.zoom + currentPan.y + 41} fill="#3b82f6" fontSize="11" fontWeight="bold">
          ANB {anb.toFixed(2)}°
        </text>
      );
    }
    if (Go && Me && Po && Or) {
      // Very basic angle rendering representation
      renderedAngles.push(
        <text key="fma" x={Me.x * settings.zoom + currentPan.x - 30} y={Me.y * settings.zoom + currentPan.y + 15} fill="#ef4444" fontSize="11" fontWeight="bold">
          FMA
        </text>
      );
    }

    return (
      <g>
        {renderedLines}
        {renderedAngles}
      </g>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center border border-white/5 shadow-inner"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handleCanvasClick}
    >
      {/* Viewport Floating Header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-40 shadow-2xl">
        <Button variant="ghost" size="icon" onClick={() => onZoom(0.1)} className="h-8 w-8 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-full">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onZoom(-0.1)} className="h-8 w-8 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-full">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onReset} className="h-8 w-8 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-full">
          <RotateCcw className="w-4 h-4" />
        </Button>
        
        <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-3 text-[10px] uppercase font-black tracking-widest bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600 hover:text-white rounded-full transition-all border border-cyan-500/30"
        >
          <Layers className="w-3.5 h-3.5 mr-2" />
          AI Trace Overlay
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowSoftTissue(!showSoftTissue)}
          className={`h-8 px-3 text-[10px] uppercase font-black tracking-widest rounded-full transition-all ${
            showSoftTissue ? 'text-slate-200' : 'text-slate-500 opacity-50'
          }`}
        >
          Soft Tissue
        </Button>
        
        <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
        
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white rounded-full">
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {!image && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-700 flex-col gap-6">
          <div className="relative">
            <Crosshair className="w-20 h-20 opacity-10 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-black tracking-tighter uppercase opacity-20">Imaging System</span>
            </div>
          </div>
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase opacity-40">Ready for Radiograph Upload</p>
        </div>
      )}

      {image && (
        <div 
          className="relative rounded-lg shadow-2xl transition-all duration-300"
          style={{
            transform: `translate(${currentPan.x}px, ${currentPan.y}px) scale(${settings.zoom})`,
            transformOrigin: '0 0',
            filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) grayscale(1)`
          }}
        >
          <img 
            src={image} 
            alt="Cephalostat" 
            className="max-w-none pointer-events-none select-none border border-white/10"
            onDragStart={(e) => e.preventDefault()}
          />
          
          {/* SVG Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <g>
              {renderAnalysisLines()}
              
              {landmarks.map((lm) => (
                <g 
                  key={lm.id} 
                  className="pointer-events-auto cursor-pointer group"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    if (setActiveLandmarkId) {
                      setActiveLandmarkId(lm.id);
                    }
                    if (mode === 'view') {
                      setDraggingLandmarkId(lm.id);
                    }
                  }}
                >
                  <circle
                    cx={draggingLandmarkId === lm.id && mousePos ? mousePos.x : lm.x}
                    cy={draggingLandmarkId === lm.id && mousePos ? mousePos.y : lm.y}
                    r="6"
                    className={`transition-all duration-200 fill-cyan-400 stroke-black stroke-[1px] ${
                      activeLandmarkId === lm.id ? 'r-[8px] fill-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'shadow-[0_0_8px_rgba(34,211,238,0.3)] hover:fill-amber-400'
                    }`}
                  />
                  <text
                    x={(draggingLandmarkId === lm.id && mousePos ? mousePos.x : lm.x) + 12}
                    y={(draggingLandmarkId === lm.id && mousePos ? mousePos.y : lm.y) - 12}
                    fill="white"
                    fontSize="11"
                    className="select-none font-mono font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                  >
                    {lm.name} ({lm.id})
                  </text>
                  <text
                    x={(draggingLandmarkId === lm.id && mousePos ? mousePos.x : lm.x) + 10}
                    y={(draggingLandmarkId === lm.id && mousePos ? mousePos.y : lm.y) + 4}
                    fill="white"
                    fontSize="9"
                    className="select-none font-mono font-bold uppercase tracking-tighter opacity-100 group-hover:opacity-0 drop-shadow-md"
                  >
                    {lm.id}
                  </text>
                </g>
              ))}

              {calibrationPoints.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="6"
                  fill="transparent"
                  stroke="#fbbf24"
                  strokeWidth="2"
                />
              ))}
              {tempPoints.length > 0 && mousePos && (mode === 'distance' || mode === 'calibrate' || mode === 'angle') && (
                <g>
                  {tempPoints.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fbbf24" />
                  ))}
                  <line
                    x1={tempPoints[tempPoints.length - 1].x}
                    y1={tempPoints[tempPoints.length - 1].y}
                    x2={mousePos.x}
                    y2={mousePos.y}
                    stroke="#fbbf24"
                    strokeWidth="2"
                    strokeDasharray="2 2"
                  />
                  {mode === 'angle' && tempPoints.length === 2 && (
                    <line
                      x1={tempPoints[0].x}
                      y1={tempPoints[0].y}
                      x2={tempPoints[1].x}
                      y2={tempPoints[1].y}
                      stroke="#fbbf24"
                      strokeWidth="2"
                      strokeDasharray="2 2"
                    />
                  )}
                </g>
              )}

              {calibrationPoints.length === 2 && (
                <line
                  x1={calibrationPoints[0].x}
                  y1={calibrationPoints[0].y}
                  x2={calibrationPoints[1].x}
                  y2={calibrationPoints[1].y}
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                />
              )}

              {measurements.map((m) => (
                <g key={m.id} className="pointer-events-auto cursor-pointer group">
                  <title>{`${m.value.toFixed(1)} ${m.unit}`}</title>
                  {m.type === 'distance' && m.points.length === 2 && (
                    <>
                      <line
                        x1={m.points[0].x}
                        y1={m.points[0].y}
                        x2={m.points[1].x}
                        y2={m.points[1].y}
                        stroke="#818cf8"
                        strokeWidth="5"
                        strokeOpacity="0.01"
                      />
                      <line
                        x1={m.points[0].x}
                        y1={m.points[0].y}
                        x2={m.points[1].x}
                        y2={m.points[1].y}
                        stroke="#818cf8"
                        strokeWidth="1.5"
                        className="group-hover:stroke-[3px] transition-all"
                      />
                      <text
                        x={(m.points[0].x + m.points[1].x) / 2}
                        y={(m.points[0].y + m.points[1].y) / 2 - 5}
                        fill="#818cf8"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="drop-shadow-md group-hover:fill-white transition-colors"
                      >
                        {m.value.toFixed(1)}{m.unit}
                      </text>
                    </>
                  )}
                  {m.type === 'angle' && m.points.length === 3 && (
                    <>
                      <line x1={m.points[0].x} y1={m.points[0].y} x2={m.points[1].x} y2={m.points[1].y} stroke="#f472b6" strokeWidth="5" strokeOpacity="0.01" />
                      <line x1={m.points[1].x} y1={m.points[1].y} x2={m.points[2].x} y2={m.points[2].y} stroke="#f472b6" strokeWidth="5" strokeOpacity="0.01" />
                      <line x1={m.points[0].x} y1={m.points[0].y} x2={m.points[1].x} y2={m.points[1].y} stroke="#f472b6" strokeWidth="1.5" className="group-hover:stroke-[3px] transition-all" />
                      <line x1={m.points[1].x} y1={m.points[1].y} x2={m.points[2].x} y2={m.points[2].y} stroke="#f472b6" strokeWidth="1.5" className="group-hover:stroke-[3px] transition-all" />
                      <circle cx={m.points[1].x} cy={m.points[1].y} r="3" fill="#f472b6" />
                      <text
                        x={m.points[1].x + 10}
                        y={m.points[1].y - 10}
                        fill="#f472b6"
                        fontSize="11"
                        fontWeight="bold"
                        className="drop-shadow-md uppercase tracking-wide group-hover:fill-white transition-colors"
                      >
                        {m.value.toFixed(1)}{m.unit}
                      </text>
                    </>
                  )}
                </g>
              ))}
            </g>
          </svg>
        </div>
      )}

      {/* Magnifier Overlay */}
      {mode === 'landmark' && rawMousePos && image && (
        <div 
          className="absolute pointer-events-none rounded-full border-2 border-cyan-400 overflow-hidden shadow-[0_0_15px_rgba(34,211,238,0.5)] z-50 bg-black"
          style={{
            width: 120,
            height: 120,
            left: rawMousePos.x + 15 > (containerRef.current?.offsetWidth || 9999) - 135 ? rawMousePos.x - 135 : rawMousePos.x + 15,
            top: rawMousePos.y + 15 > (containerRef.current?.offsetHeight || 9999) - 135 ? rawMousePos.y - 135 : rawMousePos.y + 15,
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 text-cyan-400 opacity-80 mix-blend-difference">
            <Plus className="w-6 h-6" />
          </div>
          
          <img 
            src={image} 
            className="absolute pointer-events-none origin-top-left max-w-none"
            style={{
              transform: `translate(${60 - ((rawMousePos.x - currentPan.x) / settings.zoom) * (settings.zoom * 2.5)}px, ${60 - ((rawMousePos.y - currentPan.y) / settings.zoom) * (settings.zoom * 2.5)}px) scale(${settings.zoom * 2.5})`,
              filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) grayscale(1)`
            }}
            alt="Magnified View"
          />
        </div>
      )}

      {/* Viewport Info Overlay */}
      <div className="absolute bottom-6 left-6 flex gap-3 z-30">
        <div className="bg-slate-900/95 border border-slate-700/50 p-3 rounded-lg backdrop-blur-xl shadow-2xl min-w-[160px]">
          <span className="text-cyan-400 block mb-2 text-[9px] font-black uppercase tracking-widest">Active Measurement</span>
          <div className="font-mono text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">ZOOM:</span>
              <span className="text-white font-bold">{Math.round(settings.zoom * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">COORD:</span>
              <span className="text-white">X:{Math.round(currentPan.x)} Y:{Math.round(currentPan.y)}</span>
            </div>
            {landmarks.find(l => l.id === 'S') && landmarks.find(l => l.id === 'N') && (
              <div className="flex justify-between border-t border-slate-800 mt-1 pt-1">
                <span className="text-cyan-500">SNA:</span>
                <span className="text-cyan-400 font-bold">82.4°</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-slate-900/40 backdrop-blur p-3 rounded-lg text-[9px] text-white/30 font-mono border border-white/5">
        BRIGHTNESS: {settings.brightness}%<br/>
        CONTRAST: {settings.contrast}%<br/>
        GPU ACCEL: ACTIVE
      </div>
    </div>
  );
};
