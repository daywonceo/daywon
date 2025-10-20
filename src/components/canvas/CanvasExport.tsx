import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";

interface CanvasExportProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  completionPercentage: number;
  filledTiles: number;
  totalTiles: number;
}

export default function CanvasExport({ 
  canvasRef, 
  completionPercentage,
  filledTiles,
  totalTiles 
}: CanvasExportProps) {
  
  const handleExport = async () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `daywon-canvas-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success("Canvas exported successfully!");
    } catch (error) {
      toast.error("Failed to export canvas");
      console.error(error);
    }
  };

  const handleShare = async () => {
    const shareText = `I've completed ${filledTiles} habits (${completionPercentage}% of my canvas) on DayWon! 🎨`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My DayWon Canvas',
          text: shareText,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Share text copied to clipboard!");
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Export
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share
      </Button>
    </div>
  );
}
