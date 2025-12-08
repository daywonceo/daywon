import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  hideFooter?: boolean;
  mainClassName?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  className,
  hideFooter = false,
  mainClassName
}) => {
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-primary-light/20 via-background to-accent/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col",
      className
    )}>
      <Header />
      <main className={cn(
        "flex-grow px-responsive pb-safe-mobile pt-6 max-w-4xl mx-auto w-full",
        mainClassName
      )}>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default PageLayout;
