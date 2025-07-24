-- Add foreign key constraints to notifications table if they don't exist
DO $$ 
BEGIN
    -- Add foreign key constraint for user_id to profiles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_user_id_fkey' 
        AND table_name = 'notifications'
    ) THEN
        ALTER TABLE notifications 
        ADD CONSTRAINT notifications_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key constraint for actor_id to profiles  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_actor_id_fkey' 
        AND table_name = 'notifications'
    ) THEN
        ALTER TABLE notifications 
        ADD CONSTRAINT notifications_actor_id_fkey 
        FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;