import AdminEventForm from "@/components/admin-event-form";

// The editor owns its interactive form state on the client.
export const instant = false;

export default function NewEventPage() {
  return <AdminEventForm mode="create" />;
}
