import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Users, History, FileText, ChevronRight, Calendar, User as UserIcon, LogOut, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: Timestamp;
}

interface AnalysisRecord {
  id: string;
  patientId: string;
  createdAt: Timestamp;
  results: any[];
}

export const PatientDashboard = ({ onNewAnalysis, onSelectAnalysis }: { onNewAnalysis?: () => void; onSelectAnalysis?: (id: string) => void }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const patientsQuery = query(
          collection(db, 'patients'),
          where('ownerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const pSnap = await getDocs(patientsQuery);
        setPatients(pSnap.docs.map(d => ({ id: d.id, ...d.data() } as Patient)));

        const syncQuery = query(
          collection(db, 'analyses'),
          where('ownerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const aSnap = await getDocs(syncQuery);
        setRecentAnalyses(aSnap.docs.map(d => ({ id: d.id, ...d.data() } as AnalysisRecord)));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'patients/analyses');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="flex-1 bg-[#0f172a] p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Clinical Dashboard</h1>
            <p className="text-slate-400 text-sm font-medium">Clinician Registry & Patient Synchronizer</p>
          </div>
          <div className="flex items-center gap-6">
            <Button 
              onClick={() => {
                if (onNewAnalysis) onNewAnalysis();
                else navigate('/analyze');
              }}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-cyan-900/20 gap-2"
            >
              <Plus className="w-5 h-5" />
              New Analysis
            </Button>
            
            <div className="w-px h-10 bg-slate-800 hidden md:block"></div>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-slate-800 p-2 pl-3 border border-transparent hover:border-slate-700 transition-all rounded-xl cursor-pointer outline-none">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-white leading-none mb-1">{user?.displayName || "Clinician"}</p>
                  <p className="text-[10px] text-slate-400 font-mono uppercase leading-none">{user?.email}</p>
                </div>
                <Avatar className="h-10 w-10 border border-slate-700 bg-slate-800">
                  <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || ""} />
                  <AvatarFallback className="bg-cyan-900 text-cyan-400 font-bold">
                    {user?.email?.charAt(0).toUpperCase() || "C"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 text-slate-200">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">{user?.displayName || "Clinician Account"}</p>
                    <p className="text-xs leading-none text-slate-400">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer text-slate-300">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem 
                  className="hover:bg-rose-900/40 text-rose-400 cursor-pointer"
                  onClick={() => auth.signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                Recent Analysis Synchronizations
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {recentAnalyses.length === 0 ? (
                <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-2xl p-20 text-center flex items-center justify-center flex-col gap-4">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-300 font-bold">No analyses found</p>
                    <p className="text-slate-500 text-sm">Start a new analysis session to synchronize data.</p>
                  </div>
                </div>
              ) : (
                recentAnalyses.map((ana) => (
                  <button 
                    key={ana.id}
                    onClick={() => onSelectAnalysis(ana.id)}
                    className="flex items-center justify-between p-5 bg-slate-900/80 backdrop-blur-md hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-2xl transition-all group shadow-sm hover:shadow-cyan-900/10 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shadow-inner">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-white font-bold text-base group-hover:text-cyan-400 transition-colors">Analysis Record #{ana.id.slice(0, 8)}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mt-1">
                          <span className="flex items-center gap-1.5 bg-slate-950/50 px-2 py-0.5 rounded-md">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {format(ana.createdAt.toDate(), 'PPP')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-cyan-950 transition-colors">
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right: Patient Directory */}
          <aside className="space-y-6">
            <h2 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Patient Directory
            </h2>
            
            <Card className="bg-[#111827] border-slate-800 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/5">
              <ScrollArea className="h-[600px]">
                <div className="divide-y divide-slate-800/50">
                  {patients.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center gap-3">
                       <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center">
                         <UserIcon className="w-6 h-6 text-slate-700" />
                       </div>
                       <div className="space-y-1">
                         <p className="text-slate-300 font-bold text-sm">Patient directory empty</p>
                         <p className="text-xs text-slate-500">Patients will appear here automatically.</p>
                       </div>
                    </div>
                  ) : (
                    patients.map((pat) => (
                      <div key={pat.id} className="p-5 flex items-center justify-between hover:bg-slate-800/60 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-950/40 border border-indigo-900/30 rounded-xl flex items-center justify-center">
                            <Avatar className="h-8 w-8 bg-transparent">
                              <AvatarFallback className="bg-indigo-900/50 text-indigo-400 font-bold text-xs ring-1 ring-indigo-500/30">
                                {pat.firstName[0]}{pat.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{pat.lastName}, {pat.firstName}</p>
                            <p className="text-[10px] text-slate-500 font-mono uppercase mt-0.5 tracking-wider">ID: {pat.id.slice(0, 8)}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};
