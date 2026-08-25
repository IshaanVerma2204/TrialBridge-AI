"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
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

export default function DashboardPage(props: { params: Promise<{ role: string }> }) {
  const { user, logout } = useAuth();
  const [matches, setMatches] = useState<TrialMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  
  // Next.js 15 requires awaiting/using params
  const params = use(props.params);
  const role = params.role; 

  // Researcher State
  const [trials, setTrials] = useState<ResearcherTrial[]>([]);
  const [selectedTrial, setSelectedTrial] = useState<string | null>(null);
  const [matchedPatients, setMatchedPatients] = useState<ResearcherPatient[]>([]);

  useEffect(() => {
    if (role === "patient") {
      const getMatches = async () => {
        try {
          const data = await fetchWithAuth("/patients/me/matches");
          if (Array.isArray(data)) {
            setMatches(data as TrialMatch[]);
          }
        } catch (error) {
          console.error("Failed to load matches", error);
        } finally {
          setLoadingMatches(false);
        }
      };
      getMatches();
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

  const syncTrials = async () => {
    try {
      // First, get the user's current conditions
      const profile = await fetchWithAuth("/patients/me");
      const conditionToSync = profile.conditions || "cancer"; // Fallback to cancer if empty
      
      alert(`Syncing trials from ClinicalTrials.gov for '${conditionToSync}' (this takes a few seconds to embed)...`);
      await fetchWithAuth(`/trials/sync?condition=${encodeURIComponent(conditionToSync)}&limit=5`, { method: "POST" });
      alert("Synced! Refreshing matches...");
      window.location.reload();
    } catch {
      alert("Error syncing trials");
    }
  }

  return (
    <ProtectedRoute allowedRoles={[role]}>
      <div className="min-h-screen bg-slate-50">
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="font-bold text-xl tracking-tight text-blue-600">
              TrialBridge AI
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-sm font-medium text-slate-600 capitalize">{role} Portal</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-slate-900 capitalize">{role} Dashboard</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                 <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
                 <p className="text-slate-600 mb-2">You are logged in as <strong>{user?.email}</strong>.</p>
              </div>
              
              {role === "patient" && (
                <PatientProfileForm />
              )}

              {role === "researcher" && (
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">My Clinical Trials</h2>
                  {trials.length === 0 ? (
                    <div className="text-slate-500 text-sm">No trials found.</div>
                  ) : (
                    <div className="space-y-3">
                      {trials.map(t => (
                        <div 
                          key={t.nct_id} 
                          onClick={() => setSelectedTrial(t.nct_id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedTrial === t.nct_id ? 'bg-blue-50 border-blue-300' : 'hover:bg-slate-50'}`}
                        >
                          <div className="font-semibold text-blue-900">{t.title}</div>
                          <div className="text-xs text-slate-500 mt-1">{t.nct_id} • {t.status}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              {role === "patient" && (
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">AI Trial Matches</h2>
                    <Button variant="secondary" size="sm" onClick={syncTrials}>Simulate Trial Sync</Button>
                  </div>
                  
                  {loadingMatches ? (
                    <div className="text-center py-8 text-slate-500">Loading AI matches...</div>
                  ) : matches.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 border-2 border-dashed rounded-lg">
                      <p>No matches yet.</p>
                      <p className="text-sm mt-2">Update your medical profile or run a sync to let our AI find suitable clinical trials.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {matches.map((match, i) => (
                        <div key={i} className="border p-4 rounded-lg bg-blue-50/50">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-blue-900">{match.title}</h3>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">{match.compatibility_score}% Match</span>
                          </div>
                          <div className="text-sm text-slate-600 mb-2">
                            <span className="font-medium">{match.nct_id}</span> • {match.status} • {match.location}
                          </div>
                          <p className="text-sm text-slate-700 italic border-l-2 border-blue-300 pl-3">
                            &quot;{match.explanation}&quot;
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {role === "researcher" && selectedTrial && (
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Patient Candidate Pipeline</h2>
                  <p className="text-sm text-slate-600 mb-4">AI-matched patients for {selectedTrial}</p>
                  
                  {matchedPatients.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 border-2 border-dashed rounded-lg">
                      No matching patients found.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {matchedPatients.map((p, i) => (
                        <div key={i} className="border p-4 rounded-lg bg-emerald-50/50">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-emerald-900">{p.patient_id}</h3>
                            <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded font-bold">{p.compatibility_score}% Match</span>
                          </div>
                          <div className="text-sm text-slate-600 mb-2">
                            Age: {p.age} • Conditions: {p.conditions || "None"} • Genes: {p.genes || "None"}
                          </div>
                          <p className="text-sm text-slate-700 italic border-l-2 border-emerald-300 pl-3">
                            &quot;{p.explanation}&quot;
                          </p>
                          <div className="mt-3">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Invite to Trial</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
