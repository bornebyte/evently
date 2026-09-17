import AdminDashboard from "./dashboard-client";

// The dashboard authenticates and loads its live metrics on the client.
// It should not be treated as an instant server-prefetched segment.
export const instant = false;

export default function DashboardPage() {
  return <AdminDashboard />;
}
