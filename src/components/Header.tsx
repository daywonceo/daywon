
import { Plus, Search } from "lucide-react";
import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="py-6 px-5 flex items-center justify-between max-w-3xl mx-auto w-full border-b border-green-100 sticky top-0 bg-white z-10">
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-[180px]">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-8 py-1 pr-2 bg-gray-50 rounded-full text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-300"
          />
        </div>
      </div>
      <h1 className="text-4xl font-black tracking-tighter flex items-center">
        Day<span className="tracking-[-0.1em] text-green-700">One</span>
      </h1>
      <div className="flex-1 flex justify-end">
        <Button 
          variant="outline" 
          className="text-green-800 border-green-200 hover:bg-green-50 rounded-full h-9 w-9 p-0"
          size="icon"
        >
          <Plus size={20} />
        </Button>
      </div>
    </header>
  );
};

export default Header;
