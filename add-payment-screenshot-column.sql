-- Migration: Add payment_screenshot column to history_events table
-- Run this if you already have the database set up and want to add payment screenshot feature

-- Add the payment_screenshot column to history_events table
ALTER TABLE history_events ADD COLUMN IF NOT EXISTS payment_screenshot TEXT;

-- Done! The payment screenshot feature is now enabled.
