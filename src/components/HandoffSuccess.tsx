"use client";

import { useAppContext } from "@/context/AppContext";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

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
                        Datos transmitidos correctamente. Presenta este código QR a un agente en counter para finalizar la transacción.
                    </p>
                </div>

                {/* QR Code Container */}
                <div className="bg-white p-6 border-4 border-zinc-200 shadow-[0_0_30px_rgba(59,130,246,0.15)] mb-12 relative group">
                    {/* Tech corners */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-blue-500"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-blue-500"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-blue-500"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-blue-500"></div>

                    <QRCodeSVG
                        value={proformaId || "placeholder-id"}
                        size={220}
                        bgColor={"#ffffff"}
                        fgColor={"#09090b"}
                        level={"H"}
                    />
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">ID de Sesión</span>
                        <span className="text-xs text-zinc-950 font-mono font-bold tracking-widest break-all">
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
