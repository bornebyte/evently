import { DataLoading } from "@/components/empty-state";

export default function Loading() {
  return <main className="min-h-screen bg-[#f7f7f4] px-5 py-20"><div className="mx-auto max-w-[1280px]"><DataLoading label="Finding your next story" /></div></main>;
}
