-- Allow owners to update their own habits (needed to set ended_at)
CREATE POLICY "habits owner can update"
ON public.habits FOR UPDATE
USING (auth.uid() = user_id);

-- Allow owners to delete their own habits (for Delete forever)
CREATE POLICY "habits owner can delete"
ON public.habits FOR DELETE
USING (auth.uid() = user_id);