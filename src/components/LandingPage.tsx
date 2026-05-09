import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, Target, Mail, Activity, ArrowRight, Layers, ShieldCheck } from "lucide-react";
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from "../lib/firebase";
import { motion } from "motion/react";
import { toast } from "sonner";

export const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (e: any) {
      toast.error(e.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUpWithEmail(email, password, name);
    } catch (e: any) {
      toast.error(e.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (e: any) {
      toast.error("Google sign-in failed");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-slate-200 selection:bg-cyan-500/30 overflow-y-auto">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 h-20 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Target className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase">CephAI <span className="text-cyan-400">PRO</span></span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
          <a href="#auth" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Sign In</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 md:px-12 py-24 md:py-32 overflow-hidden flex flex-col md:flex-row items-center gap-16 max-w-7xl mx-auto">
        {/* Background grids */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="gridLarge" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridLarge)" />
          </svg>
        </div>

        <div className="flex-1 space-y-8 z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
             <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-[1.1]">
              Next-Gen Cephalometric <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Analysis Platform</span>
            </h1>
          </motion.div>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-lg md:text-xl text-slate-400 max-w-2xl font-medium">
            Empower your orthodontic diagnostics with AI-driven point detection, real-time measurements, and automated standard analysis reports.
          </motion.p>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex flex-wrap gap-4">
            <a href="#auth">
              <Button className="h-14 px-8 text-lg font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-2xl shadow-cyan-900/40">
                Start Analysis <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="flex-1 w-full relative z-10">
          <div className="aspect-[4/3] bg-slate-900 rounded-3xl border border-white/10 shadow-2xl shadow-cyan-900/20 overflow-hidden relative">
            <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1740&auto=format&fit=crop" alt="Dashboard Preview" className="w-full h-full object-cover opacity-50 grayscale mix-blend-luminosity" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-[200px] h-[200px] border border-cyan-500/30 rounded-full animate-ping opacity-20"></div>
              <div className="absolute w-[100px] h-[100px] border border-cyan-400/50 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.5s' }}></div>
              <Target className="w-16 h-16 text-cyan-400" />
            </div>
            
            <div className="absolute bottom-6 left-6 right-6">
               <div className="bg-slate-950/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                 <div>
                   <h3 className="text-white font-bold text-sm tracking-widest uppercase">Auto-Detection</h3>
                   <p className="text-cyan-400 text-[10px] font-mono tracking-widest">GEMINI-2.5-FLASH ACTIVE</p>
                 </div>
                 <Activity className="text-cyan-400 w-5 h-5 animate-pulse" />
               </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 md:px-12 py-24 bg-slate-900/50 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase">Clinical Precision Tools</h2>
            <p className="text-slate-400">Everything you need for comprehensive cephalometric evaluation.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: 'AI Landmark Detection', desc: 'Automatic identification of skeletal and soft tissue landmarks using advanced Gemini models.' },
              { icon: Layers, title: 'Multiple Analyses', desc: 'Instantly calculate Steiner, Ricketts, Jarabak, and Eastman normative standard measurements.' },
              { icon: ShieldCheck, title: 'Secure Patient DB', desc: 'Cloud-synchronized HIPAA-compliant-ready architecture with Firebase enterprise-grade security.' }
            ].map((f, i) => (
              <div key={i} className="bg-slate-800/40 border border-white/5 p-8 rounded-3xl hover:bg-slate-800/80 transition-colors">
                 <div className="w-12 h-12 bg-cyan-950 rounded-xl flex items-center justify-center mb-6">
                   <f.icon className="w-6 h-6 text-cyan-400" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                 <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth" className="px-6 md:px-12 py-24 relative z-10 flex justify-center">
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl p-8 overflow-hidden"
          >
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Portal Access</h2>
              <p className="text-xs text-slate-500 font-medium">Licensed Clinical Professionals Only</p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800 rounded-xl mb-6">
                <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-cyan-600 data-[state=active]:text-white">Login</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-cyan-600 data-[state=active]:text-white">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</Label>
                    <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="bg-slate-950 border-slate-800 focus-visible:ring-cyan-500 h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</Label>
                    <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="bg-slate-950 border-slate-800 focus-visible:ring-cyan-500 h-12 rounded-xl" />
                  </div>
                  <Button disabled={loading} type="submit" className="w-full h-12 bg-white hover:bg-slate-200 text-slate-900 font-bold rounded-xl mt-2">
                    {loading ? 'Authenticating...' : 'Secure Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleEmailSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</Label>
                    <Input type="text" required value={name} onChange={e => setName(e.target.value)} className="bg-slate-950 border-slate-800 focus-visible:ring-cyan-500 h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</Label>
                    <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="bg-slate-950 border-slate-800 focus-visible:ring-cyan-500 h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</Label>
                    <Input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="bg-slate-950 border-slate-800 focus-visible:ring-cyan-500 h-12 rounded-xl" />
                  </div>
                  <Button disabled={loading} type="submit" className="w-full h-12 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl mt-2">
                    {loading ? 'Registering...' : 'Create Professional Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="my-6 flex items-center">
              <div className="flex-1 h-[1px] bg-slate-800"></div>
              <span className="px-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">OR</span>
              <div className="flex-1 h-[1px] bg-slate-800"></div>
            </div>

            <Button onClick={handleGoogleLogin} className="w-full h-12 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-3">
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5 rounded-full bg-white p-0.5" alt="Google" />
              Continue with Google
            </Button>
            
            <p className="mt-6 text-[10px] text-slate-600 leading-relaxed text-center px-4">
              By accessing this system, you agree to our terms of service and recognize this application is built for illustrative diagnostic purposes.
            </p>
         </motion.div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-slate-500 text-xs mt-24">
        &copy; {new Date().getFullYear()} CephAI PRO. Built with Google AI Studio & Firebase.
      </footer>
    </div>
  );
};
