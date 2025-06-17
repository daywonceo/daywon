
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Calendar, Camera, MoreVertical, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface HabitPhoto {
  id: string;
  habit_name: string;
  photo_url: string;
  activity_date: string;
  caption: string | null;
  is_shared: boolean;
  created_at: string;
}

interface HabitGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HabitGallery: React.FC<HabitGalleryProps> = ({ open, onOpenChange }) => {
  const [photos, setPhotos] = useState<HabitPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const { user } = useAuth();

  const loadPhotos = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habit_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error loading photos:', error);
      toast({
        title: "Error loading gallery",
        description: "Could not load your habit photos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && user) {
      loadPhotos();
    }
  }, [open, user]);

  const deletePhoto = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from('habit_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      setPhotos(photos.filter(p => p.id !== photoId));
      toast({
        title: "Photo deleted",
        description: "Photo removed from your gallery"
      });
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete the photo",
        variant: "destructive"
      });
    }
  };

  const toggleShare = async (photoId: string, currentShareStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('habit_photos')
        .update({ is_shared: !currentShareStatus })
        .eq('id', photoId);

      if (error) throw error;

      setPhotos(photos.map(p => 
        p.id === photoId 
          ? { ...p, is_shared: !currentShareStatus }
          : p
      ));

      toast({
        title: !currentShareStatus ? "Photo shared" : "Photo made private",
        description: !currentShareStatus ? "Photo is now visible to your groups" : "Photo is now private"
      });
    } catch (error) {
      console.error('Error updating share status:', error);
      toast({
        title: "Update failed",
        description: "Could not update sharing status",
        variant: "destructive"
      });
    }
  };

  const habits = [...new Set(photos.map(p => p.habit_name))];
  const filteredPhotos = selectedHabit 
    ? photos.filter(p => p.habit_name === selectedHabit)
    : photos;

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Habit Gallery</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Loading your gallery...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Habit Gallery</DialogTitle>
        </DialogHeader>
        
        {photos.length === 0 ? (
          <div className="text-center py-8">
            <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No photos yet!</p>
            <p className="text-sm text-gray-400">Complete habits and upload photos to start your visual journey</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Habit Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedHabit === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedHabit(null)}
              >
                All ({photos.length})
              </Button>
              {habits.map(habit => (
                <Button
                  key={habit}
                  variant={selectedHabit === habit ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedHabit(habit)}
                >
                  {habit} ({photos.filter(p => p.habit_name === habit).length})
                </Button>
              ))}
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredPhotos.map(photo => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={photo.photo_url}
                      alt={`${photo.habit_name} on ${photo.activity_date}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="secondary" className="h-8 w-8">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => toggleShare(photo.id, photo.is_shared)}
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          {photo.is_shared ? 'Make Private' : 'Share'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deletePhoto(photo.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Info */}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {photo.habit_name}
                      </Badge>
                      {photo.is_shared && (
                        <Badge variant="default" className="text-xs">
                          <Share2 size={10} className="mr-1" />
                          Shared
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar size={10} className="mr-1" />
                      {new Date(photo.activity_date).toLocaleDateString()}
                    </div>
                    {photo.caption && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HabitGallery;
