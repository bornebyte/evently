import ContactInboxPage from "./contact-client";

// The inbox loads authenticated messages in its client component.
export const instant = false;

export default function ContactPage() {
  return <ContactInboxPage />;
}
