import { DataLoading } from "@/components/empty-state";

export default function Loading() {
  return <main className="min-h-screen bg-[#f5f6f3] px-5 py-20"><div className="mx-auto max-w-[900px]"><DataLoading label="Securing your workspace" /></div></main>;
}
