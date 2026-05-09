import { AnalysisResult, Measurement, Landmark } from '../types';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calculator, Download, Users } from 'lucide-react';
import { generateRadiologyReport } from '../lib/pdfGenerator';
import { toast } from 'sonner';
import { ANALYSIS_TYPES } from '../constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: Timestamp;
}

interface RightSidebarProps {
  landmarks: Landmark[];
  analysisResults: AnalysisResult[];
  measurements: Measurement[];
  analysisType: string;
  setAnalysisType: (type: string) => void;
  selectedPatientId: string;
  setSelectedPatientId: (id: string) => void;
}

export const RightSidebar = ({ 
  landmarks,
  analysisResults,
  measurements,
  analysisType,
  setAnalysisType,
  selectedPatientId,
  setSelectedPatientId
}: RightSidebarProps) => {

  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchPatients = async () => {
      try {
        const patientsQuery = query(
          collection(db, 'patients'),
          where('ownerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const pSnap = await getDocs(patientsQuery);
        setPatients(pSnap.docs.map(d => ({ id: d.id, ...d.data() } as Patient)));
      } catch (error) {
        // silent error for patients fetch in sidebar
        console.error(error);
      }
    };
    fetchPatients();
  }, [user]);

  const handlePrintReport = () => {
    try {
      const patient = patients.find(p => p.id === selectedPatientId);
      
      generateRadiologyReport(
        {
          id: patient ? patient.id : 'PAT-UNKNOWN',
          name: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
          date: new Date()
        },
        analysisResults,
        measurements
      );
      toast.success('Radiology report generated successfully.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate report.');
    }
  };

  const handleExportJson = () => {
    try {
      const data = {
        landmarks,
        measurements,
        analysisResults,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ceph_analysis_${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Analysis exported to JSON');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export JSON');
    }
  };

  return (
    <aside className="w-80 bg-[#1e293b] border-l border-slate-700 flex flex-col z-20">
      <div className="p-4 border-b border-slate-700 bg-slate-800/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            Cephalometric Data
          </h3>
        </div>
        
        <div className="flex flex-col gap-2">
          <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
            <SelectTrigger className="w-full h-8 text-[11px] font-bold bg-slate-900 border-slate-700 text-indigo-400">
              <SelectValue placeholder="Assign to Patient" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
              {patients.length === 0 ? (
                <SelectItem value="empty" disabled className="text-[11px] italic">No patients found</SelectItem>
              ) : (
                patients.map(p => (
                  <SelectItem key={p.id} value={p.id} className="text-[11px]">
                    {p.lastName}, {p.firstName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Select value={analysisType} onValueChange={setAnalysisType}>
            <SelectTrigger className="w-full h-8 text-[11px] font-bold bg-slate-900 border-slate-700 text-slate-200">
              <SelectValue placeholder="Select Analysis" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
              {ANALYSIS_TYPES.map(type => (
                <SelectItem key={type.id} value={type.id} className="text-[11px]">
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="bg-slate-900/50 flex text-[9px] uppercase text-slate-500 font-bold border-b border-slate-800">
          <div className="flex-[2] px-4 py-2">Measurement</div>
          <div className="flex-1 px-2 py-2 text-center">Value</div>
          <div className="flex-[1.5] px-2 py-2 text-center">Norm</div>
          <div className="flex-1 px-2 py-2 text-center">Dev.</div>
        </div>

        <ScrollArea className="flex-1">
          <div className="divide-y divide-slate-800">
            {analysisResults.length === 0 ? (
              <div className="text-center py-20 text-slate-600 italic text-[11px] font-mono px-10">
                Awaiting landmark data for clinical computation...
              </div>
            ) : (
              analysisResults.map((result, i) => {
                const normVal = parseFloat(result.norm);
                const dev = result.value - normVal;
                const isNormal = Math.abs(dev) <= 2;
                
                return (
                  <div key={i} className="flex hover:bg-slate-800/50 transition-colors items-center text-[11px] font-mono">
                    <div className="flex-[2] px-4 py-3 text-slate-300 font-sans font-medium">{result.name} ({result.unit})</div>
                    <div className="flex-1 px-2 py-3 text-white text-center font-bold">{result.value.toFixed(1)}</div>
                    <div className="flex-[1.5] px-2 py-3 text-slate-500 text-center">{result.norm}</div>
                    <div className={`flex-1 px-2 py-3 text-center font-bold ${
                      dev > 2 ? 'text-red-400' : dev < -2 ? 'text-amber-400' : 'text-green-400'
                    }`}>
                      {dev > 0 ? '+' : ''}{dev.toFixed(1)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Diagnostic Impression */}
      <div className="p-4 bg-[#0f172a] border-t border-slate-700">
        <h4 className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest">Diagnostic Impression</h4>
        <div className="bg-cyan-950/10 border border-cyan-500/20 p-3 rounded text-[11px] text-slate-300 leading-relaxed font-sans shadow-inner">
          {analysisResults.length > 0 ? (
            <p>
              <span className="font-bold text-cyan-400 uppercase mr-1">Report Generated:</span>
              Based on Steiner analysis, the patient exhibits a 
              <span className="text-white font-medium"> {analysisResults.find(r => r.name === 'ANB')?.interpretation || 'normal'} </span>
              skeletal relationship. Further dental assessments required.
            </p>
          ) : (
            <span className="text-slate-600 italic">No diagnostic data available. Please complete landmarking.</span>
          )}
        </div>
        <div className="flex gap-2 w-full mt-4">
          <button 
            onClick={handlePrintReport}
            className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded text-[10px] font-bold uppercase transition-all tracking-widest border border-slate-600 text-slate-100"
          >
            Print
          </button>
          <button 
            onClick={handleExportJson}
            className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 flex items-center justify-center gap-2 rounded text-[10px] font-bold uppercase transition-all tracking-widest border border-slate-600 text-slate-100"
          >
            <Download className="w-3.5 h-3.5" />
            JSON
          </button>
        </div>
      </div>
    </aside>
  );
};
