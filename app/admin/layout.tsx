"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const publicAdminPaths = ["/admin/login"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublicAuthPage = publicAdminPaths.includes(pathname);
  const [verifiedPath, setVerifiedPath] = useState<string | null>(null);

  useEffect(() => {
    if (isPublicAuthPage) {
      return;
    }
    fetch("/api/admin/session")
      .then((response) => {
        if (!response.ok) {
          router.replace("/admin/login");
          return;
        }
        setVerifiedPath(pathname);
      })
      .catch(() => router.replace("/admin/login"));
  }, [isPublicAuthPage, pathname, router]);

  if (isPublicAuthPage || verifiedPath === pathname) return children;
  return <div className="flex min-h-screen items-center justify-center bg-[#f5f6f3] text-[12px] text-[#7b847d]">Securing your admin workspace…</div>;
}
