"use client";

import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { ChevronLeft, Minus, Plus, Trash2, ArrowRight, Database, X } from "lucide-react";
import { MOCK_PRODUCTS } from "@/data/mockProducts";
import { motion, AnimatePresence } from "framer-motion";

export default function MyProforma() {
    const { setCurrentStep, cart, updateQuantity, removeFromCart, leadData, setProformaId } = useAppContext();
    const [isProcessing, setIsProcessing] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    const totalItems = cart.length;
    const totalUnits = cart.reduce((acc, item) => acc + item.quantity, 0);

    const handleCheckout = async () => {
        if (totalItems === 0) return;
        setIsProcessing(true);

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    leadData,
                    cart,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error al procesar la cotización");
            }

            setProformaId(data.quoteId);
            setCurrentStep(4);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Error al enviar la cotización");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 data-texture opacity-30 pointer-events-none"></div>

            {/* Header */}
            <header className="bg-zinc-50/90 border-zinc-200 px-4 py-5 md:px-8 flex items-center gap-4 sticky top-0 z-20">
                <button
                    onClick={() => setCurrentStep(2)}
                    className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-zinc-900 tracking-widest uppercase font-mono">Proforma</h1>
                    <p className="text-xs text-zinc-500 font-mono tracking-wider mt-1">Revisar productos seleccionados</p>
                </div>
            </header>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar relative z-10">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 font-mono">
                        <div className="w-20 h-20 bg-zinc-50 border border-zinc-200 flex items-center justify-center mb-6 transform rotate-45">
                            <Database size={32} className="text-zinc-400 -rotate-45" />
                        </div>
                        <h2 className="text-lg font-bold text-zinc-700 mb-2 uppercase tracking-widest">Proforma Vacía</h2>
                        <p className="text-sm text-zinc-400 max-w-xs">Regresa al catálogo para agregar productos.</p>
                        <button
                            onClick={() => setCurrentStep(2)}
                            className="mt-8 px-8 py-3 bg-white border border-zinc-300 text-zinc-950 font-mono text-sm uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-colors"
                        >
                            Ir al Catálogo
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 max-w-4xl mx-auto">
                        {cart.map((item) => {
                            const productInfo = MOCK_PRODUCTS.find(p => p.id === item.id);

                            return (
                                <div key={item.id} className="bg-white border border-zinc-200 hover:border-zinc-400 transition-colors group relative flex flex-col sm:flex-row p-3 gap-3">
                                    {/* Accent line */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-200 group-hover:bg-blue-500 transition-colors"></div>

                                    <div className="flex gap-3 items-center ml-2 sm:ml-0 flex-1 min-w-0">
                                        {/* Thumbnail */}
                                        <div
                                            className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-50 border border-zinc-200 relative overflow-hidden shrink-0 flex items-center justify-center cursor-pointer"
                                            onClick={() => {
                                                if (productInfo?.images && productInfo.images.length > 0) {
                                                    setLightboxImage(productInfo.images[0]);
                                                }
                                            }}
                                        >
                                            {productInfo?.images && productInfo.images.length > 0 ? (
                                                <img
                                                    src={productInfo.images[0]}
                                                    alt={item.description}
                                                    className="w-full h-full object-contain p-2 hover:scale-110 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                    <span className="text-[9px] font-mono uppercase tracking-widest">No Img</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Text */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h3 className="text-sm sm:text-base font-bold text-zinc-900 truncate tracking-tight font-mono">
                                                {item.oemCode}
                                            </h3>
                                            <p className="text-xs text-zinc-500 truncate max-w-[90%] mt-1">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Controls & Trash */}
                                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pl-[76px] sm:pl-0">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center bg-zinc-50 border border-zinc-200 h-9 sm:h-10">
                                            <button
                                                onClick={() => updateQuantity(item.id, -10)}
                                                className="w-9 sm:w-10 h-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors active:bg-zinc-200"
                                            >
                                                <Minus size={14} className="sm:w-4 sm:h-4" />
                                            </button>
                                            <div className="w-10 sm:w-12 h-full flex items-center justify-center font-mono font-bold text-xs sm:text-sm text-zinc-900 border-x border-zinc-200">
                                                {item.quantity}
                                            </div>
                                            <button
                                                onClick={() => updateQuantity(item.id, 10)}
                                                className="w-9 sm:w-10 h-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors active:bg-zinc-200"
                                            >
                                                <Plus size={14} className="sm:w-4 sm:h-4" />
                                            </button>
                                        </div>

                                        {/* Trash Button */}
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-2 sm:p-3 text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer / Summary */}
            {cart.length > 0 && (
                <div className="bg-zinc-50 border-zinc-200 p-6 md:p-8 pb-safe relative z-20">
                    <div className="max-w-4xl mx-auto space-y-6">

                        {/* Action */}
                        <button
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            className="w-full bg-blue-600 text-white font-mono uppercase tracking-widest text-sm py-4 hover:bg-blue-500 transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-3 sharp-corner relative group overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isProcessing ? "Procesando..." : "Solicitar Cotización"}
                                {!isProcessing && <ArrowRight size={16} />}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                    </div>
                </div>
            )}
            {/* Lightbox */}
            <AnimatePresence>
                {lightboxImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-xl flex items-center justify-center p-4 touch-pinch-zoom"
                        onClick={() => setLightboxImage(null)}
                    >
                        <button className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-900 bg-white/50 backdrop-blur-md border border-white/40 shadow-sm p-3 transition-colors rounded-full rounded-tr-none rounded-bl-none">
                            <X size={24} />
                        </button>
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-5xl aspect-square md:aspect-video border border-white/60 bg-white/50 shadow-2xl p-4 rounded-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={lightboxImage}
                                alt="Detail view"
                                className="w-full h-full object-contain"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
