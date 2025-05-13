
import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

type BottomSheetProps = {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
};

const BottomSheet = ({ trigger, title, children }: BottomSheetProps) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle className="flex items-center justify-center relative">
              <ChevronDown className="absolute left-0" size={20} />
              <span>{title}</span>
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-6">{children}</div>
          <div className="p-4 pt-0">
            <Button className="w-full bg-green-700 hover:bg-green-800" size="lg">
              Save
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default BottomSheet;
