import React, { useState, useRef, WheelEvent } from 'react';
import { motion, useMotionValue, useSpring, PanInfo } from 'framer-motion';
import { PawPrint } from 'lucide-react';
import type { HostPreview } from '@shared/types';
import { useIsMobile } from '@/hooks/use-mobile';
interface MapViewProps {
  hosts: HostPreview[];
  onMarkerClick: (hostId: string) => void;
  selectedHostId?: string | null;
}
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
export function MapView({ hosts, onMarkerClick, selectedHostId }: MapViewProps) {
  const isMobile = useIsMobile();
  const svgRef = useRef<SVGSVGElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const springScale = useSpring(scale, springConfig);
  const handleWheel = (e: WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const { deltaY, clientX, clientY } = e;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const point = { x: clientX - rect.left, y: clientY - rect.top };
    const currentScale = scale.get();
    const zoomFactor = 1 - deltaY * 0.001;
    let newScale = currentScale * zoomFactor;
    newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale));
    const scaleChange = newScale / currentScale;
    const currentX = x.get();
    const currentY = y.get();
    const newX = currentX + (point.x - currentX) * (1 - scaleChange);
    const newY = currentY + (point.y - currentY) * (1 - scaleChange);
    scale.set(newScale);
    x.set(newX);
    y.set(newY);
  };
  const handlePan = (_: any, info: PanInfo) => {
    const currentScale = scale.get();
    const newX = x.get() + info.delta.x;
    const newY = y.get() + info.delta.y;
    x.set(newX);
    y.set(newY);
  };
  return (
    <div className="relative w-full aspect-square md:aspect-video bg-blue-100 dark:bg-blue-900/30 rounded-2xl overflow-hidden border-4 border-white dark:border-dogroom-ink shadow-lg touch-none">
      <motion.svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
      >
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(33, 175, 255, 0.2)" strokeWidth="0.2"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        <motion.g
          drag={!isMobile}
          onPan={isMobile ? handlePan : undefined}
          dragConstraints={{
            left: -(100 * (scale.get() - 1)),
            right: 0,
            top: -(100 * (scale.get() - 1)),
            bottom: 0,
          }}
          style={{
            translateX: springX,
            translateY: springY,
            scale: springScale,
            transformOrigin: '0 0',
          }}
        >
          {hosts.map((host) => (
            <motion.g
              key={host.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: Math.random() * 0.3 }}
              transform={`translate(${host.location.x * 100}, ${host.location.y * 100})`}
            >
              <motion.g
                onClick={() => onMarkerClick(host.id)}
                whileHover={{ scale: 1.2, z: 10 }}
                whileTap={{ scale: 0.95 }}
                animate={{ scale: selectedHostId === host.id ? 1.3 : 1, z: selectedHostId === host.id ? 20 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="cursor-pointer"
              >
                <circle
                  r="4"
                  className={`transition-colors duration-300 ${selectedHostId === host.id ? 'fill-dogroom-accent' : 'fill-white'}`}
                  stroke={selectedHostId === host.id ? 'white' : 'hsl(var(--primary))'}
                  strokeWidth="0.5"
                />
                <PawPrint
                  className={`w-4 h-4 -translate-x-2 -translate-y-2 transition-colors duration-300 ${selectedHostId === host.id ? 'text-white' : 'text-dogroom-primary'}`}
                />
              </motion.g>
            </motion.g>
          ))}
        </motion.g>
      </motion.svg>
    </div>
  );
}