import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // We can enforce basic authentication here. 
  // Role-specific access is handled at the page level.
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 p-8">
        {children}
      </div>
    </ProtectedRoute>
  );
}
