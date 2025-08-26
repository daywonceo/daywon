
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useHabits, Habit } from "@/hooks/useHabits";
import { useHabitDeduplication } from "@/hooks/useHabitDeduplication";
import { toast } from "@/hooks/use-toast";

type HabitFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habitToEdit?: Habit | null;
};

const HabitFormDialog: React.FC<HabitFormDialogProps> = ({ open, onOpenChange, habitToEdit }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { addHabit, updateHabit } = useHabits();
  const { checkForDuplicate } = useHabitDeduplication();

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setDescription(habitToEdit.description || "");
      setCategory(habitToEdit.category || "");
    } else {
      setName("");
      setDescription("");
      setCategory("");
    }
  }, [habitToEdit, open]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Habit name is required.", variant: "destructive" });
      return;
    }

    // Check for duplicates only when creating new habits (not editing)
    if (!habitToEdit) {
      const duplicate = checkForDuplicate(name.trim());
      if (duplicate) {
        toast({ 
          title: "That habit already exists — try editing the existing one!",
          description: `Found existing habit: "${duplicate.name}"`,
          variant: "destructive" 
        });
        return;
      }
    }

    setIsSaving(true);
    try {
      if (habitToEdit) {
        await updateHabit({
          id: habitToEdit.id,
          name: name.trim(),
          description,
          category,
        });
        toast({ title: "Habit updated!" });
      } else {
        await addHabit({
          name: name.trim(),
          description,
          category,
          status: "active",
          default_tracking_type: "DAILY"
        });
        toast({ title: "Habit added!" });
      }
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Error saving habit", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{habitToEdit ? "Edit Habit" : "Add a New Habit"}</DialogTitle>
          <DialogDescription>
            {habitToEdit ? "Update the details of your habit." : "Define a new habit to start tracking."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Read for 20 minutes" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Why is this habit important to you?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Health, Learning, Finance" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || !name.trim()}>{isSaving ? "Saving..." : "Save Habit"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HabitFormDialog;
