"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Currency, CURRENCIES, CurrencyContextType } from "@/types";

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({
  children,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    CURRENCIES.find((c) => c.code === "LKR") || CURRENCIES[0],
  ); // Default to LKR

  const setCurrency = (currency: Currency) => {
    setSelectedCurrency(currency);
  };

  const convertPrice = (lkrPrice: number): number => {
    return Math.round(lkrPrice * selectedCurrency.rate * 100) / 100;
  };

  const formatPrice = (lkrPrice: number): string => {
    const convertedPrice = convertPrice(lkrPrice);
    return `${selectedCurrency.symbol}${convertedPrice.toFixed(2)}`;
  };

  const contextValue: CurrencyContextType = {
    selectedCurrency,
    setCurrency,
    convertPrice,
    formatPrice,
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
