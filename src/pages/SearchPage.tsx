import React, { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MapView } from '@/components/MapView';
import { HostCard, HostCardSkeleton } from '@/components/HostCard';
import { FilterSheet, Filters } from '@/components/FilterSheet';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { HostPreview } from '@shared/types';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { track } from '@/components/analytics';
import { EmptyState } from '@/components/EmptyState';
export function SearchPage() {
  const [searchParams] = useSearchParams();
  const location = useMemo(() => searchParams.get('location') || 'Quebec', [searchParams]);
  const [filters, setFilters] = useState<Filters>({});
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);
  const [selectedHostId, setSelectedHostId] = useState<string | null>(null);
  const { data: hostsResponse, isLoading, isFetching } = useQuery({
    queryKey: ['search', location, filters],
    queryFn: () => api<{ items: HostPreview[] }>('/api/search', {
      method: 'POST',
      body: JSON.stringify({ ...filters, location }),
    }),
  });
  // Clear selection when search results change
  useEffect(() => {
    setSelectedHostId(null);
  }, [hostsResponse]);
  const hosts = hostsResponse?.items ?? [];
  const handleApplyFilters = (newFilters: Filters) => {
    setFilters(newFilters);
    track({ name: 'search_filter_apply', params: { filters: newFilters } });
  };
  const handleClearFilters = () => {
    setFilters({});
    setFilterSheetOpen(false);
  }
  const handleMarkerClick = (hostId: string) => {
    setSelectedHostId(hostId);
    track({ name: 'host_select', params: { host_id: hostId, source: 'map' } });
    const element = document.getElementById(`host-card-${hostId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };
  return (
    <AppLayout container={false}>
      <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)]">
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold font-display">Sitters near {location}</h1>
                <p className="text-muted-foreground">{isLoading ? 'Searching...' : `${hosts.length} pawsome sitters found`}</p>
              </div>
              <Button variant="outline" onClick={() => setFilterSheetOpen(true)}>
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="lg:col-span-1 relative">
                {isFetching && !isLoading && (
                  <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center rounded-2xl">
                    <Loader2 className="w-8 h-8 animate-spin text-dogroom-primary" />
                  </div>
                )}
                <MapView hosts={hosts} onMarkerClick={handleMarkerClick} selectedHostId={selectedHostId} />
              </div>
              <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2">
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => <HostCardSkeleton key={i} />)
                  : hosts.length > 0 ? (
                    <motion.div
                      variants={{
                        visible: { transition: { staggerChildren: 0.07 } },
                      }}
                      initial="hidden"
                      animate="visible"
                    >
                      {hosts.map((host) => (
                        <motion.div
                          id={`host-card-${host.id}`}
                          key={host.id}
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 },
                          }}
                          onClick={() => setSelectedHostId(host.id)}
                        >
                          <HostCard host={host} isSelected={selectedHostId === host.id} />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <EmptyState
                      title="No sitters found"
                      description="Try adjusting your filters or searching a different area."
                      cta={{ label: "Adjust Filters", onClick: () => setFilterSheetOpen(true) }}
                    />
                  )}
              </div>
            </div>
          </div>
        </div>
        <FilterSheet
          open={isFilterSheetOpen}
          onOpenChange={setFilterSheetOpen}
          onApply={handleApplyFilters}
        />
      </div>
    </AppLayout>
  );
}