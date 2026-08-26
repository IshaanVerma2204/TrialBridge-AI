"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PatientProfileForm } from "@/components/PatientProfileForm";
import { fetchWithAuth } from "@/lib/api-client";

interface TrialMatch {
  nct_id: string;
  title: string;
  status: string;
  location: string;
  compatibility_score: string;
  explanation: string;
}

interface ResearcherTrial {
  nct_id: string;
  title: string;
  status: string;
}

interface ResearcherPatient {
  patient_id: string;
  age: number;
  conditions: string;
  genes: string;
  compatibility_score: number;
  explanation: string;
}

interface AdminStats {
  total_patients: number;
  total_researchers: number;
  total_trials: number;
  active_matches: number;
}

interface PatientInvitation {
  invite_id: string;
  status: string;
  created_at: string;
  trial: {
    nct_id: string;
    title: string;
    status: string;
    location: string;
  }
}

export default function DashboardPage(props: { params: Promise<{ role: string }> }) {
  const { user, logout } = useAuth();
  
  // Next.js 15 requires awaiting/using params
  const params = use(props.params);
  const role = params.role; 

  const [searchQuery, setSearchQuery] = useState("");

  // Patient State
  const [matches, setMatches] = useState<TrialMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [invitations, setInvitations] = useState<PatientInvitation[]>([]);
  
  // Researcher State
  const [trials, setTrials] = useState<ResearcherTrial[]>([]);
  const [selectedTrial, setSelectedTrial] = useState<string | null>(null);
  const [matchedPatients, setMatchedPatients] = useState<ResearcherPatient[]>([]);
  const [inviteStatus, setInviteStatus] = useState<Record<string, string>>({});

  // Admin State
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    if (role === "patient") {
      const getPatientData = async () => {
        try {
          const [matchesData, invitesData] = await Promise.all([
            fetchWithAuth("/patients/me/matches"),
            fetchWithAuth("/patients/me/invitations")
          ]);
          
          if (Array.isArray(matchesData)) {
            setMatches(matchesData as TrialMatch[]);
          }
          if (Array.isArray(invitesData)) {
            setInvitations(invitesData as PatientInvitation[]);
          }
        } catch (error) {
          console.error("Failed to load patient data", error);
        } finally {
          setLoadingMatches(false);
        }
      };
      getPatientData();
    } else if (role === "researcher") {
      const getTrials = async () => {
        try {
          const data = await fetchWithAuth("/researchers/trials");
          if (Array.isArray(data)) {
            setTrials(data);
          }
        } catch (error) {
          console.error("Failed to load trials", error);
        }
      };
      getTrials();
    } else if (role === "admin") {
      const getStats = async () => {
        try {
          const data = await fetchWithAuth("/admin/stats");
          setStats(data as AdminStats);
        } catch (error) {
          console.error("Failed to load stats", error);
        }
      };
      getStats();
    }
  }, [role]);

  useEffect(() => {
    if (role === "researcher" && selectedTrial) {
      const getPatients = async () => {
        try {
          const data = await fetchWithAuth(`/researchers/trials/${selectedTrial}/patients`);
          if (Array.isArray(data)) {
            setMatchedPatients(data);
          }
        } catch (error) {
          console.error("Failed to load matched patients", error);
        }
      };
      getPatients();
    }
  }, [selectedTrial, role]);

  const handleInvitePatient = async (patientId: string) => {
    if (!selectedTrial) return;
    
    setInviteStatus(prev => ({ ...prev, [patientId]: 'sending' }));
    
    try {
      await fetchWithAuth(`/researchers/trials/${selectedTrial}/invite`, {
        method: "POST",
        body: JSON.stringify({ patient_id: patientId })
      });
      setInviteStatus(prev => ({ ...prev, [patientId]: 'sent' }));
      alert(`Invite sent to ${patientId} for trial ${selectedTrial}!`);
    } catch (error) {
      console.error("Failed to send invite", error);
      setInviteStatus(prev => ({ ...prev, [patientId]: 'error' }));
      alert("Error sending invitation.");
    }
  };

  const handleInvitationStatus = async (inviteId: string, status: string) => {
    try {
      await fetchWithAuth(`/patients/me/invitations/${inviteId}`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
      // Optimistically update the UI
      setInvitations(prev => prev.map(inv => 
        inv.invite_id === inviteId ? { ...inv, status } : inv
      ));
    } catch (error) {
      console.error(`Failed to ${status} invitation`, error);
      alert(`Error trying to ${status} invitation.`);
    }
  };

  const syncTrials = async () => {
    try {
      // First, get the user's current conditions
      const profile = await fetchWithAuth("/patients/me");
      
      // Build a comprehensive query using all patient data
      const queryParts = [];
      if (profile.conditions) queryParts.push(profile.conditions);
      if (profile.genes) queryParts.push(profile.genes);
      
      const queryToSync = queryParts.join(" ") || "cancer";
      
      alert(`Syncing trials from ClinicalTrials.gov for '${queryToSync}' (this takes a few seconds to embed)...`);
      await fetchWithAuth(`/trials/sync?query=${encodeURIComponent(queryToSync)}&limit=5`, { method: "POST" });
      alert("Synced! Refreshing matches...");
      window.location.reload();
    } catch {
      alert("Error syncing trials");
    }
  }

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Searching global database for: ${searchQuery}`);
  };

  return (
    <ProtectedRoute allowedRoles={[role]}>
      <div className="min-h-screen bg-slate-50/50 relative">
        {/* Background decorative blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-400/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <header className="border-b border-slate-200/50 bg-white/70 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <div className="font-extrabold text-xl tracking-tight text-blue-700 flex items-center gap-2 shrink-0">
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xl shadow-md">T</span>
              TrialBridge AI
            </div>
            
            <form onSubmit={handleGlobalSearch} className="flex-1 max-w-md hidden md:flex">
              <div className="relative w-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <Input 
                  type="search" 
                  placeholder="Search trials, patients, or NCT IDs..." 
                  className="w-full bg-slate-100/50 border-slate-200 pl-10 focus:bg-white transition-colors rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            <div className="flex gap-4 items-center shrink-0">
              <span className="text-sm font-semibold text-slate-600 capitalize bg-slate-100 px-3 py-1 rounded-full">{role} Portal</span>
              <Button variant="outline" size="sm" onClick={logout} className="rounded-full border-slate-200 hover:bg-slate-100">
                Sign Out
              </Button>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-10 z-10 relative">
          <div className="flex items-end justify-between mb-8 animate-fade-in-up">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 capitalize tracking-tight">{role} Dashboard</h1>
              <p className="text-slate-500 mt-1">Manage your data, view insights, and access AI matches.</p>
            </div>
          </div>
          
          {role === "admin" ? (
            <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/40 hover:-translate-y-1 transition-transform">
                  <div className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-300"></div> Total Patients</div>
                  <div className="text-4xl font-extrabold text-slate-900">{stats?.total_patients || 0}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/40 hover:-translate-y-1 transition-transform">
                  <div className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-300"></div> Total Researchers</div>
                  <div className="text-4xl font-extrabold text-slate-900">{stats?.total_researchers || 0}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/40 hover:-translate-y-1 transition-transform">
                  <div className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-300"></div> Active Trials</div>
                  <div className="text-4xl font-extrabold text-slate-900">{stats?.total_trials || 0}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl border border-blue-500 shadow-lg shadow-blue-600/30 text-white hover:-translate-y-1 transition-transform relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                  <div className="text-sm font-medium text-blue-100 mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div> AI Matches Found</div>
                  <div className="text-4xl font-extrabold text-white relative z-10">{stats?.active_matches || 0}</div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
                <h2 className="text-xl font-bold text-slate-900 mb-2">System Controls</h2>
                <p className="text-slate-500 mb-6 font-medium">Manage the platform and manually trigger background jobs.</p>
                <div className="flex gap-4">
                  <Button onClick={() => alert('Triggering Global Sync (Mock)')} className="rounded-full bg-slate-900 hover:bg-slate-800 shadow-md">Trigger Global Sync</Button>
                  <Button variant="outline" onClick={() => alert('Re-indexing Qdrant (Mock)')} className="rounded-full border-slate-200">Re-index Vector DB</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40">
                   <div className="flex items-center gap-4 mb-2">
                     <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                       {user?.email?.[0].toUpperCase()}
                     </div>
                     <div>
                       <h2 className="text-xl font-bold text-slate-900">Welcome back!</h2>
                       <p className="text-slate-500 text-sm">Logged in as <span className="font-medium text-slate-700">{user?.email}</span></p>
                     </div>
                   </div>
                </div>
                
                {role === "patient" && (
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden">
                    <PatientProfileForm />
                  </div>
                )}

                {role === "researcher" && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">My Clinical Trials</h2>
                    {trials.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <div className="text-4xl mb-3">📋</div>
                        <p>No active trials found.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {trials.map(t => (
                          <div 
                            key={t.nct_id} 
                            onClick={() => setSelectedTrial(t.nct_id)}
                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedTrial === t.nct_id ? 'bg-blue-50/50 border-blue-500 shadow-md shadow-blue-500/10' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'}`}
                          >
                            <div className={`font-bold mb-1 ${selectedTrial === t.nct_id ? 'text-blue-900' : 'text-slate-700'}`}>{t.title}</div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{t.nct_id}</span>
                              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{t.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="lg:col-span-7 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {role === "patient" && (
                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 min-h-[500px]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">My Trial Invitations</h2>
                        <p className="text-slate-500 text-sm mt-1">Direct invites from clinical researchers</p>
                      </div>
                    </div>
                    
                    {invitations.length === 0 ? (
                      <div className="text-center py-10 mb-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <div className="text-4xl mb-4">📬</div>
                        <p className="text-sm max-w-sm mx-auto leading-relaxed">No invitations received yet. Make sure your profile is complete to attract researchers.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 mb-8">
                        {invitations.map((inv, i) => (
                          <div key={i} className="group relative border border-emerald-100 p-5 rounded-2xl bg-emerald-50/30 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 rounded-l-2xl"></div>
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                              <div>
                                <h3 className="font-bold text-lg text-slate-900 leading-tight">{inv.trial.title}</h3>
                                <div className="flex flex-wrap gap-2 text-sm font-medium mt-2">
                                  <span className="text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-100">{inv.trial.nct_id}</span>
                                  <span className="text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-100">📍 {inv.trial.location}</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 shrink-0">
                                {inv.status === 'pending' ? (
                                  <>
                                    <Button size="sm" onClick={() => handleInvitationStatus(inv.invite_id, 'accepted')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full">Accept Invite</Button>
                                    <Button size="sm" variant="outline" onClick={() => handleInvitationStatus(inv.invite_id, 'declined')} className="rounded-full">Decline</Button>
                                  </>
                                ) : (
                                  <span className={`text-sm font-bold px-4 py-2 rounded-full text-center ${inv.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                    {inv.status === 'accepted' ? 'Accepted ✓' : 'Declined'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pt-8 border-t border-slate-100">
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">AI Trial Matches</h2>
                        <p className="text-slate-500 text-sm mt-1">Powered by semantic vector analysis</p>
                      </div>
                      <Button variant="default" className="rounded-full shadow-md bg-blue-600 hover:bg-blue-700" onClick={syncTrials}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Simulate Trial Sync
                      </Button>
                    </div>
                    
                    {loadingMatches ? (
                      <div className="flex flex-col items-center justify-center py-20 text-blue-600">
                        <svg className="animate-spin h-10 w-10 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="font-semibold text-slate-600">Analyzing clinical matrices...</p>
                      </div>
                    ) : matches.length === 0 ? (
                      <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <div className="text-5xl mb-4">🤖</div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No matches found yet</h3>
                        <p className="text-sm max-w-sm mx-auto leading-relaxed">Update your medical profile with accurate conditions and genomic markers, then run a sync to let our AI find suitable clinical trials.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {matches.map((match, i) => (
                          <div key={i} className="group relative border border-slate-100 p-6 rounded-2xl bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 rounded-l-2xl"></div>
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                              <h3 className="font-bold text-lg text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">{match.title}</h3>
                              <div className="flex flex-col items-end shrink-0">
                                <span className={`text-sm font-extrabold px-3 py-1.5 rounded-full ${parseFloat(match.compatibility_score) > 85 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {match.compatibility_score}% Match
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 text-sm font-medium mb-4">
                              <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{match.nct_id}</span>
                              <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{match.status}</span>
                              <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded-md">📍 {match.location}</span>
                            </div>
                            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                              <p className="text-sm text-slate-700 font-medium italic">
                                &quot;{match.explanation}&quot;
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {role === "researcher" && selectedTrial && (
                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="mb-8">
                      <h2 className="text-2xl font-extrabold text-slate-900">Candidate Pipeline</h2>
                      <p className="text-slate-500 text-sm mt-1">AI-matched patients for <span className="font-semibold text-blue-600">{selectedTrial}</span></p>
                    </div>
                    
                    {matchedPatients.length === 0 ? (
                      <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Awaiting candidates</h3>
                        <p className="text-sm max-w-sm mx-auto leading-relaxed">No patients match this trial&apos;s inclusion criteria yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {matchedPatients.map((p, i) => (
                          <div key={i} className="group border border-slate-100 p-6 rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                  {p.patient_id.substring(0,2).toUpperCase()}
                                </div>
                                <div>
                                  <h3 className="font-bold text-slate-900">Anonymized Candidate</h3>
                                  <span className="text-xs font-semibold text-slate-400">ID: {p.patient_id}</span>
                                </div>
                              </div>
                              <span className={`text-sm font-extrabold px-3 py-1.5 rounded-full ${p.compatibility_score > 85 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {p.compatibility_score}% Match
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Conditions</div>
                                <div className="text-sm font-medium text-slate-700">{p.conditions || "None reported"}</div>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Genomic Markers</div>
                                <div className="text-sm font-medium text-slate-700">{p.genes || "None reported"}</div>
                              </div>
                            </div>

                            <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 mb-4">
                              <p className="text-sm text-slate-700 font-medium italic">
                                &quot;{p.explanation}&quot;
                              </p>
                            </div>
                            
                            <div className="flex justify-end mt-4">
                              <Button 
                                onClick={() => handleInvitePatient(p.patient_id)}
                                disabled={inviteStatus[p.patient_id] === 'sending' || inviteStatus[p.patient_id] === 'sent'}
                                className={`${inviteStatus[p.patient_id] === 'sent' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'} text-white rounded-full shadow-md px-6 transition-transform hover:-translate-y-0.5`}
                              >
                                {inviteStatus[p.patient_id] === 'sending' ? 'Sending...' : 
                                 inviteStatus[p.patient_id] === 'sent' ? 'Invited ✓' : 
                                 'Invite to Trial'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {role === "researcher" && !selectedTrial && (
                  <div className="flex items-center justify-center h-[500px] border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 text-slate-400 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="text-center">
                      <div className="text-6xl mb-4 opacity-50">🔬</div>
                      <p className="font-semibold text-lg">Select a trial to view candidates</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
