"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type ProfileTag = "Dueño de Flota" | "Dueño de Tienda de Repuestos" | "Mecánico" | "Conductor" | "Otro" | "";
export type InterestTag = "American" | "European" | "Asian" | "Yellow Line (Heavy Equipment)" | "All";

export interface LeadData {
  id?: string;
  fullName: string;
  company: string;
  whatsapp: string;
  email: string;
  profileTag: ProfileTag;
  interestTags: InterestTag[];
}

export interface QuoteItem {
  id: string; // product id or uuid
  oemCode: string;
  description: string;
  quantity: number;
}

interface AppContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  leadData: LeadData;
  setLeadData: React.Dispatch<React.SetStateAction<LeadData>>;
  cart: QuoteItem[];
  addToCart: (item: Omit<QuoteItem, "quantity">) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  proformaId: string | null;
  setProformaId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [leadData, setLeadData] = useState<LeadData>({
    fullName: "",
    company: "",
    whatsapp: "",
    email: "",
    profileTag: "",
    interestTags: [],
  });
  const [cart, setCart] = useState<QuoteItem[]>([]);
  const [proformaId, setProformaId] = useState<string | null>(null);

  const addToCart = (item: Omit<QuoteItem, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 10 } : i
        );
      }
      return [...prev, { ...item, quantity: 10 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        leadData,
        setLeadData,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        proformaId,
        setProformaId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
