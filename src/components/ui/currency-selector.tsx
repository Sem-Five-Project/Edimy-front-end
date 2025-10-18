"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CURRENCIES } from "@/types";

interface CurrencySelectorProps {
  className?: string;
  compact?: boolean;
}

export function CurrencySelector({
  className = "",
  compact = false,
}: CurrencySelectorProps) {
  const { selectedCurrency, setCurrency } = useCurrency();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!compact && (
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <Globe className="h-4 w-4" />
          <span>Currency:</span>
        </div>
      )}
      <Select
        value={selectedCurrency.code}
        onValueChange={(value) => {
          const currency = CURRENCIES.find((c) => c.code === value);
          if (currency) setCurrency(currency);
        }}
      >
        <SelectTrigger className={`${compact ? "w-20" : "w-32"} h-8`}>
          <SelectValue>
            <div className="flex items-center gap-1">
              <span className="font-medium">{selectedCurrency.symbol}</span>
              <span className="text-xs">{selectedCurrency.code}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl max-h-60 overflow-y-auto">
          {CURRENCIES.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currency.symbol}</span>
                  <span className="text-sm">{currency.code}</span>
                </div>
                <span className="text-xs text-gray-500 ml-2">
                  {currency.name}
                </span>
                {currency.code === "LKR" && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Default
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
