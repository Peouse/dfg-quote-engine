/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { useAppContext } from "@/context/AppContext";
import { MOCK_PRODUCTS, FAMILIES } from "@/data/mockProducts";
import { Search, Menu, X, Plus, ShoppingCart, Check } from "lucide-react";

export default function InteractiveCatalog() {
    const { setCurrentStep, cart, addToCart } = useAppContext();

    const [activeFamily, setActiveFamily] = useState<string>(FAMILIES[0]);
    const [activeSubfamily, setActiveSubfamily] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    // Fuse.js setup prioritizing OEM Code
    const fuse = useMemo(() => new Fuse(MOCK_PRODUCTS, {
        keys: [
            { name: "oemCode", weight: 2 },
            { name: "description", weight: 1 },
            { name: "family", weight: 0.5 }
        ],
        threshold: 0.3,
    }), []);

    // Filter products: If searching, show search results. Otherwise, filter by active family.
    const displayedProducts = useMemo(() => {
        if (searchQuery.trim()) {
            return fuse.search(searchQuery).map(res => res.item);
        }
        let filtered = MOCK_PRODUCTS.filter(p => p.family === activeFamily);
        if (activeSubfamily) {
            filtered = filtered.filter(p => p.subfamily === activeSubfamily);
        }
        return filtered;
    }, [searchQuery, activeFamily, activeSubfamily, fuse]);

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    const activeSubfamilies = useMemo(() => {
        const productsInFamily = MOCK_PRODUCTS.filter(p => p.family === activeFamily);
        const subfamilies = Array.from(new Set(productsInFamily.map(p => p.subfamily))).filter(Boolean);
        return subfamilies.sort();
    }, [activeFamily]);

    return (
        <div className="flex h-[100dvh] sm:h-[80vh] relative bg-gray-50 overflow-hidden">

            {/* Tablet/Desktop Sidebar (20%) */}
            <div className="hidden md:flex flex-col w-[20%] min-w-[200px] border-r border-gray-200 bg-white h-full relative z-10">
                <div className="p-4 border-b border-gray-100 flex items-center justify-center">
                    <img src="/logo.png" alt="DFG Catalog Logo" className="h-8 w-auto object-contain" />
                </div>
                <div className="flex-1 overflow-y-auto w-full">
                    {FAMILIES.map(family => (
                        <div key={family}>
                            <button
                                onClick={() => { setActiveFamily(family); setActiveSubfamily(null); setSearchQuery(""); }}
                                className={`w-full text-left px-4 py-4 border-b border-gray-50 transition-colors ${activeFamily === family && !searchQuery
                                    ? "bg-gray-900 text-white font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                {family}
                            </button>
                            {activeFamily === family && !searchQuery && activeSubfamilies.length > 0 && (
                                <div className="bg-gray-50 py-2 border-b border-gray-100">
                                    {activeSubfamilies.map(sub => (
                                        <button
                                            key={sub}
                                            onClick={() => setActiveSubfamily(sub)}
                                            className={`w-full text-left pl-8 pr-4 py-2 text-sm transition-colors ${activeSubfamily === sub
                                                ? "text-gray-900 font-semibold"
                                                : "text-gray-500 hover:text-gray-900"
                                                }`}
                                        >
                                            {sub}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Drawer */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
                    <div className="relative w-[80%] max-w-sm bg-white h-full shadow-2xl animate-in slide-in-from-left">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <img src="/logo.png" alt="DFG Catalog Logo" className="h-8 w-auto object-contain" />
                            <button onClick={() => setIsDrawerOpen(false)} className="p-2"><X size={24} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {FAMILIES.map(family => (
                                <div key={family}>
                                    <button
                                        onClick={() => { setActiveFamily(family); setActiveSubfamily(null); setSearchQuery(""); setIsDrawerOpen(false); }}
                                        className={`w-full text-left px-6 py-4 border-b border-gray-50 ${activeFamily === family && !searchQuery
                                            ? "bg-gray-900 text-white font-medium"
                                            : "text-gray-600 active:bg-gray-50"
                                            }`}
                                    >
                                        {family}
                                    </button>
                                    {activeFamily === family && !searchQuery && activeSubfamilies.length > 0 && (
                                        <div className="bg-gray-50 py-2 border-b border-gray-100">
                                            {activeSubfamilies.map(sub => (
                                                <button
                                                    key={sub}
                                                    onClick={() => { setActiveSubfamily(sub); setIsDrawerOpen(false); }}
                                                    className={`w-full text-left pl-10 pr-6 py-3 text-sm transition-colors ${activeSubfamily === sub
                                                        ? "text-gray-900 font-semibold"
                                                        : "text-gray-500 hover:text-gray-900"
                                                        }`}
                                                >
                                                    {sub}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full bg-white md:bg-gray-50">

                {/* Sticky Header */}
                <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                            <button
                                className="md:hidden p-2 -ml-2 text-gray-700"
                                onClick={() => setIsDrawerOpen(true)}
                            >
                                <Menu size={24} />
                            </button>
                            <div className="relative flex-1 max-w-lg">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar código OEM o nombre..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => setCurrentStep(3)}
                            className="relative p-2.5 bg-gray-900 text-white rounded-full hover:scale-105 active:scale-95 transition-transform"
                        >
                            <ShoppingCart size={20} />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                    {!searchQuery && (
                        <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <span>Catálogo</span>
                            <span>/</span>
                            <span className={!activeSubfamily ? "text-gray-900" : ""}>{activeFamily}</span>
                            {activeSubfamily && (
                                <>
                                    <span>/</span>
                                    <span className="text-gray-900">{activeSubfamily}</span>
                                </>
                            )}
                        </div>
                    )}
                </header>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
                    {displayedProducts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Search size={48} className="mb-4 opacity-20" />
                            <p>No se encontraron productos para &quot;{searchQuery}&quot;</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
                            {displayedProducts.map(product => {
                                const inCart = cart.some(item => item.id === product.id);

                                return (
                                    <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-row items-stretch transition-shadow hover:shadow-md">

                                        {/* Image (Left side) */}
                                        <div
                                            className="w-28 sm:w-36 bg-white relative shrink-0 cursor-pointer group flex items-center justify-center border-r border-gray-50"
                                            onClick={() => {
                                                if (product.images && product.images.length > 0) setLightboxImage(product.images[0]);
                                            }}
                                        >
                                            {product.images && product.images.length > 0 ? (
                                                <>
                                                    {/* Primary Image */}
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.description}
                                                        className={`w-full h-full object-contain p-2 md:p-3 transition-all duration-300 ${product.images.length > 1 ? 'group-hover:opacity-0 absolute inset-0' : 'group-hover:scale-105'}`}
                                                    />
                                                    {/* Secondary Image for Hover Effect */}
                                                    {product.images.length > 1 && (
                                                        <img
                                                            src={product.images[1]}
                                                            alt={`${product.description} alternate view`}
                                                            className="w-full h-full object-contain p-2 md:p-3 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 absolute inset-0"
                                                        />
                                                    )}
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <span className="text-[10px] font-medium uppercase tracking-wider">Sin Img</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Details (Right side) */}
                                        <div className="p-3 sm:p-4 flex flex-col flex-1 min-w-0 justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-1 min-h-[1.25rem]">
                                                    {product.linea ? (
                                                        <span className="text-[9px] sm:text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-sm font-medium">
                                                            {product.linea}
                                                        </span>
                                                    ) : <div />}
                                                </div>

                                                {/* OEM CODE */}
                                                <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight leading-none mb-1 truncate">
                                                    {product.oemCode}
                                                </h3>

                                                {/* Description */}
                                                <p className="text-[11px] sm:text-xs text-gray-600 line-clamp-2 mb-2 leading-snug">
                                                    {product.description}
                                                </p>
                                            </div>

                                            <div className="mt-auto flex items-end justify-between gap-2 pt-2 border-t border-gray-50">
                                                {/* Aplicacion Detail */}
                                                <div className="flex-1 min-w-0">
                                                    {product.aplicacion ? (
                                                        <p className="text-[9px] sm:text-[10px] text-gray-500 line-clamp-1 truncate block" title={product.aplicacion}>
                                                            <span className="font-semibold text-gray-400 mr-1">App:</span>
                                                            {product.aplicacion}
                                                        </p>
                                                    ) : <div />}
                                                </div>

                                                {/* Add to Cart Circular Button */}
                                                <button
                                                    onClick={() => addToCart({ id: product.id, oemCode: product.oemCode, description: product.description })}
                                                    className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full flex items-center justify-center transition-all shadow-sm ${inCart
                                                        ? "bg-green-500 text-white hover:bg-green-600"
                                                        : "bg-gray-100 text-gray-900 hover:bg-gray-900 hover:text-white"
                                                        }`}
                                                >
                                                    {inCart ? <Check size={16} className="sm:w-5 sm:h-5" /> : <Plus size={16} className="sm:w-5 sm:h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 touch-pinch-zoom"
                    onClick={() => setLightboxImage(null)}
                >
                    <button className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full backdrop-blur-md">
                        <X size={24} />
                    </button>
                    <div className="relative w-full max-w-4xl aspect-square md:aspect-video">
                        <img
                            src={lightboxImage}
                            alt="Detail view"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
            )}

        </div>
    );
}
