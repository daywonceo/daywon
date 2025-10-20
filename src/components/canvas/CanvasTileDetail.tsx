import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp } from "lucide-react";

interface CanvasTileDetailProps {
  isOpen: boolean;
  onClose: () => void;
  tile: {
    habitName: string;
    date: string;
    color: string;
    category?: string;
  } | null;
}

export default function CanvasTileDetail({ isOpen, onClose, tile }: CanvasTileDetailProps) {
  if (!tile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${tile.color}`} />
            {tile.habitName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{format(parseISO(tile.date), 'EEEE, MMMM d, yyyy')}</span>
          </div>
          
          {tile.category && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{tile.category}</Badge>
            </div>
          )}
          
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Part of your growth journey</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
