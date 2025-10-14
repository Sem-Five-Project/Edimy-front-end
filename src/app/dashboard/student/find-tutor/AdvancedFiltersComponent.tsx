import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Plus, Minus, Star, DollarSign, Award, TrendingUp } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface AdvancedFiltersProps {
  filters: {
    minRating: number;
    maxPrice: number;
    minExperience: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
  onFilterChange: (key: string, value: any) => void;
}

const AdvancedFiltersComponent: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const { formatPrice } = useCurrency();

  // Format experience helper
  const formatExperience = (months: number): string => {
    if (months === 0) return "0 months";
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) return `${months}m`;
    if (remainingMonths === 0) return `${years}y`;
    return `${years}y ${remainingMonths}m`;
  };

  // Generate star rating display
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-yellow-400"
            : i < rating
              ? "text-yellow-400 fill-yellow-200"
              : "text-gray-300"
        }`}
      />
    ));
  };

  // Price adjustment handlers
  const adjustPrice = (increment: number) => {
    const newPrice = Math.min(
      5000,
      Math.max(500, (filters.maxPrice || 2000) + increment),
    );
    onFilterChange("maxPrice", newPrice);
  };

  // Rating adjustment handlers
  const adjustRating = (increment: number) => {
    const newRating = Math.min(
      5,
      Math.max(0, (filters.minRating || 0) + increment),
    );
    onFilterChange("minRating", newRating);
  };

  // Experience adjustment handlers
  const adjustExperience = (increment: number) => {
    const newExp = Math.min(
      240,
      Math.max(0, (filters.minExperience || 0) + increment),
    );
    onFilterChange("minExperience", newExp);
  };

  return (
    <Card className="border-2 border-purple-100 shadow-lg">
      <CardContent className="p-6 space-y-8">
        {/* Price Range Filter */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              Maximum Fee per Hour
            </h4>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(filters.maxPrice || 2000)}
              </div>
              <div className="text-xs text-gray-500">per hour</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => adjustPrice(-500)}
                disabled={(filters.maxPrice || 2000) <= 500}
                className="h-10 w-10 p-0 border-2"
              >
                <Minus className="h-4 w-4 text-green-600" />
              </Button>

              <div className="flex-1">
                <Slider
                  value={[filters.maxPrice || 2000]}
                  onValueChange={([value]) => onFilterChange("maxPrice", value)}
                  max={5000}
                  min={500}
                  step={100}
                  className="w-full"
                />
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => adjustPrice(500)}
                disabled={(filters.maxPrice || 2000) >= 5000}
                className="h-10 w-10 p-0 border-2"
              >
                <Plus className="h-4 w-4 text-green-600" />
              </Button>
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>Rs. 500</span>
              <span className="text-center">
                Use slider or +/- buttons (±Rs. 500)
              </span>
              <span>Rs. 5,000</span>
            </div>

            {/* Price suggestions */}
          </div>
        </div>

        {/* Minimum Rating Filter */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              Minimum Rating
            </h4>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {renderStars(filters.minRating || 0)}
                </div>
                <span className="text-xl font-bold text-yellow-600">
                  {(filters.minRating || 0).toFixed(1)}+
                </span>
              </div>
              <div className="text-xs text-gray-500">minimum stars</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => adjustRating(-0.5)}
                disabled={(filters.minRating || 0) <= 0}
                className="h-10 w-10 p-0 border-2"
              >
                <Minus className="h-4 w-4 text-yellow-600" />
              </Button>

              <div className="flex-1">
                <Slider
                  value={[filters.minRating || 0]}
                  onValueChange={([value]) =>
                    onFilterChange("minRating", value)
                  }
                  max={5}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => adjustRating(0.5)}
                disabled={(filters.minRating || 0) >= 5}
                className="h-10 w-10 p-0 border-2 "
              >
                <Plus className="h-4 w-4 text-yellow-600" />
              </Button>
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>0 stars</span>
              <span className="text-center">
                Use slider or +/- buttons (±0.5 stars)
              </span>
              <span>5 stars</span>
            </div>

            {/* Rating quick selections */}
          </div>
        </div>

        {/* Minimum Experience Filter */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              Minimum Experience
            </h4>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {formatExperience(filters.minExperience || 0)}+
              </div>
              <div className="text-xs text-gray-500">teaching experience</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => adjustExperience(-1)}
                disabled={(filters.minExperience || 0) <= 0}
                className="h-10 w-10 p-0 border-2 "
              >
                <Minus className="h-4 w-4 text-blue-600" />
              </Button>

              <div className="flex-1">
                <Slider
                  value={[filters.minExperience || 0]}
                  onValueChange={([value]) =>
                    onFilterChange("minExperience", value)
                  }
                  max={240} // 20 years
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => adjustExperience(1)}
                disabled={(filters.minExperience || 0) >= 240}
                className="h-10 w-10 p-0 border-2 "
              >
                <Plus className="h-4 w-4 text-blue-600" />
              </Button>
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>0 months</span>
              <span className="text-center">
                Use slider or +/- buttons (±1 month)
              </span>
              <span>20 years</span>
            </div>

            {/* Experience quick selections */}
          </div>
        </div>

        {/* Sort Options */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Sort By
              </label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => onFilterChange("sortBy", value)}
              >
                <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-indigo-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating" className="py-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Rating
                    </div>
                  </SelectItem>
                  <SelectItem value="price" className="py-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      Price
                    </div>
                  </SelectItem>
                  <SelectItem value="experience" className="py-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-500" />
                      Experience
                    </div>
                  </SelectItem>
                  <SelectItem value="completion_rate" className="py-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                      Completion Rate
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Order</label>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) => onFilterChange("sortOrder", value)}
              >
                <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-indigo-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc" className="py-3">
                    High to Low ↓
                  </SelectItem>
                  <SelectItem value="asc" className="py-3">
                    Low to High ↑
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sort preview */}
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <strong>Current sort:</strong> {filters.sortBy} (
            {filters.sortOrder === "desc" ? "highest" : "lowest"} first)
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedFiltersComponent;
