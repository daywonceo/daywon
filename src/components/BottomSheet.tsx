
import { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

// Accept children as render prop if function (pass close fn for custom sheets)
type BottomSheetProps = {
  trigger: ReactNode;
  title: string;
  children: ReactNode | ((close: () => void) => ReactNode);
};

const BottomSheet = ({ trigger, title, children }: BottomSheetProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Provide close handler for render prop use-case
  const handleClose = () => setIsOpen(false);
  const isFunctionChild = typeof children === "function";

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle className="flex items-center justify-center relative">
              <ChevronDown className="absolute left-0" size={20} />
              <span>{title}</span>
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-6">
            {isFunctionChild ? (children as (close: () => void) => ReactNode)(handleClose) : children}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default BottomSheet;
