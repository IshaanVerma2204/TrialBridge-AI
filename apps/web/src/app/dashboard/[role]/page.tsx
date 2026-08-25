"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { PatientProfileForm } from "@/components/PatientProfileForm";
import { fetchWithAuth } from "@/lib/api-client";

export default function DashboardPage(props: { params: Promise<{ role: string }> }) {
  const { user, logout } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  
  // Next.js 15 requires awaiting/using params
  const params = use(props.params);
  const role = params.role; 

  useEffect(() => {
    if (role === "patient") {
      const getMatches = async () => {
        try {
          const data = await fetchWithAuth("/patients/me/matches");
          if (Array.isArray(data)) {
            setMatches(data);
          }
        } catch (error) {
          console.error("Failed to load matches", error);
        } finally {
          setLoadingMatches(false);
        }
      };
      getMatches();
    }
  }, [role]);

  const syncTrials = async () => {
    try {
      alert("Syncing trials from ClinicalTrials.gov (this takes a few seconds to embed)...");
      await fetchWithAuth("/trials/sync?condition=diabetes&limit=5", { method: "POST" });
      alert("Synced! Refreshing matches...");
      window.location.reload();
    } catch(e) {
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
                            "{match.explanation}"
                          </p>
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
