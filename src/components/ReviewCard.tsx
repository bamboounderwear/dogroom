import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import type { Review } from '@shared/types';
interface ReviewCardProps {
  review: Review;
}
export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={review.user?.avatar} alt={review.user?.name} />
              <AvatarFallback>{review.user?.name?.charAt(0) ?? 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{review.user?.name ?? 'Anonymous'}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(review.ts), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < review.rating ? 'text-dogroom-accent fill-current' : 'text-muted-foreground/50'}`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{review.comment}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}