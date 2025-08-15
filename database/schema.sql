-- Super Unipole System Database Schema
-- Run this SQL in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Units table for storing advertising unit information
CREATE TABLE IF NOT EXISTS units (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  unit_id TEXT UNIQUE NOT NULL,
  location TEXT NOT NULL,
  governorate TEXT NOT NULL,
  lat_lng TEXT NOT NULL, -- Format: "latitude,longitude"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table for storing campaign information
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  unit_ids TEXT[] NOT NULL DEFAULT '{}', -- Array of unit IDs
  export_url TEXT, -- URL for exported campaign map
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table for storing application preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  default_zoom INTEGER DEFAULT 10,
  default_center_lat DECIMAL DEFAULT 30.0444, -- Cairo, Egypt
  default_center_lng DECIMAL DEFAULT 31.2357,
  preferred_governorate TEXT,
  map_style TEXT DEFAULT 'default',
  marker_style TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_units_unit_id ON units(unit_id);
CREATE INDEX IF NOT EXISTS idx_units_governorate ON units(governorate);
CREATE INDEX IF NOT EXISTS idx_units_created_at ON units(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
-- Note: In a production environment, you should implement proper authentication
-- and create more restrictive policies based on user roles

-- Units policies
CREATE POLICY "Allow all operations on units" ON units
  FOR ALL USING (true);

-- Campaigns policies  
CREATE POLICY "Allow all operations on campaigns" ON campaigns
  FOR ALL USING (true);

-- User settings policies
CREATE POLICY "Allow all operations on user_settings" ON user_settings
  FOR ALL USING (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default user settings
INSERT INTO user_settings (
  default_zoom,
  default_center_lat,
  default_center_lng,
  map_style,
  marker_style
) VALUES (
  10,
  30.0444,
  31.2357,
  'default',
  'default'
) ON CONFLICT DO NOTHING;
