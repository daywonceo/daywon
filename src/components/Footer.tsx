
import { Grid2x2, Calendar, Settings } from "lucide-react";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
      <div className="max-w-3xl mx-auto flex items-center justify-between px-12 py-4">
        <button className="flex flex-col items-center">
          <Grid2x2 size={28} />
        </button>
        <button className="flex flex-col items-center">
          <Calendar size={28} />
        </button>
        <button className="flex flex-col items-center">
          <Settings size={28} />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
