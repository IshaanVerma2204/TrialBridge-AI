"use client";

import { use } from "react";
import { useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { PatientProfileForm } from "@/components/PatientProfileForm";

export default function DashboardPage(props: { params: Promise<{ role: string }> }) {
  const { user, logout } = useAuth();
  
  // Next.js 15 requires awaiting/using params
  const params = use(props.params);
  const role = params.role; 

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
                  <h2 className="text-xl font-semibold mb-4">AI Trial Matches</h2>
                  <div className="text-center py-12 text-slate-500 border-2 border-dashed rounded-lg">
                    <p>No matches yet.</p>
                    <p className="text-sm mt-2">Update your medical profile to let our AI find suitable clinical trials.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
