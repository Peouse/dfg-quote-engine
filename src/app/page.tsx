"use client";

import { useAppContext } from "@/context/AppContext";
import LeadCapture from "@/components/LeadCapture";
import InteractiveCatalog from "@/components/InteractiveCatalog";
import MyProforma from "@/components/MyProforma";
import HandoffSuccess from "@/components/HandoffSuccess";

export default function Home() {
  const { currentStep } = useAppContext();

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans sm:px-4 sm:py-6">
      <div className="mx-auto max-w-5xl shadow-sm sm:rounded-xl sm:border border-gray-200 overflow-hidden bg-white min-h-[100dvh] sm:min-h-[80vh]">
        {currentStep === 1 && <LeadCapture />}
        {currentStep === 2 && <InteractiveCatalog />}
        {currentStep === 3 && <MyProforma />}
        {currentStep === 4 && <HandoffSuccess />}
      </div>
    </main>
  );
}
