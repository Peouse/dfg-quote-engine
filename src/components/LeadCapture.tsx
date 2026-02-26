/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { z } from "zod";
import { useAppContext, ProfileTag, InterestTag } from "@/context/AppContext";
import { createClient } from "@supabase/supabase-js";
import { ArrowRight, Hexagon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const leadSchema = z.object({
    fullName: z.string().min(2, "El nombre es muy corto"),
    company: z.string().optional(),
    countryCode: z.string(),
    whatsapp: z.string().regex(/^\d{8,15}$/, "Número de WhatsApp inválido"),
    email: z.string().email("Formato de correo inválido"),
});

const PROFILE_OPTIONS: ProfileTag[] = ["Dueño de Flota", "Dueño de Tienda de Repuestos", "Mecánico", "Conductor", "Otro"];
const INTEREST_OPTIONS: InterestTag[] = ["American", "European", "Asian", "Yellow Line (Heavy Equipment)", "All"];

const PROFILE_LABELS: Record<ProfileTag, string> = {
    "Dueño de Flota": "Dueño de Flota",
    "Dueño de Tienda de Repuestos": "Dueño de Tienda de Repuestos",
    "Mecánico": "Mecánico",
    "Conductor": "Conductor",
    "Otro": "Otro",
    "": ""
};

const INTEREST_LABELS: Record<InterestTag, string> = {
    "American": "Americano",
    "European": "Europeo",
    "Asian": "Asiático",
    "Yellow Line (Heavy Equipment)": "Línea Amarilla (Maquinaria Pesada)",
    "All": "Todas"
};

export default function LeadCapture() {
    const { leadData, setLeadData, setCurrentStep } = useAppContext();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Local state for the form before saving to context
    const [formData, setFormData] = useState({
        fullName: leadData.fullName,
        company: leadData.company,
        countryCode: "+1",
        whatsapp: leadData.whatsapp.replace(/^\+\d+\s?/, ""), // naive strip for display
        email: leadData.email,
        profileTag: leadData.profileTag,
        interestTags: leadData.interestTags,
    });

    const toggleInterest = (tag: InterestTag) => {
        setFormData((prev) => {
            let newTags = [...prev.interestTags];
            if (tag === "All") {
                newTags = ["All"];
            } else {
                newTags = newTags.filter((t) => t !== "All");
                if (newTags.includes(tag)) {
                    newTags = newTags.filter((t) => t !== tag);
                } else {
                    newTags.push(tag);
                }
            }
            return { ...prev, interestTags: newTags };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            // Validate
            const validated = leadSchema.parse(formData);
            if (!formData.profileTag) {
                throw new z.ZodError([{ path: ["profileTag"], message: "Por favor selecciona un perfil", code: "custom" }]);
            }
            if (formData.interestTags.length === 0) {
                throw new z.ZodError([{ path: ["interestTags"], message: "Por favor selecciona al menos un interés", code: "custom" }]);
            }

            const fullWhatsapp = `${validated.countryCode} ${validated.whatsapp}`;

            // 1. Save to Supabase `leads` table
            const { data, error } = await supabase
                .from("leads")
                .insert([{
                    full_name: validated.fullName,
                    company: validated.company || null,
                    whatsapp: fullWhatsapp,
                    email: validated.email,
                    profile_tag: formData.profileTag,
                    interest_tags: formData.interestTags
                }])
                .select()
                .single();

            if (error) {
                console.error("Supabase Error:", error);
                throw new Error("Failed to save lead info.");
            }

            // 2. Save to global Context
            setLeadData({
                id: data.id,
                fullName: validated.fullName,
                company: validated.company || "",
                whatsapp: fullWhatsapp,
                email: validated.email,
                profileTag: formData.profileTag,
                interestTags: formData.interestTags,
            });

            // 3. Move to Step 2
            setCurrentStep(2);

        } catch (err) {
            if (err instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                err.issues.forEach((e) => {
                    if (e.path[0]) newErrors[e.path[0].toString()] = e.message;
                });
                setErrors(newErrors);
            } else {
                alert(err instanceof Error ? err.message : "An error occurred");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 data-texture opacity-50 pointer-events-none"></div>

            <div className="p-6 md:p-12 flex-1 overflow-y-auto no-scrollbar relative z-10">
                <div className="max-w-2xl mx-auto space-y-10">

                    <div className="text-center space-y-4 flex flex-col items-center">
                        <div className="flex items-center justify-center mb-2">
                            <img src="/logo.png" alt="DFG Logo" className="h-16 object-contain" />
                        </div>
                        <p className="text-zinc-600 font-mono text-sm tracking-widest text-center px-4">
                            Marca líder en repuestos para buses y vehículos pesados
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 rounded-3xl relative">

                        {/* Fields */}
                        <div className="space-y-5 relative">
                            <div className="relative">
                                <label className={`block text-xs font-mono mb-2 uppercase tracking-wider transition-colors ${errors.fullName ? 'text-red-500 font-bold' : 'text-zinc-500'}`}>Nombre Completo</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => {
                                            setFormData({ ...formData, fullName: e.target.value });
                                            if (errors.fullName) setErrors({ ...errors, fullName: "" });
                                        }}
                                        className={`w-full py-2 bg-transparent border-x-0 border-t-0 border-b-2 ${errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 focus:border-blue-500'} focus:ring-0 transition-all text-zinc-950 font-mono text-sm px-0 outline-none placeholder:text-zinc-400`}
                                        placeholder="Juan Pérez"
                                    />
                                    <AnimatePresence>
                                        {errors.fullName && (
                                            <motion.span
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-red-500 font-mono italic pointer-events-none"
                                            >
                                                {errors.fullName}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="relative">
                                <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider">Empresa (Opcional)</label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full py-2 bg-transparent border-x-0 border-t-0 border-b-2 border-zinc-200 focus:border-blue-500 focus:ring-0 transition-all text-zinc-950 font-mono text-sm px-0 outline-none placeholder:text-zinc-400"
                                    placeholder="Empresa S.A."
                                />
                            </div>

                            <div className="relative">
                                <label className={`block text-xs font-mono mb-2 uppercase tracking-wider transition-colors ${errors.email ? 'text-red-500 font-bold' : 'text-zinc-500'}`}>Correo Electrónico</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => {
                                            setFormData({ ...formData, email: e.target.value });
                                            if (errors.email) setErrors({ ...errors, email: "" });
                                        }}
                                        className={`w-full py-2 bg-transparent border-x-0 border-t-0 border-b-2 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 focus:border-blue-500'} focus:ring-0 transition-all text-zinc-950 font-mono text-sm px-0 outline-none placeholder:text-zinc-400`}
                                        placeholder="juan@ejemplo.com"
                                    />
                                    <AnimatePresence>
                                        {errors.email && (
                                            <motion.span
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-red-500 font-mono italic pointer-events-none"
                                            >
                                                {errors.email}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="relative">
                                <label className={`block text-xs font-mono mb-2 uppercase tracking-wider transition-colors ${errors.whatsapp ? 'text-red-500 font-bold' : 'text-zinc-500'}`}>WhatsApp</label>
                                <div className="flex gap-2 relative">
                                    <select
                                        value={formData.countryCode}
                                        onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                                        className={`w-20 py-2 bg-transparent border-x-0 border-t-0 border-b-2 ${errors.whatsapp ? 'border-red-500 focus:border-red-500 text-red-500' : 'border-zinc-200 focus:border-blue-500 text-zinc-950'} focus:ring-0 font-mono text-sm px-0 outline-none cursor-pointer`}
                                    >
                                        <option value="+1">+1</option>
                                        <option value="+51">+51</option>
                                    </select>
                                    <div className="relative flex-1">
                                        <input
                                            type="tel"
                                            value={formData.whatsapp}
                                            onChange={(e) => {
                                                setFormData({ ...formData, whatsapp: e.target.value });
                                                if (errors.whatsapp) setErrors({ ...errors, whatsapp: "" });
                                            }}
                                            className={`w-full py-2 bg-transparent border-x-0 border-t-0 border-b-2 ${errors.whatsapp ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 focus:border-blue-500'} focus:ring-0 transition-all text-zinc-950 font-mono text-sm px-0 outline-none placeholder:text-zinc-400`}
                                            placeholder="987654321"
                                        />
                                        <AnimatePresence>
                                            {errors.whatsapp && (
                                                <motion.span
                                                    initial={{ opacity: 0, x: 10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 10 }}
                                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-red-500 font-mono italic pointer-events-none"
                                                >
                                                    {errors.whatsapp}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Tags */}
                        <div className="pt-4 border-t border-zinc-200 relative">
                            <label className={`block flex items-center justify-between text-xs font-mono mb-4 uppercase tracking-wider transition-colors ${errors.profileTag ? 'text-red-500 font-bold' : 'text-zinc-500'}`}>
                                Perfil Operativo
                                <AnimatePresence>
                                    {errors.profileTag && (
                                        <motion.span
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="text-[10px] sm:text-xs text-red-500 font-mono italic normal-case"
                                        >
                                            {errors.profileTag}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </label>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                {PROFILE_OPTIONS.map(tag => (
                                    <motion.button
                                        layout
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        whileTap={{ scale: 0.95 }}
                                        key={tag}
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, profileTag: tag });
                                            if (errors.profileTag) setErrors({ ...errors, profileTag: "" });
                                        }}
                                        className={`px-4 py-2 text-[10px] sm:text-xs font-mono uppercase tracking-wider rounded-full border transition-colors ${formData.profileTag === tag
                                            ? "bg-zinc-950 text-white border-zinc-950 shadow-md"
                                            : "bg-white/50 text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:bg-white"
                                            }`}
                                    >
                                        {PROFILE_LABELS[tag]}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Interest Tags */}
                        <div className="pt-4 border-t border-zinc-200 relative">
                            <label className={`block flex items-center justify-between text-xs font-mono mb-4 uppercase tracking-wider transition-colors ${errors.interestTags ? 'text-red-500 font-bold' : 'text-zinc-500'}`}>
                                Vectores de Interés
                                <AnimatePresence>
                                    {errors.interestTags && (
                                        <motion.span
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="text-[10px] sm:text-xs text-red-500 font-mono italic normal-case text-right ml-2"
                                        >
                                            {errors.interestTags}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </label>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                {INTEREST_OPTIONS.map(tag => (
                                    <motion.button
                                        layout
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        whileTap={{ scale: 0.95 }}
                                        key={tag}
                                        type="button"
                                        onClick={() => {
                                            toggleInterest(tag);
                                            if (errors.interestTags) setErrors({ ...errors, interestTags: "" });
                                        }}
                                        className={`px-4 py-2 text-[10px] sm:text-xs font-mono uppercase tracking-wider rounded-full border transition-colors ${formData.interestTags.includes(tag)
                                            ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                                            : "bg-white/50 text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:bg-white"
                                            }`}
                                    >
                                        {INTEREST_LABELS[tag]}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-6">
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-zinc-950 text-white font-mono uppercase tracking-widest text-sm py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group shadow-lg"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {isSubmitting ? "Autenticando..." : "Inicializar Catálogo"}
                                    {!isSubmitting && <ArrowRight size={16} />}
                                </span>
                                {/* Shimmer Effect */}
                                <motion.div
                                    initial={{ x: "-100%" }}
                                    whileHover={{ x: "200%" }}
                                    transition={{ duration: 1, ease: "easeInOut", repeat: Infinity }}
                                    className="absolute inset-y-0 -inset-x-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 z-0"
                                />
                            </motion.button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
