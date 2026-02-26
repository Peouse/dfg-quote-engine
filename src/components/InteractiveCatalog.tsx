/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Fuse from "fuse.js";
import { useAppContext } from "@/context/AppContext";
import { MOCK_PRODUCTS, FAMILIES } from "@/data/mockProducts";
import { Search, Menu, X, Plus, Minus, ShoppingCart, Check, Hexagon, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InteractiveCatalog() {
    const { setCurrentStep, cart, addToCart, removeFromCart, updateQuantity } = useAppContext();

    const [activeFamily, setActiveFamily] = useState<string>(FAMILIES[0]);
    const [activeSubfamily, setActiveSubfamily] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Reset scroll when category or search changes
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [activeFamily, activeSubfamily, searchQuery]);

    // Force reset on mount just in case of stale state
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        setActiveFamily(FAMILIES[0]);
        setActiveSubfamily(null);
        setSearchQuery("");
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, []);

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
        <div className="flex h-[100dvh] sm:h-[85vh] relative bg-white overflow-hidden">

            {/* Tablet/Desktop Sidebar (20%) */}
            <div className="hidden md:flex flex-col w-[22%] min-w-[240px] border-r border-zinc-200 bg-zinc-50 h-full relative z-10">
                <div className="p-6 border-b border-zinc-200 flex items-center justify-center">
                    <img src="/logo.png" alt="DFG Logo" className="h-8 object-contain" />
                </div>
                <div className="flex-1 overflow-y-auto w-full no-scrollbar py-4">
                    {FAMILIES.map(family => (
                        <div key={family} className="px-2 mb-1">
                            <button
                                onClick={() => { setActiveFamily(family); setActiveSubfamily(null); setSearchQuery(""); }}
                                className={`w-full text-left px-4 py-3 text-sm font-mono tracking-wide transition-all border-l-2 ${activeFamily === family && !searchQuery
                                    ? "bg-blue-900/10 text-blue-400 border-blue-500"
                                    : "text-zinc-600 border-transparent hover:bg-zinc-100 hover:text-zinc-800"
                                    }`}
                            >
                                {family}
                            </button>
                            {activeFamily === family && !searchQuery && activeSubfamilies.length > 0 && (
                                <div className="bg-white py-2 ml-2 border-l border-zinc-200 my-1">
                                    {activeSubfamilies.map(sub => (
                                        <button
                                            key={sub}
                                            onClick={() => setActiveSubfamily(sub)}
                                            className={`w-full text-left pl-6 pr-4 py-2 text-xs font-mono tracking-wide transition-colors relative ${activeSubfamily === sub
                                                ? "text-blue-400"
                                                : "text-zinc-500 hover:text-zinc-800"
                                                }`}
                                        >
                                            {activeSubfamily === sub && (
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-px bg-blue-500"></span>
                                            )}
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
            <AnimatePresence>
                {isDrawerOpen && (
                    <div className="fixed inset-0 z-50 flex md:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
                            onClick={() => setIsDrawerOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-[85%] max-w-sm bg-white/90 backdrop-blur-xl h-full shadow-2xl border-r border-white/20 flex flex-col"
                        >
                            <div className="p-4 border-b border-zinc-200/50 flex justify-between items-center relative shrink-0">
                                <div className="flex items-center justify-center w-full">
                                    <img src="/logo.png" alt="DFG Logo" className="h-6 object-contain" />
                                </div>
                                <button onClick={() => setIsDrawerOpen(false)} className="absolute right-4 p-2 text-zinc-500 hover:text-zinc-900"><X size={24} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto py-4">
                                {FAMILIES.map(family => {
                                    const familySubcategories = Array.from(new Set(MOCK_PRODUCTS.filter(p => p.family === family).map(p => p.subfamily))).filter(Boolean);

                                    return (
                                        <div key={family} className="mb-1">
                                            <button
                                                onClick={() => {
                                                    setActiveFamily(family);
                                                    setActiveSubfamily(null);
                                                    setSearchQuery("");
                                                    if (familySubcategories.length === 0) {
                                                        setIsDrawerOpen(false);
                                                    }
                                                }}
                                                className={`w-full text-left px-6 py-4 text-sm font-mono tracking-wide border-l-2 ${activeFamily === family && !searchQuery
                                                    ? "bg-blue-600/10 text-blue-600 border-blue-500"
                                                    : "text-zinc-600 border-transparent active:bg-zinc-100"
                                                    }`}
                                            >
                                                {family}
                                            </button>
                                            <AnimatePresence>
                                                {activeFamily === family && !searchQuery && activeSubfamilies.length > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="bg-zinc-50/50 py-2 border-y border-zinc-200/50 overflow-hidden"
                                                    >
                                                        {activeSubfamilies.map(sub => (
                                                            <button
                                                                key={sub}
                                                                onClick={() => { setActiveSubfamily(sub); setIsDrawerOpen(false); }}
                                                                className={`w-full text-left pl-10 pr-6 py-3 text-xs font-mono tracking-wide transition-colors ${activeSubfamily === sub
                                                                    ? "text-blue-600 font-bold"
                                                                    : "text-zinc-500 hover:text-zinc-800"
                                                                    }`}
                                                            >
                                                                {sub}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
                {/* Background Grid */}
                <div className="absolute inset-0 data-texture opacity-20 pointer-events-none"></div>

                {/* Sticky Header */}
                <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 border-b border-white/20 shadow-sm p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                            <button
                                className="md:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-900"
                                onClick={() => setIsDrawerOpen(true)}
                            >
                                <Menu size={24} />
                            </button>
                            <div className="relative flex-1 max-w-xl">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="BUSCAR CÓDIGO OEM O DESCRIPCIÓN..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 shadow-inner focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all outline-none text-zinc-900 font-mono text-sm placeholder-gray-500 rounded-sm"
                                />
                            </div>
                        </div>
                        <div className="relative mt-1 mr-1">
                            <button
                                onClick={() => setCurrentStep(3)}
                                className="relative p-3 bg-blue-600/90 backdrop-blur-md shadow-lg shadow-blue-500/20 text-white hover:bg-blue-600 transition-colors sharp-corner flex-shrink-0 border border-blue-400/50"
                            >
                                <ShoppingCart size={20} />
                            </button>
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-orange-500 text-white flex items-center justify-center border border-[#0a0a0a] shadow-[0_0_10px_rgba(249,115,22,0.5)] z-10 pointer-events-none font-bold min-w-[20px] h-5 px-1 text-[11px] whitespace-nowrap">
                                    {totalItems}
                                </span>
                            )}
                        </div>
                    </div>
                    {!searchQuery && (
                        <div className="text-[10px] sm:text-xs font-mono text-zinc-500 flex flex-wrap items-center gap-x-2 gap-y-1 uppercase tracking-widest mt-1 sm:mt-0">
                            <Database size={12} className="text-blue-500 shrink-0" />
                            <span className="shrink-0">Catalog</span>
                            <span className="text-gray-700 shrink-0">/</span>
                            <span className={`break-words ${!activeSubfamily ? "text-gray-300" : ""}`}>{activeFamily}</span>
                            {activeSubfamily && (
                                <>
                                    <span className="text-gray-700 shrink-0">/</span>
                                    <span className="text-blue-400 break-words">{activeSubfamily}</span>
                                </>
                            )}
                        </div>
                    )}
                </header>

                {/* Product Grid */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar relative z-10">
                    {displayedProducts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 font-mono">
                            <Search size={48} className="mb-4 opacity-20" />
                            <p>NO DATA FOUND FOR QUERY: &quot;{searchQuery}&quot;</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-2 md:gap-4 lg:gap-5 pb-24">
                            {displayedProducts.map(product => {
                                const inCart = cart.some(item => item.id === product.id);

                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        key={product.id}
                                        className="bg-white/80 backdrop-blur-sm shadow-sm border border-white/40 flex flex-col transition-all hover:shadow-md hover:border-blue-200 group relative rounded-md overflow-hidden"
                                    >
                                        {/* Corner accents */}
                                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-zinc-400 group-hover:border-blue-500 transition-colors z-10"></div>
                                        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-zinc-400 group-hover:border-blue-500 transition-colors z-10"></div>

                                        <div className="flex flex-col items-stretch h-full relative z-0">
                                            {/* Image (Top side) */}
                                            <div
                                                className="w-full h-32 sm:h-40 bg-white/50 relative shrink-0 cursor-pointer flex items-center justify-center border-b border-zinc-100 overflow-hidden"
                                                onClick={() => {
                                                    if (product.images && product.images.length > 0) setLightboxImage(product.images[0]);
                                                }}
                                            >
                                                {product.images && product.images.length > 0 ? (
                                                    <>
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.description}
                                                            className={`w-full h-full object-contain p-2 sm:p-3 transition-all duration-500 ${product.images.length > 1 ? 'group-hover:opacity-0 absolute inset-0' : 'group-hover:scale-110'}`}
                                                        />
                                                        {product.images.length > 1 && (
                                                            <img
                                                                src={product.images[1]}
                                                                alt={`${product.description} alternate view`}
                                                                className="w-full h-full object-contain p-2 sm:p-3 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 absolute inset-0"
                                                            />
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                        <span className="text-[10px] font-mono uppercase tracking-widest">No Img</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details (Bottom/Right side) */}
                                            <div className="p-3 sm:p-4 flex flex-col flex-1 min-w-0 justify-between bg-white/40">
                                                <div>
                                                    <div className="flex justify-between items-start mb-2 min-h-[1.25rem]">
                                                        {product.linea ? (
                                                            <span className="text-[8px] sm:text-[9px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 sm:py-1 uppercase tracking-wider border border-blue-200 rounded-sm">
                                                                {product.linea}
                                                            </span>
                                                        ) : <div />}
                                                    </div>

                                                    {/* OEM CODE */}
                                                    <h3 className="text-sm sm:text-lg font-bold text-zinc-900 tracking-tight leading-none mb-1 sm:mb-2 truncate font-mono">
                                                        {product.oemCode}
                                                    </h3>

                                                    {/* Description */}
                                                    <p className="text-[10px] sm:text-xs text-zinc-500 line-clamp-2 mb-2 sm:mb-3 leading-relaxed">
                                                        {product.description}
                                                    </p>
                                                </div>

                                                <div className="mt-auto flex items-end justify-between gap-3 pt-3 border-t border-zinc-200/50">
                                                    {/* Aplicacion Detail */}
                                                    <div className="flex-1 min-w-0">
                                                        {product.aplicacion ? (
                                                            <p className="text-[9px] sm:text-[10px] text-zinc-500 line-clamp-1 truncate block font-mono" title={product.aplicacion}>
                                                                <span className="text-gray-600 mr-1">APP:</span>
                                                                {product.aplicacion}
                                                            </p>
                                                        ) : <div />}
                                                    </div>

                                                    {/* Add to Cart Button / Quantity */}
                                                    <div className="flex items-center min-h-[44px]">
                                                        <AnimatePresence mode="wait">
                                                            {!inCart ? (
                                                                <motion.button
                                                                    key="add-btn"
                                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                                    transition={{ duration: 0.15 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={() => addToCart({ id: product.id, oemCode: product.oemCode, description: product.description })}
                                                                    className="w-10 h-10 md:w-11 md:h-11 rounded-full shrink-0 flex items-center justify-center transition-colors border overflow-hidden relative bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 hover:shadow-sm"
                                                                >
                                                                    <Plus size={20} />
                                                                </motion.button>
                                                            ) : (
                                                                <motion.div
                                                                    key="qty-ctrl"
                                                                    initial={{ opacity: 0, width: 44 }}
                                                                    animate={{ opacity: 1, width: "auto" }}
                                                                    exit={{ opacity: 0, width: 44 }}
                                                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                                                    className="flex items-center bg-blue-50 border border-blue-200 rounded-full h-10 md:h-11 shadow-[0_0_10px_rgba(59,130,246,0.1)] gap-1 px-1 overflow-hidden origin-right"
                                                                >
                                                                    <motion.button
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => updateQuantity(product.id, -10)}
                                                                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-blue-600 hover:bg-blue-200 hover:text-blue-800 rounded-full transition-colors shrink-0"
                                                                    >
                                                                        <Minus size={14} />
                                                                    </motion.button>
                                                                    <div className="min-w-[16px] sm:min-w-[24px] text-center font-mono text-[11px] sm:text-xs font-bold text-blue-900 pointer-events-none shrink-0">
                                                                        {cart.find(i => i.id === product.id)?.quantity || 10}
                                                                    </div>
                                                                    <motion.button
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => updateQuantity(product.id, 10)}
                                                                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-blue-600 hover:bg-blue-200 hover:text-blue-800 rounded-full transition-colors shrink-0"
                                                                    >
                                                                        <Plus size={14} />
                                                                    </motion.button>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

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
