import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms and conditions — evently",
  description: "The terms for using evently to discover, organize, and attend events.",
};

export default function TermsPage() {
  return <LegalPage eyebrow="Terms and conditions" title={<>Good experiences<br /><span className="text-[#968aa0]">need clear rules.</span></>} intro="These terms describe the basic rules for using evently to discover events, submit bookings, manage an organizer workspace, and attend experiences." updatedAt="September 17, 2026" sections={[
    { title: "Using evently", children: <p>By browsing or using evently, you agree to use the service lawfully and respectfully. If you use evently for an organization, you confirm that you have authority to act for that organization. If you do not agree with these terms, please do not use the service.</p> },
    { title: "Events and organizers", children: <p>Event listings are created and managed by organizers. Organizers are responsible for the accuracy of their event descriptions, schedules, venues, ticket inventory, prices, payment destinations, and attendee communications. evently may remove or restrict a listing that violates these terms or creates a safety, legal, or trust concern.</p> },
    { title: "Bookings and payment review", children: <p>A booking submitted through evently is a request recorded as <strong>PENDING</strong>. It is not an admission ticket until the organizer verifies the payment reference and confirms the booking. An organizer may decline a booking when payment cannot be verified, inventory is unavailable, or the event is changed or cancelled. Do not submit passwords, UPI PINs, card numbers, or banking credentials.</p> },
    { title: "Tickets and attendance", children: <p>Confirmed tickets are personal to the booking unless the organizer permits a transfer. Attendees must present a valid ticket or ticket link at entry and follow the venue’s safety and conduct rules. Each confirmed booking may be checked in once. Attempting to reuse, duplicate, alter, or misuse a ticket can result in denied entry and account or booking restrictions.</p> },
    { title: "Cancellations and refunds", children: <p>Event cancellation, postponement, refund, and transfer policies may differ by event and are handled by the responsible organizer unless applicable law requires otherwise. Contact the organizer using the details on the event page for event-specific help. evently cannot promise a refund for a payment made outside its control.</p> },
    { title: "Accounts and workspace access", children: <p>Administrator accounts must use accurate details and keep their login credentials confidential. Administrators are responsible for activity performed through their account, including event content, payment QR settings, booking decisions, and access to attendee information. Tell us promptly if you believe an account has been compromised.</p> },
    { title: "Content and acceptable use", children: <p>You may not use evently to upload unlawful, deceptive, abusive, infringing, malicious, or harmful content; impersonate another person; interfere with the service; harvest personal information; or attempt to access another workspace. You retain responsibility for the content you submit and must have the rights needed to use it.</p> },
    { title: "Availability and responsibility", children: <p>We work to keep evently useful and available, but the service may occasionally change, pause, or experience errors. Evently is a platform for connecting people with event information and organizers; it does not control the quality, safety, legality, or outcome of an event. To the extent permitted by law, use the service at your own judgment and risk.</p> },
    { title: "Changes to these terms", children: <p>We may update these terms as the service evolves. The updated version will be posted on this page with a revised date. Continuing to use evently after an update means you accept the revised terms.</p> },
    { title: "Contact", children: <p>Questions about these terms can be sent to <a className="font-semibold text-[#d95742] hover:underline" href="mailto:shahshubham1888@gmail.com">shahshubham1888@gmail.com</a>.</p> },
  ]} />;
}
