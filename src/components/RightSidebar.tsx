import { AnalysisResult, Measurement } from '../types';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calculator } from 'lucide-react';
import { generateRadiologyReport } from '../lib/pdfGenerator';
import { toast } from 'sonner';
import { ANALYSIS_TYPES } from '../constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RightSidebarProps {
  analysisResults: AnalysisResult[];
  measurements: Measurement[];
  analysisType: string;
  setAnalysisType: (type: string) => void;
}

export const RightSidebar = ({ 
  analysisResults,
  measurements,
  analysisType,
  setAnalysisType
}: RightSidebarProps) => {

  const handlePrintReport = () => {
    try {
      generateRadiologyReport(
        {
          id: 'PAT-48291',
          name: 'Jane Doe',
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

  return (
    <aside className="w-80 bg-[#1e293b] border-l border-slate-700 flex flex-col z-20">
      <div className="p-4 border-b border-slate-700 bg-slate-800/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            Cephalometric Data
          </h3>
        </div>
        
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
        <button 
          onClick={handlePrintReport}
          className="w-full mt-4 bg-slate-700 hover:bg-slate-600 py-2 rounded text-[10px] font-bold uppercase transition-all tracking-widest border border-slate-600 text-slate-100"
        >
          Print Full Radiology Report
        </button>
      </div>
    </aside>
  );
};
