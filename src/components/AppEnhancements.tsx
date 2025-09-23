import React from "react";
import { ScrollToTop, ProgressBar } from "./ui/enhanced-elements";
import { AccessibleIcon, SkipLink } from "./ui/accessibility";

export const AppEnhancements: React.FC = () => {
  return (
    <>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <ScrollToTop />
    </>
  );
};