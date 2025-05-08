
import { Plus } from "lucide-react";

const Header = () => {
  return (
    <header className="py-6 px-5 flex items-center justify-between max-w-3xl mx-auto w-full">
      <div className="flex-1"></div>
      <h1 className="text-3xl font-black tracking-tighter">
        Day<span className="tracking-[-0.1em]">One</span>
      </h1>
      <div className="flex-1 flex justify-end">
        <button className="text-green-800 hover:bg-green-50 rounded-full p-1">
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );
};

export default Header;
