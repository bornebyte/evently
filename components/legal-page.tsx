import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type LegalSection = { id?: string; title: string; children: ReactNode };

export function LegalPage({ eyebrow, title, intro, updatedAt, sections }: { eyebrow: string; title: ReactNode; intro: string; updatedAt: string; sections: LegalSection[] }) {
  return (
    <main className="min-h-screen bg-[#f7f7f4] text-[#242725]">
      <div className="border-b border-[#e8eae5]"><SiteHeader /></div>
      <section className="bg-[#e8e3ef] px-5 pb-14 pt-14 lg:px-8 lg:pb-18 lg:pt-20">
        <div className="mx-auto max-w-[1000px]">
          <Link className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#746a7d] hover:text-[#242725]" href="/"><ArrowLeft size={14} /> Back to evently</Link>
          <p className="mt-12 text-[11px] font-bold uppercase tracking-[0.18em] text-[#e15f49]">{eyebrow}</p>
          <h1 className="mt-3 max-w-[760px] font-display text-[clamp(3rem,7vw,6rem)] leading-[0.88]">{title}</h1>
          <p className="mt-6 max-w-[620px] text-[15px] leading-7 text-[#756d7e]">{intro}</p>
          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#95899e]">Last updated · {updatedAt}</p>
        </div>
      </section>
      <section className="px-5 py-12 lg:px-8 lg:py-16">
        <article className="mx-auto max-w-[1000px] divide-y divide-[#e4e6e0] rounded-[24px] border border-[#e1e5df] bg-white px-5 sm:px-8 lg:px-12">
          {sections.map((section) => <section className="py-8 first:pt-9 last:pb-10 sm:py-10" id={section.id} key={section.title}><h2 className="text-[21px] font-semibold tracking-[-0.045em]">{section.title}</h2><div className="mt-4 max-w-[760px] space-y-4 text-[13px] leading-6 text-[#69746c]">{section.children}</div></section>)}
        </article>
      </section>
      <SiteFooter />
    </main>
  );
}
