import { Button } from "@/components/ui/button";
import { LogIn, Target } from "lucide-react";
import { signInWithGoogle } from "../lib/firebase";
import { motion } from "motion/react";

export const Login = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center space-y-8 max-w-md w-full px-6"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/20">
            <Target className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase">CephAI <span className="text-cyan-400">PRO</span></h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide">Professional AI-Driven Cephalometric Analysis</p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-700/50 p-8 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Diagnostic Authentication</h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Secure Clinician Access</p>
          </div>
          
          <Button 
            onClick={signInWithGoogle}
            className="w-full h-12 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-3 transition-all"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Sign in with Google
          </Button>

          <p className="text-[10px] text-slate-600 leading-relaxed px-4 text-center">
            By signing in, you acknowledge that this is a clinical decision support tool and final diagnostics remain the responsibility of the licensed professional.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
