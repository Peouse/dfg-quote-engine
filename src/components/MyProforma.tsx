"use client";

import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { ChevronLeft, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import { MOCK_PRODUCTS } from "@/data/mockProducts";

export default function MyProforma() {
    const { setCurrentStep, cart, updateQuantity, removeFromCart, leadData, setProformaId } = useAppContext();
    const [isProcessing, setIsProcessing] = useState(false);

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
        <div className="flex flex-col h-full bg-gray-50 animate-in slide-in-from-right duration-300">

            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-4 md:px-6 flex items-center gap-4 sticky top-0 z-10">
                <button
                    onClick={() => setCurrentStep(2)}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Mi Proforma</h1>
                    <p className="text-sm text-gray-500">Revisa los artículos seleccionados</p>
                </div>
            </header>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Trash2 size={32} className="text-gray-300" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">El carrito está vacío</h2>
                        <p>Vuelve al catálogo para agregar artículos a tu proforma.</p>
                        <button
                            onClick={() => setCurrentStep(2)}
                            className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-full font-medium"
                        >
                            Explorar Catálogo
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 max-w-3xl mx-auto">
                        {cart.map((item) => {
                            const productInfo = MOCK_PRODUCTS.find(p => p.id === item.id);

                            return (
                                <div key={item.id} className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 sm:gap-4">

                                    {/* Thumbnail */}
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg border border-gray-100 relative overflow-hidden shrink-0 flex items-center justify-center">
                                        {productInfo?.images && productInfo.images.length > 0 ? (
                                            <img
                                                src={productInfo.images[0]}
                                                alt={item.description}
                                                className="w-full h-full object-contain p-1.5"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                                <span className="text-[9px] font-medium uppercase tracking-wider">Sin Img</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Center Column: Text & Mobile Quantity */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5 sm:gap-1">
                                        <div>
                                            <h3 className="text-sm sm:text-base font-black text-gray-900 truncate tracking-tight">
                                                {item.oemCode}
                                            </h3>
                                            <p className="text-[11px] sm:text-xs text-gray-500 truncate max-w-[90%]">
                                                {item.description}
                                            </p>
                                        </div>

                                        {/* Mobile Quantity Controls (hidden on sm+) */}
                                        <div className="flex sm:hidden mt-1">
                                            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 h-7 shadow-sm">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-8 h-full flex items-center justify-center text-gray-500 active:bg-gray-200 rounded-l-lg transition-colors"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <div className="w-8 h-full flex items-center justify-center font-bold text-xs text-gray-900 border-x border-gray-200/60 bg-white">
                                                    {item.quantity}
                                                </div>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-8 h-full flex items-center justify-center text-gray-500 active:bg-gray-200 rounded-r-lg transition-colors"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Desktop Quantity + Trash */}
                                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">

                                        {/* Desktop Quantity Controls (hidden on mobile) */}
                                        <div className="hidden sm:flex items-center gap-1.5 bg-gray-50 rounded-full p-1 border border-gray-200 shadow-sm">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-600 hover:text-gray-900 active:scale-95 transition-all"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-10 text-center font-bold text-sm text-gray-900">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-600 hover:text-gray-900 active:scale-95 transition-all"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        {/* Trash Button */}
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-2 sm:p-2.5 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors self-start sm:self-center -mr-1 sm:mr-0"
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
                <div className="bg-white border-t border-gray-200 p-4 md:p-6 pb-safe relative z-20 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
                    <div className="max-w-3xl mx-auto space-y-4">

                        {/* Summary details */}
                        <div className="flex justify-between items-center text-sm md:text-base text-gray-600">
                            <p>Total de Artículos: <span className="font-bold text-gray-900">{totalItems}</span></p>
                            <p>Total de Unidades: <span className="font-bold text-gray-900">{totalUnits}</span></p>
                        </div>

                        <p className="text-xs text-gray-400 italic text-center">
                            * Precios de referencia sujetos a disponibilidad de stock.
                        </p>

                        {/* Action */}
                        <button
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            className="w-full bg-gray-900 text-white font-semibold text-lg py-4 rounded-xl hover:bg-gray-800 transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                        >
                            {isProcessing ? "Procesando..." : "Generar Proforma y Código QR"}
                            {!isProcessing && <ArrowRight size={20} />}
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
