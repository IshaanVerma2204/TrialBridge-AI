"use client";

import { useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";

export default function DashboardPage({ params }: { params: { role: string } }) {
  const { user, logout } = useAuth();
  
  // Unwrap params conceptually (Next.js 15+ allows params to be a promise, but keeping it simple)
  const role = params.role; 

  return (
    <ProtectedRoute allowedRoles={[role]}>
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-4 capitalize">{role} Dashboard</h1>
        <p className="text-gray-600 mb-8">
          Welcome, {user?.email}. You are logged in with the <strong>{user?.role}</strong> role.
        </p>
        
        <div className="flex gap-4">
          <Button onClick={logout} variant="outline">Logout</Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
