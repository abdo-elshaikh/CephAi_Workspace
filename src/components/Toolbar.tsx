
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  RotateCcw, 
  Settings2, 
  Cpu, 
  FileText,
  Info
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { ImageSettings } from '../types';

interface ToolbarProps {
  onUpload: () => void;
  onReset: () => void;
  onAutoDetect: () => void;
  isDetecting: boolean;
  settings: ImageSettings;
  onSettingsChange: (settings: ImageSettings) => void;
  aiModel: 'gemini' | 'hrnet';
  setAiModel: (model: 'gemini' | 'hrnet') => void;
}

export const Toolbar = ({ 
  onUpload, 
  onReset, 
  onAutoDetect, 
  isDetecting,
  settings,
  onSettingsChange,
  aiModel,
  setAiModel
}: ToolbarProps) => {
  return (
    <header className="flex items-center justify-between px-4 h-12 bg-[#1e293b] border-b border-slate-700 shadow-lg z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
          <span className="font-bold tracking-tight text-white uppercase text-sm">
            CEPH-AI <span className="text-cyan-400">PRO</span> <span className="text-[10px] text-slate-500 font-normal">v4.2</span>
          </span>
        </div>
        <div className="h-4 w-[1px] bg-slate-600"></div>
        <div className="text-[10px] text-slate-400 uppercase tracking-widest hidden md:block">
          Mode: <span className="text-white font-medium">Diagnostic Analysis</span> | Session: <span className="text-white font-medium">AUTO-SYNX</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4 text-[11px] font-mono mr-4">
          <div className="flex gap-2 text-slate-500 uppercase">
            AI CONFIDENCE: <span className="text-green-400 font-bold">98.4%</span>
          </div>
          <div className="flex gap-2 text-slate-500 uppercase">
            LATENCY: <span className="text-cyan-400">142ms</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={aiModel} onValueChange={(val: 'gemini' | 'hrnet') => setAiModel(val)}>
            <SelectTrigger className="w-[145px] h-8 bg-slate-800 border-slate-700 text-[10px] text-white uppercase font-bold px-2 rounded-md focus:ring-1 focus:ring-cyan-500">
              <SelectValue placeholder="AI Model" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-slate-300">
              <SelectItem value="gemini" className="text-xs uppercase font-bold focus:bg-slate-700 focus:text-white">Gemini 2.5 Pro</SelectItem>
              <SelectItem value="hrnet" className="text-xs uppercase font-bold focus:bg-slate-700 focus:text-white">HRNet</SelectItem>
            </SelectContent>
          </Select>

          {aiModel === 'hrnet' && (
            <Dialog>
              <DialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-400 hover:text-cyan-300 hover:bg-slate-700/50" title="HRNet Configuration" />}>
                <Info className="w-4 h-4" />
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700 text-slate-200">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold font-mono text-cyan-400">Open-Source HRNet Model Setup</DialogTitle>
                  <DialogDescription className="text-slate-400 mt-2">
                    HRNet is an advanced architecture for automated cephalometric landmark detection.
                    To use the <strong>cwlachap/hrnet-cephalometric-landmark-detection</strong> model natively, you must run our Python Backend locally.
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-slate-950 p-4 rounded-md font-mono text-[11px] whitespace-pre-wrap overflow-x-auto text-slate-300 border border-slate-800">
                  <span className="text-slate-500"># 1. Install dependencies</span>
                  {'\n'}pip install fastapi uvicorn torch torchvision pillow huggingface_hub
                  {'\n\n'}<span className="text-slate-500"># 2. Run the provided backend script</span>
                  {'\n'}python hrnet_backend.py
                  {'\n\n'}<span className="text-slate-500"># Note: Set VITE_HRNET_API_URL in your `.env` to override the default http://localhost:8000/predict.</span>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onUpload}
            className="h-8 text-slate-400 hover:text-white hover:bg-slate-700/50 text-[10px] uppercase font-bold px-2 gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onAutoDetect}
            disabled={isDetecting}
            className="h-8 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] uppercase font-bold px-3 gap-2"
          >
            <Cpu className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
            {isDetecting ? 'Processing...' : 'Run Auto-Detect'}
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 border-slate-700 text-slate-300 hover:bg-slate-700 text-[10px] uppercase font-bold gap-2"
          >
            <FileText className="w-3.5 h-3.5" />
            Report
          </Button>
          
          <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>
          
          <Button variant="ghost" size="icon" onClick={onReset} className="h-8 w-8 text-slate-500 hover:text-white" title="Reset view">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          <Popover>
            <PopoverTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white" title="Image Settings" />}>
              <Settings2 className="w-3.5 h-3.5" />
            </PopoverTrigger>
            <PopoverContent className="w-64 bg-slate-800 border-slate-700 text-slate-300">
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Brightness</span>
                    <span className="text-xs text-slate-400">{settings.brightness}%</span>
                  </div>
                  <Slider
                    defaultValue={[settings.brightness]}
                    min={0}
                    max={200}
                    step={1}
                    value={[settings.brightness]}
                    onValueChange={(val: number[]) => onSettingsChange({ ...settings, brightness: val[0] })}
                    className="[&>span:first-child]:h-1 [&>span:first-child]:bg-slate-700 [&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Contrast</span>
                    <span className="text-xs text-slate-400">{settings.contrast}%</span>
                  </div>
                  <Slider
                    defaultValue={[settings.contrast]}
                    min={0}
                    max={200}
                    step={1}
                    value={[settings.contrast]}
                    onValueChange={(val: number[]) => onSettingsChange({ ...settings, contrast: val[0] })}
                    className="[&>span:first-child]:h-1 [&>span:first-child]:bg-slate-700 [&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
};
