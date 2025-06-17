
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import PhotoUploadButton from './PhotoUploadButton';

interface PhotoUploadPromptProps {
  isOpen: boolean;
  onClose: () => void;
  habitName: string;
  activityDate: Date;
  onPhotoUploaded?: () => void;
}

const PhotoUploadPrompt: React.FC<PhotoUploadPromptProps> = ({
  isOpen,
  onClose,
  habitName,
  activityDate,
  onPhotoUploaded
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const handleSkip = () => {
    if (dontShowAgain) {
      localStorage.setItem('hidePhotoPrompt', 'true');
    }
    onClose();
  };

  const handleUploadClick = () => {
    setShowUpload(true);
  };

  const handlePhotoUploaded = () => {
    setShowUpload(false);
    onClose();
    onPhotoUploaded?.();
  };

  if (showUpload) {
    return (
      <PhotoUploadButton
        habitName={habitName}
        activityDate={activityDate}
        onPhotoUploaded={handlePhotoUploaded}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4">
        <div className="text-center space-y-6 p-2">
          <h3 className="text-lg font-semibold text-gray-800">
            Want to add a photo?
          </h3>
          
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleUploadClick}
              className="bg-green-600 hover:bg-green-700 text-white gap-2 py-3"
            >
              <Camera size={20} />
              📸 Upload Photo
            </Button>
            
            <Button
              onClick={handleSkip}
              variant="outline"
              className="gap-2 py-3"
            >
              <X size={16} />
              ❌ Skip
            </Button>
          </div>

          <div className="flex items-center space-x-2 justify-center">
            <Checkbox
              id="dont-show"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
            />
            <label
              htmlFor="dont-show"
              className="text-sm text-gray-500 cursor-pointer"
            >
              Don't show this again
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoUploadPrompt;
