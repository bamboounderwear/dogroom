import React from 'react';
import { motion } from 'framer-motion';
import { Star, Home, Sun, Footprints } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { HostPreview, ServiceType } from '@shared/types';
import { Link } from 'react-router-dom';
interface HostCardProps {
  host: HostPreview;
}
const serviceIcons: Record<ServiceType, React.ReactNode> = {
  boarding: <Home className="w-4 h-4 mr-1" />,
  daycare: <Sun className="w-4 h-4 mr-1" />,
  walking: <Footprints className="w-4 h-4 mr-1" />,
};
export function HostCard({ host }: HostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="aspect-video bg-muted overflow-hidden">
            {/* In a real app, this would be a real image */}
            <img src={`/placeholder-dog-${(parseInt(host.id.slice(1)) % 4) + 1}.svg`} alt={host.name} className="w-full h-full object-cover" />
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={host.avatar} alt={host.name} />
                <AvatarFallback>{host.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg leading-tight">{host.name}</h3>
                <p className="text-sm text-muted-foreground">{host.location.city}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-dogroom-accent font-bold">
              <Star className="w-4 h-4 fill-current" />
              <span>{host.rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {host.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="capitalize flex items-center">
                {serviceIcons[tag]} {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-4 flex justify-between items-center bg-muted/50">
          <div>
            <span className="font-bold text-xl">${host.pricePerNight}</span>
            <span className="text-sm text-muted-foreground">/night</span>
          </div>
          <Button asChild>
            <Link to={`/hosts/${host.id}`}>View Profile</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
export function HostCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="h-5 w-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center bg-muted/50">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-10 w-28" />
      </CardFooter>
    </Card>
  );
}