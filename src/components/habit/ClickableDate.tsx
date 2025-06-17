
import React, { useState, useEffect } from 'react';
import { Camera, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PhotoUploadButton from './PhotoUploadButton';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ClickableDateProps {
  day: number;
  date: Date;
  habitName: string;
  onPhotoUpdate?: () => void;
}

const ClickableDate: React.FC<ClickableDateProps> = ({
  day,
  date,
  habitName,
  onPhotoUpdate
}) => {
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    checkForPhoto();
  }, [date, habitName, user]);

  const checkForPhoto = async () => {
    if (!user) return;

    try {
      const dateString = date.toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('habit_photos')
        .select('photo_url')
        .eq('user_id', user.id)
        .eq('habit_name', habitName)
        .eq('activity_date', dateString)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      setHasPhoto(!!data);
      setPhotoUrl(data?.photo_url || null);
    } catch (error) {
      console.error('Error checking for photo:', error);
    }
  };

  const handleDateClick = () => {
    if (hasPhoto) {
      setShowPreview(true);
    } else {
      setShowUpload(true);
    }
  };

  const handlePhotoUploaded = () => {
    setShowUpload(false);
    checkForPhoto();
    onPhotoUpdate?.();
  };

  return (
    <>
      <div 
        className="relative cursor-pointer group"
        onClick={handleDateClick}
      >
        <div className="text-center text-3xl sm:text-4xl font-bold text-green-800">
          {day}
        </div>
        
        {hasPhoto && (
          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
            <Image size={12} className="text-white" />
          </div>
        )}
        
        {!hasPhoto && (
          <div className="absolute -top-1 -right-1 bg-gray-400 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={12} className="text-white" />
          </div>
        )}
      </div>

      {showUpload && (
        <PhotoUploadButton
          habitName={habitName}
          activityDate={date}
          onPhotoUploaded={handlePhotoUploaded}
        />
      )}

      {showPreview && photoUrl && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-md">
            <div className="space-y-4">
              <h3 className="font-semibold text-center">
                {habitName} - {date.toLocaleDateString()}
              </h3>
              <img
                src={photoUrl}
                alt={`${habitName} photo`}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ClickableDate;
