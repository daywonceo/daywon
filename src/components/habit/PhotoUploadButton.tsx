
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { hapticSuccess } from '@/utils/haptics';

interface PhotoUploadButtonProps {
  habitName: string;
  activityDate: Date;
  onPhotoUploaded?: () => void;
}

const PhotoUploadButton: React.FC<PhotoUploadButtonProps> = ({
  habitName,
  activityDate,
  onPhotoUploaded
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const { user } = useAuth();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    try {
      // Create file path: userId/habitName/timestamp-filename
      const timestamp = Date.now();
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${timestamp}-${habitName.toLowerCase()}.${fileExt}`;
      const filePath = `${user.id}/${habitName}/${fileName}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('habit-photos')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('habit-photos')
        .getPublicUrl(filePath);

      // Save photo record to database
      const { error: dbError } = await supabase
        .from('habit_photos')
        .insert({
          user_id: user.id,
          habit_name: habitName,
          photo_url: publicUrl,
          activity_date: activityDate.toISOString().split('T')[0],
          caption: caption.trim() || null
        });

      if (dbError) throw dbError;

      hapticSuccess();
      toast({
        title: "Photo uploaded!",
        description: "Your habit proof has been saved to your gallery",
      });

      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setCaption('');
      setIsOpen(false);
      onPhotoUploaded?.();

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Could not upload your photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white gap-2"
        >
          <Camera size={16} />
          Upload Photo!
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Visual Proof for {habitName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!selectedFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <span className="text-sm text-gray-600">
                  Click to upload a photo or drag and drop
                </span>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <img
                  src={preview!}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={clearSelection}
                >
                  <X size={16} />
                </Button>
              </div>
              <Textarea
                placeholder="Add a caption (optional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
              />
              <Button
                onClick={uploadPhoto}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? 'Uploading...' : 'Save Photo'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoUploadButton;
