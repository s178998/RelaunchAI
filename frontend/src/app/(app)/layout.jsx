"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/footer";

export default function AppLayout({ children }) {
  const router = useRouter();
  const [status, setStatus] = useState("loading"); // "loading" | "ok"

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("user");

    // Not authenticated -> landing page
    if (!token || !savedUser) {
      router.replace("/");
      return;
    }

    let userId = null;
    try {
      userId = JSON.parse(savedUser).id;
    } catch {
      userId = null;
    }

    // Authenticated but onboarding not complete -> onboarding
    const hasCompleted =
      userId && localStorage.getItem(`onboarding_complete_${userId}`) === "true";
    if (!hasCompleted) {
      router.replace("/onboarding");
      return;
    }

    setStatus("ok");
  }, [router]);

  if (status !== "ok") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen bg-white">
        <Topbar />
        <main className="flex-1 bg-white">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
