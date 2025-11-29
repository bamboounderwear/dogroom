import React from 'react';
import { motion } from 'framer-motion';
import { PawPrint } from 'lucide-react';
import type { HostPreview } from '@shared/types';
interface MapViewProps {
  hosts: HostPreview[];
  onMarkerClick: (hostId: string) => void;
  selectedHostId?: string | null;
}
export function MapView({ hosts, onMarkerClick, selectedHostId }: MapViewProps) {
  return (
    <div className="relative w-full aspect-square md:aspect-video bg-blue-100 dark:bg-blue-900/30 rounded-2xl overflow-hidden border-4 border-white dark:border-dogroom-ink shadow-lg">
      {/* Decorative map background */}
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(33, 175, 255, 0.2)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div className="absolute inset-0">
        {hosts.map((host) => (
          <motion.button
            key={host.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none focus:ring-4 focus:ring-dogroom-accent/50 rounded-full"
            style={{
              left: `${host.location.x * 100}%`,
              top: `${host.location.y * 100}%`,
            }}
            onClick={() => onMarkerClick(host.id)}
            whileHover={{ scale: 1.2, zIndex: 10 }}
            whileTap={{ scale: 0.9 }}
            animate={{ scale: selectedHostId === host.id ? 1.3 : 1, zIndex: selectedHostId === host.id ? 20 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            aria-label={`View ${host.name}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${selectedHostId === host.id ? 'bg-dogroom-accent text-white' : 'bg-white text-dogroom-primary'}`}>
              <PawPrint className="w-7 h-7" />
            </div>
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-dogroom-ink text-white text-xs font-semibold px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              ${host.pricePerNight}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}