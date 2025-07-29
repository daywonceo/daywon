import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PenSquare, Send, Camera, Upload, X, Plus } from "lucide-react";
import { useSocialPosts } from "@/hooks/useSocialPosts";
import { useHabits } from "@/hooks/useHabits";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CreatePostModalProps {
  trigger?: React.ReactNode;
}

const CreatePostModal = ({ trigger }: CreatePostModalProps) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [selectedHabit, setSelectedHabit] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { createPost } = useSocialPosts();
  const { habits } = useHabits();
  const { user } = useAuth();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File too large - please select an image under 5MB");
        return;
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("Please write something to share!");
      return;
    }

    setLoading(true);
    try {
      let photoUrl = null;

      // Upload photo if selected
      if (selectedFile && user) {
        const timestamp = Date.now();
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${timestamp}-post.${fileExt}`;
        const filePath = `${user.id}/posts/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('habit-photos')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('habit-photos')
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      await createPost({
        habit_name: selectedHabit || "",
        content: content.trim(),
        photo_url: photoUrl,
        streak_count: 0,
        is_milestone: false,
      });
      
      setContent("");
      setSelectedHabit("");
      setSelectedFile(null);
      setPreview(null);
      setOpen(false);
      toast.success("Post shared successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to share post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button
      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-md"
      size="lg"
    >
      <PenSquare className="w-4 h-4 mr-2" />
      Share Something
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenSquare className="w-5 h-5" />
            Create Post
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="habit">Related habit (optional)</Label>
            <Select value={selectedHabit} onValueChange={setSelectedHabit}>
              <SelectTrigger>
                <SelectValue placeholder="Select a habit or leave empty" />
              </SelectTrigger>
              <SelectContent>
                {habits?.filter(h => h.status === 'active').map((habit) => (
                  <SelectItem key={habit.id} value={habit.name}>
                    {habit.name}
                  </SelectItem>
                ))}
                <SelectItem value="__add_new__" className="text-primary">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add a New Habit
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">What's on your mind?</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, wins, or something inspiring..."
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {content.length}/500
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Add a photo (optional)</Label>
            {!selectedFile ? (
              <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center hover:border-muted-foreground/50 transition-colors">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <span className="text-sm text-muted-foreground">
                    Click to upload a photo
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
              <div className="relative">
                <img
                  src={preview!}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={clearSelection}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !content.trim()}
              className="flex-1"
              onClick={(e) => {
                if (selectedHabit === "__add_new__") {
                  e.preventDefault();
                  toast.error("Please create the habit first, then select it from the dropdown");
                  return;
                }
              }}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Share
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;