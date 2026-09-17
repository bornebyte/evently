import type { ReactNode } from "react";

type IconProps = { size?: number; className?: string; strokeWidth?: number };

function Icon({ size = 20, className = "", strokeWidth = 1.8, children }: IconProps & { children: ReactNode }) {
  return <svg aria-hidden="true" className={className} fill="none" height={size} viewBox="0 0 24 24" width={size} xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}>{children}</svg>;
}

export function ArrowUpRight(props: IconProps) { return <Icon {...props}><path d="M7 17 17 7" /><path d="M7 7h10v10" /></Icon>; }
export function ArrowDownRight(props: IconProps) { return <Icon {...props}><path d="m7 7 10 10" /><path d="M17 7v10H7" /></Icon>; }
export function ArrowRight(props: IconProps) { return <Icon {...props}><path d="M4 12h16" /><path d="m13 5 7 7-7 7" /></Icon>; }
export function ArrowLeft(props: IconProps) { return <Icon {...props}><path d="M20 12H4" /><path d="m11 19-7-7 7-7" /></Icon>; }
export function Search(props: IconProps) { return <Icon {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icon>; }
export function CalendarDays(props: IconProps) { return <Icon {...props}><rect height="17" rx="2" width="18" x="3" y="4" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></Icon>; }
export function MapPin(props: IconProps) { return <Icon {...props}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></Icon>; }
export function Bookmark(props: IconProps) { return <Icon {...props}><path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z" /></Icon>; }
export function Heart(props: IconProps) { return <Icon {...props}><path d="M20.8 8.7c0 5.4-8.8 10.3-8.8 10.3S3.2 14.1 3.2 8.7A4.6 4.6 0 0 1 12 6.5a4.6 4.6 0 0 1 8.8 2.2Z" /></Icon>; }
export function Clock3(props: IconProps) { return <Icon {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>; }
export function Users(props: IconProps) { return <Icon {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></Icon>; }
export function Menu(props: IconProps) { return <Icon {...props}><path d="M4 6h16M4 12h16M4 18h16" /></Icon>; }
export function X(props: IconProps) { return <Icon {...props}><path d="m6 6 12 12M18 6 6 18" /></Icon>; }
export function ChevronDown(props: IconProps) { return <Icon {...props}><path d="m6 9 6 6 6-6" /></Icon>; }
export function ChevronRight(props: IconProps) { return <Icon {...props}><path d="m9 18 6-6-6-6" /></Icon>; }
export function ChevronLeft(props: IconProps) { return <Icon {...props}><path d="m15 18-6-6 6-6" /></Icon>; }
export function SlidersHorizontal(props: IconProps) { return <Icon {...props}><path d="M21 4H14M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3" /><circle cx="12" cy="4" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="14" cy="20" r="2" /></Icon>; }
export function Sparkles(props: IconProps) { return <Icon {...props}><path d="m12 3-1.3 4.2a4 4 0 0 1-2.7 2.7L3.8 11l4.2 1.3a4 4 0 0 1 2.7 2.7L12 19.2l1.3-4.2a4 4 0 0 1 2.7-2.7l4.2-1.3-4.2-1.1a4 4 0 0 1-2.7-2.7L12 3ZM19 16l-.6 1.8a2 2 0 0 1-1.4 1.4L15.2 20l1.8.6a2 2 0 0 1 1.4 1.4L19 23l.6-1.8a2 2 0 0 1 1.4-1.4l1.8-.6-1.8-.8a2 2 0 0 1-1.4-1.4L19 16Z" /></Icon>; }
export function Ticket(props: IconProps) { return <Icon {...props}><path d="M3 7.5A2.5 2.5 0 0 0 5.5 10v4A2.5 2.5 0 0 0 3 16.5V19h18v-2.5a2.5 2.5 0 0 0-2.5-2.5v-4A2.5 2.5 0 0 0 21 7.5V5H3v2.5Z" /><path d="M12 5v2M12 10v2M12 15v2" /></Icon>; }
export function Bell(props: IconProps) { return <Icon {...props}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></Icon>; }
export function LayoutDashboard(props: IconProps) { return <Icon {...props}><rect height="7" rx="1.5" width="7" x="3" y="3" /><rect height="7" rx="1.5" width="7" x="14" y="3" /><rect height="7" rx="1.5" width="7" x="3" y="14" /><rect height="7" rx="1.5" width="7" x="14" y="14" /></Icon>; }
export function BarChart3(props: IconProps) { return <Icon {...props}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></Icon>; }
export function Settings(props: IconProps) { return <Icon {...props}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-2.4v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L8 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6v-2.4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L7.3 8.6 9 6.9l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.4v.8a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1Z" /></Icon>; }
export function Plus(props: IconProps) { return <Icon {...props}><path d="M12 5v14M5 12h14" /></Icon>; }
export function MoreHorizontal(props: IconProps) { return <Icon {...props}><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></Icon>; }
export function Download(props: IconProps) { return <Icon {...props}><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></Icon>; }
export function TrendingUp(props: IconProps) { return <Icon {...props}><path d="m3 17 6-6 4 4 7-8" /><path d="M15 7h5v5" /></Icon>; }
export function CheckCircle2(props: IconProps) { return <Icon {...props}><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></Icon>; }
export function Share2(props: IconProps) { return <Icon {...props}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></Icon>; }
export function ExternalLink(props: IconProps) { return <Icon {...props}><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></Icon>; }
export function QrCode(props: IconProps) { return <Icon {...props}><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2M20 14h.01M14 18h2M18 18h2M18 20h2" /></Icon>; }
export function ShieldCheck(props: IconProps) { return <Icon {...props}><path d="M12 3 20 6v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.3 2.3 4.8-5" /></Icon>; }
export function Globe2(props: IconProps) { return <Icon {...props}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></Icon>; }
export function CircleHelp(props: IconProps) { return <Icon {...props}><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.3 2.3 0 1 1 3.8 1.8c-1.1.9-1.6 1.2-1.6 2.7M12 17h.01" /></Icon>; }
export function Star(props: IconProps) { return <Icon {...props}><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.1-5.6-2.9-5.6 2.9 1.1-6.1L3 9.6l6.2-.9L12 3Z" /></Icon>; }
export function Mail(props: IconProps) { return <Icon {...props}><rect height="14" rx="2" width="18" x="3" y="5" /><path d="m3 7 9 6 9-6" /></Icon>; }
export function CreditCard(props: IconProps) { return <Icon {...props}><rect height="14" rx="2" width="18" x="3" y="5" /><path d="M3 10h18M7 15h3" /></Icon>; }
export function Filter(props: IconProps) { return <Icon {...props}><path d="M4 6h16M7 12h10M10 18h4" /></Icon>; }
export function Minus(props: IconProps) { return <Icon {...props}><path d="M5 12h14" /></Icon>; }
export function Instagram(props: IconProps) { return <Icon {...props}><rect height="16" rx="4" width="16" x="4" y="4" /><circle cx="12" cy="12" r="3.5" /><path d="M17.5 6.5h.01" /></Icon>; }
export function Linkedin(props: IconProps) { return <Icon {...props}><path d="M7 9v8M7 6v.01M11 17v-4a4 4 0 0 1 8 0v4M11 12a3 3 0 0 1 3-3" /></Icon>; }
export function LogOut(props: IconProps) { return <Icon {...props}><path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6" /></Icon>; }
export function ScanLine(props: IconProps) { return <Icon {...props}><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10M12 7v10" /></Icon>; }
export function Copy(props: IconProps) { return <Icon {...props}><rect height="13" rx="2" width="13" x="8" y="8" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></Icon>; }
export function Save(props: IconProps) { return <Icon {...props}><path d="M5 4h12l2 2v14H5V4Z" /><path d="M8 4v6h8V4M9 20v-6h6v6" /></Icon>; }
export function LockKeyhole(props: IconProps) { return <Icon {...props}><rect height="9" rx="2" width="14" x="5" y="10" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" /></Icon>; }
export function UserRound(props: IconProps) { return <Icon {...props}><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></Icon>; }
