import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterSidebarProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  priceRange: [number, number];
  maxPrice: number;
  onPriceRangeChange: (range: [number, number]) => void;
  onClearFilters: () => void;
  showIncludedServices: boolean;
  onShowIncludedServicesChange: (show: boolean) => void;
}

export function FilterSidebar({
  categories,
  selectedCategories,
  onCategoryChange,
  priceRange,
  maxPrice,
  onPriceRangeChange,
  onClearFilters,
  showIncludedServices,
  onShowIncludedServicesChange,
}: FilterSidebarProps) {
  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const hasActiveFilters =
    selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice || !showIncludedServices;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-auto p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Category</Label>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCategoryToggle(category)}
              />
              <label
                htmlFor={`category-${category}`}
                className="text-sm cursor-pointer text-muted-foreground hover:text-foreground"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Price Range</Label>
        <div className="px-1">
          <Slider
            value={priceRange}
            min={0}
            max={maxPrice}
            step={10}
            onValueChange={(value) => onPriceRangeChange(value as [number, number])}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Show Included Toggle */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Plan Benefits</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-included"
            checked={showIncludedServices}
            onCheckedChange={(value) => onShowIncludedServicesChange(Boolean(value))}
          />
          <label
            htmlFor="show-included"
            className="text-sm cursor-pointer text-muted-foreground hover:text-foreground"
          >
            Show included services
          </label>
        </div>
      </div>
    </div>
  );
}
