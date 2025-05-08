
import { Plus } from "lucide-react";
import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="py-8 px-5 flex items-center justify-between max-w-3xl mx-auto w-full border-b border-gray-200">
      <div className="flex-1"></div>
      <h1 className="text-4xl font-black tracking-tighter">
        Day<span className="tracking-[-0.1em] text-green-700">One</span>
      </h1>
      <div className="flex-1 flex justify-end">
        <Button 
          variant="ghost" 
          className="text-green-800 hover:bg-green-50 rounded-full p-1 h-auto"
          size="icon"
        >
          <Plus size={28} strokeWidth={2.5} />
        </Button>
      </div>
    </header>
  );
};

export default Header;
