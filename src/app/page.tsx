"use client";

import { useAppContext } from "@/context/AppContext";
import LeadCapture from "@/components/LeadCapture";
import InteractiveCatalog from "@/components/InteractiveCatalog";
import MyProforma from "@/components/MyProforma";
import HandoffSuccess from "@/components/HandoffSuccess";

export default function Home() {
  const { currentStep } = useAppContext();

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 font-sans sm:p-4 lg:p-8 flex flex-col items-center justify-center data-texture relative">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-200/50 to-transparent pointer-events-none"></div>

      <div className="w-full max-w-7xl shadow-xl sm:border border-zinc-200 bg-white min-h-[100dvh] sm:min-h-[85vh] relative z-10 flex flex-col flex-grow">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-600"></div>

        <div className="flex-1 flex flex-col relative pb-10">
          {currentStep === 1 && <LeadCapture />}
          {currentStep === 2 && <InteractiveCatalog />}
          {currentStep === 3 && <MyProforma />}
          {currentStep === 4 && <HandoffSuccess />}
        </div>
      </div>

      {/* Powered by Signature */}
      <div className="w-full max-w-7xl mt-4 sm:mt-6 flex justify-center pb-4 sm:pb-0 relative z-10">
        <p className="text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors cursor-default font-mono tracking-widest uppercase">
          Powered by Antis Analytica
        </p>
      </div>
    </main>
  );
}
