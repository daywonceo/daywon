-- Allow habit_name to be optional for manual posts
ALTER TABLE social_posts ALTER COLUMN habit_name DROP NOT NULL;