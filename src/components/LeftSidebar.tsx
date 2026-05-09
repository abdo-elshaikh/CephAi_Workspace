import { Landmark, ToolType } from '../types';
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Circle, Target, Info, Ruler, Square, Minus, MousePointer2 } from 'lucide-react';
import { LANDMARK_DEFINITIONS } from '../constants';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface LeftSidebarProps {
  landmarks: Landmark[];
  activeLandmarkId: string | null;
  setActiveLandmarkId: (id: string | null) => void;
  mode: ToolType;
  setMode: (mode: ToolType) => void;
}

export const LeftSidebar = ({ 
  landmarks, 
  activeLandmarkId, 
  setActiveLandmarkId,
  mode,
  setMode
}: LeftSidebarProps) => {
  return (
    <aside className="w-64 bg-[#111827] border-r border-slate-800 flex flex-col z-20">
      <div className="p-3 border-b border-slate-800">
        <h3 className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">Analysis Modules</h3>
        <div className="space-y-1">
          <button className="w-full text-left px-3 py-2 bg-slate-800 border border-cyan-900/50 rounded text-[11px] flex justify-between items-center text-cyan-400 font-bold transition-all">
            Steiner Analysis <span>ACTIVE</span>
          </button>
          <button className="w-full text-left px-3 py-2 hover:bg-slate-800/50 border border-transparent rounded text-[11px] flex justify-between items-center text-slate-500 transition-all">
            Downs Analysis <span class="text-[9px] opacity-40 italic">INACTIVE</span>
          </button>
          <button className="w-full text-left px-3 py-2 hover:bg-slate-800/50 border border-transparent rounded text-[11px] flex justify-between items-center text-slate-500 transition-all">
            Ricketts Analysis <span class="text-[9px] opacity-40 italic">INACTIVE</span>
          </button>
        </div>
      </div>

      <div className="p-3 border-b border-slate-800">
        <h3 className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">Diagnostic Tools</h3>
        <div className="grid grid-cols-2 gap-1 mb-1">
          <Button 
            variant={mode === 'view' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setMode('view')}
            className={`text-[10px] uppercase font-bold h-7 px-1 ${mode === 'view' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
          >
            <MousePointer2 className="w-3 h-3 mr-2" />
            Pick
          </Button>
          <Button 
            variant={mode === 'landmark' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setMode('landmark')}
            className={`text-[10px] uppercase font-bold h-7 px-1 ${mode === 'landmark' ? 'bg-cyan-600 text-white' : 'text-slate-500'}`}
          >
            <Target className="w-3 h-3 mr-2" />
            Landmark
          </Button>
          <Button 
            variant={mode === 'calibrate' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setMode('calibrate')}
            className={`text-[10px] uppercase font-bold h-7 px-1 ${mode === 'calibrate' ? 'bg-amber-600 text-white' : 'text-slate-500'}`}
          >
            <Ruler className="w-3 h-3 mr-2" />
            Scale
          </Button>
          <Button 
            variant={mode === 'distance' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setMode('distance')}
            className={`text-[10px] uppercase font-bold h-7 px-1 ${mode === 'distance' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
          >
            <Minus className="w-3 h-3 mr-2 rotate-[45deg]" />
            Linear
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <Button 
            variant={mode === 'angle' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setMode('angle')}
            className={`text-[10px] uppercase font-bold h-7 px-1 ${mode === 'angle' ? 'bg-pink-600 text-white' : 'text-slate-500'}`}
          >
            <Target className="w-3 h-3 mr-2 opacity-50" />
            Angle
          </Button>
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">Landmark List</h3>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 pb-4">
          {LANDMARK_DEFINITIONS.map((def) => {
            const placed = landmarks.find(lm => lm.id === def.id);
            const isActive = activeLandmarkId === def.id;
            
            return (
              <button
                key={def.id}
                onClick={() => setActiveLandmarkId(def.id)}
                className={`w-full text-left px-2 py-1.5 rounded transition-all flex items-center justify-between group border ${
                  isActive 
                  ? 'bg-slate-800 border-cyan-500/50 text-cyan-400' 
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${placed ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-700'}`}></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold font-mono">{def.id}</span>
                    <span className="text-[9px] opacity-60 truncate max-w-[100px] leading-tight">{def.name}</span>
                  </div>
                </div>
                
                {isActive && <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
};
