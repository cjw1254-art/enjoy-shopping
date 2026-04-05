"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ValuationRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/only-for-me"); }, [router]);
  return null;
}
