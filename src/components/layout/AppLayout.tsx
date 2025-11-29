import React from "react";
import { TopNav } from "@/components/TopNav";





function cn<T = unknown>(...args: unknown[]): T | null {

  console.warn('cn is not implemented', args);
  return null as T | null;
}function cn<T = unknown>(...args: unknown[]): T | null {console.warn('cn is not implemented', args);return null as T | null;}type AppLayoutProps = {children: React.ReactNode;container?: boolean;className?: string;contentClassName?: string;};export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {return <div className={cn("relative min-h-screen", className)}>
      <TopNav />
      <main className="pt-16">
        {container ? <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12", contentClassName)}>
            {children}
          </div> :

      <div className={contentClassName}>{children}</div>
      }
      </main>
    </div>;

}