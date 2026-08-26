// Simple fetch wrapper to auto-inject the auth token
export async function fetchClient(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "An unexpected error occurred");
  }

  return response.json();
}

export const fetchWithAuth = fetchClient;

export const patientApi = {
  getProfile: () => fetchClient('/patients/me'),
  updateProfile: (data: Record<string, unknown>) => fetchClient('/patients/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getInvitations: () => fetchClient('/patients/me/invitations'),
  updateInvitation: (inviteId: string, status: string) => fetchClient(`/patients/me/invitations/${inviteId}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
};

export const researcherApi = {
  getTrials: () => fetchClient('/researchers/trials'),
  getMatchedPatients: (nctId: string) => fetchClient(`/researchers/trials/${nctId}/patients`),
  invitePatient: (nctId: string, patientId: string) => fetchClient(`/researchers/trials/${nctId}/invite`, {
    method: 'POST',
    body: JSON.stringify({ patient_id: patientId })
  }),
};

export const adminApi = {
  getStats: () => fetchClient('/admin/stats'),
};
