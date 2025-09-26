import React, { useEffect } from "react";
import { ScrollToTop, ProgressBar } from "./ui/enhanced-elements";
import { SkipLink } from "./ui/accessibility";
import { performanceMonitor } from "@/utils/performanceMonitor";

export const AppEnhancements: React.FC = () => {
  useEffect(() => {
    performanceMonitor.initialize();
    return () => performanceMonitor.cleanup();
  }, []);

  return (
    <>
      <SkipLink target="#main-content">Skip to main content</SkipLink>
      <ScrollToTop />
    </>
  );
};