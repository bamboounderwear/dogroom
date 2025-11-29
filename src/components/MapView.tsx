import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { HostPreview } from '@shared/types';
import { renderToString } from 'react-dom/server';
import { PawPrint } from 'lucide-react';
interface MapViewProps {
  hosts: HostPreview[];
  onMarkerClick: (hostId: string) => void;
  selectedHostId?: string | null;
  center: [number, number];
}
// Fix for default icon path issue with bundlers like Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
const createMarkerIcon = (isSelected: boolean) => {
  const iconHtml = renderToString(
    <div
      className={`
        rounded-full flex items-center justify-center transition-all duration-300
        ${isSelected
          ? 'bg-dogroom-accent w-12 h-12 border-4 border-white shadow-lg'
          : 'bg-dogroom-primary w-10 h-10 border-2 border-white shadow-md'
        }
      `}
    >
      <PawPrint
        className={`
          transition-all duration-300
          ${isSelected ? 'w-6 h-6 text-white' : 'w-5 h-5 text-white'}
        `}
      />
    </div>
  );
  return L.divIcon({
    html: iconHtml,
    className: 'bg-transparent border-0',
    iconSize: [isSelected ? 48 : 40, isSelected ? 48 : 40],
    iconAnchor: [isSelected ? 24 : 20, isSelected ? 24 : 20],
  });
};
export function MapView({ hosts, onMarkerClick, selectedHostId, center }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      const map = L.map(mapRef.current, {
        center: center,
        zoom: 12,
        scrollWheelZoom: false, // Better for scrollable pages
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      mapInstance.current = map;
      markersLayer.current = L.layerGroup().addTo(map);
    }
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [center]);
  useEffect(() => {
    if (markersLayer.current) {
      markersLayer.current.clearLayers();
      hosts.forEach((host) => {
        const lat = host.location?.lat;
        const lng = host.location?.lng;
        if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
          console.warn(`Skipping host ${host.id} due to invalid location:`, host.location);
          return;
        }
        const isSelected = host.id === selectedHostId;
        const marker = L.marker([lat, lng], {
          icon: createMarkerIcon(isSelected),
        })
          .addTo(markersLayer.current!)
          .on('click', () => {
            onMarkerClick(host.id);
            if (mapInstance.current && !(Number.isNaN(lat) || Number.isNaN(lng))) {
              mapInstance.current.setView([lat, lng], 14, { animate: true });
            } else {
              console.warn(`Cannot set view for host ${host.id} due to invalid location:`, host.location);
            }
          });
        marker.bindPopup(
          `
          <div class="font-sans">
            <h3 class="font-bold">${host.name}</h3>
            <p class="text-sm text-gray-600">${host.pricePerNight}/night</p>
            <a href="/hosts/${host.id}" class="text-blue-600 font-semibold mt-1 inline-block">View Profile &rarr;</a>
          </div>
          `,
          { closeButton: false }
        );
      });
    }
  }, [hosts, selectedHostId, onMarkerClick]);
  useEffect(() => {
    if (selectedHostId) {
      const host = hosts.find(h => h.id === selectedHostId);
      if (host) {
        const lat = host.location?.lat;
        const lng = host.location?.lng;
        if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
          console.warn(`Cannot set view for selected host ${selectedHostId} due to invalid location:`, host.location);
        } else if (mapInstance.current) {
          mapInstance.current.setView([lat, lng], 14, { animate: true });
        }
      }
    }
  }, [selectedHostId, hosts]);
  return (
    <div
      ref={mapRef}
      className="relative w-full aspect-square md:aspect-video bg-blue-100 dark:bg-blue-900/30 rounded-2xl overflow-hidden border-4 border-white dark:border-dogroom-ink shadow-lg"
    />
  );
}