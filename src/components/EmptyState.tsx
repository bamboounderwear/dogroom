import React from 'react';
import { motion } from 'framer-motion';
import { PawPrint } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  cta?: {
    label: string;
    onClick?: () => void;
    to?: string;
  };
}
export function EmptyState({
  icon = <PawPrint className="w-16 h-16 text-muted-foreground/50" />,
  title,
  description,
  cta,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center h-full w-full py-10"
    >
      <Card className="w-full max-w-md text-center p-8 md:p-12 border-2 border-dashed bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center gap-4 p-0">
          {icon}
          <h3 className="text-xl font-semibold mt-4">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
          {cta && (
            cta.to ? (
              <Button asChild className="mt-4">
                <Link to={cta.to}>{cta.label}</Link>
              </Button>
            ) : (
              <Button className="mt-4" onClick={cta.onClick}>
                {cta.label}
              </Button>
            )
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}