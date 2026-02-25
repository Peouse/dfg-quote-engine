/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { z } from "zod";
import { useAppContext, ProfileTag, InterestTag } from "@/context/AppContext";
import { createClient } from "@supabase/supabase-js";

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

const PROFILE_OPTIONS: ProfileTag[] = ["Fleet Owner", "Spare Parts Store", "Mechanic", "Driver", "Other"];
const INTEREST_OPTIONS: InterestTag[] = ["American", "European", "Asian", "Yellow Line (Heavy Equipment)", "All"];

const PROFILE_LABELS: Record<ProfileTag, string> = {
    "Fleet Owner": "Flotillero",
    "Spare Parts Store": "Tienda de Repuestos",
    "Mechanic": "Mecánico",
    "Driver": "Conductor",
    "Other": "Otro",
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
                (err as unknown as { errors: { path: (string | number)[]; message: string }[] }).errors.forEach((e) => {
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
        <div className="flex flex-col h-full bg-white animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 md:p-10 flex-1 overflow-y-auto no-scrollbar">
                <div className="max-w-xl mx-auto space-y-8">

                    <div className="text-center space-y-4 flex flex-col items-center">
                        <img src="/logo.png" alt="DFG Catalog Logo" className="h-16 w-auto object-contain" />
                        <p className="text-gray-500">Ingresa tus datos para acceder al catálogo interactivo B2B.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow bg-gray-50 focus:bg-white text-lg"
                                    placeholder="Juan Pérez"
                                />
                                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa (Opcional)</label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow bg-gray-50 focus:bg-white text-lg"
                                    placeholder="Empresa S.A."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow bg-gray-50 focus:bg-white text-lg"
                                    placeholder="juan@ejemplo.com"
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                                <div className="flex gap-2">
                                    <select
                                        value={formData.countryCode}
                                        onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                                        className="w-24 px-2 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50 focus:bg-white text-lg"
                                    >
                                        <option value="+1">+1 (US)</option>
                                        <option value="+51">+51 (PE)</option>
                                    </select>
                                    <input
                                        type="tel"
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                        className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow bg-gray-50 focus:bg-white text-lg"
                                        placeholder="987654321"
                                    />
                                </div>
                                {errors.whatsapp && <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>}
                            </div>
                        </div>

                        {/* Profile Tags */}
                        <div className="pt-2">
                            <label className="block text-sm font-medium text-gray-900 mb-3">¿Qué opción describe mejor tu perfil? (Selecciona una)</label>
                            <div className="flex flex-wrap gap-2">
                                {PROFILE_OPTIONS.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, profileTag: tag })}
                                        className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors border ${formData.profileTag === tag
                                            ? "bg-gray-900 text-white border-gray-900"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-900 hover:text-gray-900"
                                            }`}
                                    >
                                        {PROFILE_LABELS[tag]}
                                    </button>
                                ))}
                            </div>
                            {errors.profileTag && <p className="text-red-500 text-sm mt-2">{errors.profileTag}</p>}
                        </div>

                        {/* Interest Tags */}
                        <div className="pt-2">
                            <label className="block text-sm font-medium text-gray-900 mb-3">¿Qué líneas de productos te interesan? (Selecciona varias)</label>
                            <div className="flex flex-wrap gap-2">
                                {INTEREST_OPTIONS.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleInterest(tag)}
                                        className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors border ${formData.interestTags.includes(tag)
                                            ? "bg-gray-900 text-white border-gray-900"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-900 hover:text-gray-900"
                                            }`}
                                    >
                                        {INTEREST_LABELS[tag]}
                                    </button>
                                ))}
                            </div>
                            {errors.interestTags && <p className="text-red-500 text-sm mt-2">{errors.interestTags}</p>}
                        </div>

                        {/* Submit */}
                        <div className="pt-6 pb-8">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gray-900 text-white font-semibold text-lg py-4 rounded-xl hover:bg-gray-800 transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? "Guardando..." : "Entrar al Catálogo Interactivo"}
                                {!isSubmitting && <span className="text-xl">→</span>}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
