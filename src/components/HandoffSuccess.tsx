"use client";

import { useAppContext } from "@/context/AppContext";
import { CheckCircle2, RotateCcw } from "lucide-react";

export default function HandoffSuccess() {
    const { proformaId, setLeadData } = useAppContext();

    // Reset the flow to start over
    const handleStartOver = () => {
        setLeadData({
            fullName: "",
            company: "",
            whatsapp: "",
            email: "",
            profileTag: "",
            interestTags: [],
        });
        window.location.reload();
    };

    return (
        <div className="flex flex-col h-full bg-zinc-50 p-6 md:p-12 items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-500 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 data-texture opacity-30 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-center mb-10 w-full relative">
                    <img src="/logo.png" alt="DFG Logo" className="h-10 object-contain z-10" />
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent z-0"></div>
                </div>

                {/* Checkmark Animation */}
                <div className="mb-8 relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                    <CheckCircle2 size={72} className="text-blue-500 relative z-10" />
                </div>

                <div className="text-center space-y-4 mb-10">
                    <h1 className="text-2xl font-mono font-bold text-zinc-950 tracking-widest uppercase">Registro Exitoso</h1>
                    <p className="text-sm text-zinc-500 font-mono leading-relaxed">
                        Datos transmitidos correctamente. El agente en counter procesará tu solicitud en breve.
                    </p>
                </div>
                
                <div className="bg-white p-6 border border-zinc-200 shadow-sm mb-12 w-full max-w-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-500 font-mono uppercase tracking-widest">ID de Sesión</span>
                        <span className="text-sm text-zinc-950 font-mono font-bold tracking-widest">
                            {proformaId?.substring(0, 8) || "XXXX"}
                        </span>
                    </div>
                </div>

                {/* Start Over Action */}
                <button
                    onClick={handleStartOver}
                    className="text-xs font-mono font-bold text-zinc-500 hover:text-zinc-950 uppercase tracking-widest flex items-center gap-3 transition-colors px-6 py-3 border border-zinc-300 hover:border-zinc-400 bg-white shadow-sm hover:shadow"
                >
                    <RotateCcw size={14} />
                    Inicializar Nueva Sesión
                </button>
            </div>
        </div>
    );
}
