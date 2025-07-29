import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PenSquare, Send } from "lucide-react";
import { useSocialPosts } from "@/hooks/useSocialPosts";
import { toast } from "sonner";

interface CreatePostModalProps {
  trigger?: React.ReactNode;
}

const CreatePostModal = ({ trigger }: CreatePostModalProps) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const { createPost } = useSocialPosts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("Please write something to share!");
      return;
    }

    setLoading(true);
    try {
      await createPost({
        habit_name: "",  // Empty for manual posts
        content: content.trim(),
        caption: caption.trim() || undefined,
        streak_count: 0,
        is_milestone: false,
      });
      
      setContent("");
      setCaption("");
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
            <Label htmlFor="caption">Additional details (optional)</Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add any extra context..."
              maxLength={200}
            />
            <div className="text-xs text-muted-foreground text-right">
              {caption.length}/200
            </div>
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