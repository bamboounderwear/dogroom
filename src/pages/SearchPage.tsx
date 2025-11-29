import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MapView } from '@/components/MapView';
import { HostCard, HostCardSkeleton } from '@/components/HostCard';
import { FilterSheet, Filters } from '@/components/FilterSheet';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { HostPreview } from '@shared/types';
import { useSearchParams } from 'react-router-dom';
export function SearchPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>({});
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);
  const [selectedHostId, setSelectedHostId] = useState<string | null>(null);
  const { data: hostsResponse, isLoading } = useQuery({
    queryKey: ['search', filters],
    queryFn: () => api<{ items: HostPreview[] }>('/api/search', {
      method: 'POST',
      body: JSON.stringify(filters),
    }),
  });
  const hosts = hostsResponse?.items ?? [];
  return (
    <AppLayout container={false}>
      <div className="flex flex-col md:flex-row h-screen bg-muted/30">
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold font-display">Sitters near {searchParams.get('location') || 'you'}</h1>
                <p className="text-muted-foreground">{hosts.length} pawsome sitters found</p>
              </div>
              <Button variant="outline" onClick={() => setFilterSheetOpen(true)}>
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="lg:col-span-1">
                <MapView hosts={hosts} onMarkerClick={setSelectedHostId} selectedHostId={selectedHostId} />
              </div>
              <div className="lg:col-span-1 space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => <HostCardSkeleton key={i} />)
                  : hosts.map((host) => <HostCard key={host.id} host={host} />)}
                {!isLoading && hosts.length === 0 && (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-semibold">No sitters found</h3>
                        <p className="text-muted-foreground mt-2">Try adjusting your filters or searching a different area.</p>
                    </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <FilterSheet
          open={isFilterSheetOpen}
          onOpenChange={setFilterSheetOpen}
          onApply={setFilters}
        />
      </div>
    </AppLayout>
  );
}