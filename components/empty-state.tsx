import type { ReactNode } from "react";
import { Sparkles } from "@/components/icons";

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="empty-state relative overflow-hidden rounded-[24px] border border-[#e1e5df] bg-white px-6 py-16 text-center sm:px-10">
      <div aria-hidden="true" className="empty-orbit mx-auto h-20 w-20">
        <span className="empty-orbit-ring empty-orbit-ring-one" />
        <span className="empty-orbit-ring empty-orbit-ring-two" />
        <span className="empty-orbit-core"><Sparkles size={21} /></span>
      </div>
      <p className="mt-7 font-display text-[clamp(2rem,4vw,2.8rem)] leading-none text-[#242725]">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-[13px] leading-5 text-[#7b847d]">{description}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function DataLoading({ label = "Gathering the good stuff" }: { label?: string }) {
  return (
    <div aria-label={label} className="flex min-h-48 flex-col items-center justify-center rounded-[24px] border border-[#e1e5df] bg-white text-center" role="status">
      <div aria-hidden="true" className="loading-breathe flex h-12 w-12 items-center justify-center rounded-full bg-[#f7ded7] text-[#d95742]"><Sparkles size={18} /></div>
      <p className="mt-4 text-[12px] font-semibold text-[#69746c]">{label}<span className="loading-dots" /></p>
    </div>
  );
}
