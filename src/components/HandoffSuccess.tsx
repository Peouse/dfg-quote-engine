"use client";

import { useAppContext } from "@/context/AppContext";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function HandoffSuccess() {
    const { proformaId, setLeadData } = useAppContext();

    // Reset the flow to start over
    const handleStartOver = () => {
        // Optional: Clear lead data, clear cart
        // Keep cart logic: Let's simply redirect to screen 1 to start fresh for a new lead
        setLeadData({
            fullName: "",
            company: "",
            whatsapp: "",
            email: "",
            profileTag: "",
            interestTags: [],
        });
        // Hard refresh or just update context. 
        // Wait, cart is not cleared in context by just setting leadData. It's better to reload.
        window.location.reload();
    };

    return (
        <div className="flex flex-col h-full bg-white p-6 md:p-12 items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-500">

            {/* Checkmark Animation */}
            <div className="mb-8 animate-bounce-short">
                <CheckCircle2 size={80} className="text-gray-900" />
            </div>

            <div className="text-center space-y-4 max-w-sm mb-10">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">¡Éxito!</h1>
                <p className="text-lg text-gray-600 font-medium">
                    ¡Proforma enviada! Muéstrale este código a un asesor en el stand para cerrar su pedido.
                </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.06)] mb-12">
                <QRCodeSVG
                    value={proformaId || "placeholder-id"}
                    size={240}
                    bgColor={"#ffffff"}
                    fgColor={"#111827"}
                    level={"H"}
                />
                <p className="text-center text-xs text-gray-400 mt-4 font-mono tracking-widest break-all">
                    ID: {proformaId?.substring(0, 8) || "XXXX"}
                </p>
            </div>

            {/* Start Over Action */}
            <button
                onClick={handleStartOver}
                className="text-sm font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors px-4 py-2"
            >
                <RotateCcw size={16} />
                Nuevo Cliente
            </button>

        </div>
    );
}
