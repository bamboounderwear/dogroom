import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Calendar } from '@/components/ui/calendar';
import type { PetSize, ServiceType } from '@shared/types';
export interface Filters {
  dates?: { from?: Date; to?: Date };
  petSize?: PetSize;
  priceRange?: [number, number];
  services?: ServiceType[];
}
interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (filters: Filters) => void;
}
export function FilterSheet({ open, onOpenChange, onApply }: FilterSheetProps) {
  const [filters, setFilters] = React.useState<Filters>({});
  const handleApply = () => {
    onApply(filters);
    onOpenChange(false);
  };
  const handleClear = () => {
    setFilters({});
    onApply({});
    onOpenChange(false);
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Filter Hosts</SheetTitle>
          <SheetDescription>Find the perfect sitter for your furry friend.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4 space-y-8">
          <div className="space-y-4">
            <Label>Dates</Label>
            <Calendar
              mode="range"
              selected={filters.dates}
              onSelect={(dates) => setFilters(f => ({ ...f, dates: dates }))}
              className="rounded-md border"
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="pet-size">Pet Size</Label>
            <Select
              value={filters.petSize}
              onValueChange={(value: PetSize) => setFilters(f => ({ ...f, petSize: value }))}
            >
              <SelectTrigger id="pet-size">
                <SelectValue placeholder="Any size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (0-20 lbs)</SelectItem>
                <SelectItem value="medium">Medium (21-50 lbs)</SelectItem>
                <SelectItem value="large">Large (51+ lbs)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            <Label>Services</Label>
            <ToggleGroup
              type="multiple"
              variant="outline"
              value={filters.services}
              onValueChange={(value: ServiceType[]) => setFilters(f => ({ ...f, services: value }))}
            >
              <ToggleGroupItem value="boarding">Boarding</ToggleGroupItem>
              <ToggleGroupItem value="daycare">Daycare</ToggleGroupItem>
              <ToggleGroupItem value="walking">Walking</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="space-y-4">
            <Label>Price per night</Label>
            <Slider
              defaultValue={[50]}
              max={200}
              step={5}
              onValueChange={(value) => setFilters(f => ({ ...f, priceRange: [0, value[0]] }))}
            />
            <div className="text-center text-sm text-muted-foreground">
              Up to ${filters.priceRange?.[1] ?? 50}
            </div>
          </div>
        </div>
        <SheetFooter className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={handleClear}>Clear</Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}