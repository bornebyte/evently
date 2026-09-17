import AdminEventForm from "@/components/admin-event-form";

export const instant = false;

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminEventForm eventId={id} mode="edit" />;
}
