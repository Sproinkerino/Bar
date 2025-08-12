/*
  # Create users and messages tables for Bubble Messenger

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `avatar` (text, URL to avatar image)
      - `aura` (integer, default 0)
      - `is_online` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `bubbles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `message` (text)
      - `x` (numeric, bubble position)
      - `y` (numeric, bubble position)
      - `vx` (numeric, velocity x)
      - `vy` (numeric, velocity y)
      - `reactions` (integer, default 0)
      - `created_at` (timestamp)
    
    - `direct_messages`
      - `id` (uuid, primary key)
      - `from_user_id` (uuid, references profiles)
      - `to_user_id` (uuid, references profiles)
      - `message` (text)
      - `read` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for reading public bubble data
    - Add policies for direct messages between users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  avatar text,
  aura integer DEFAULT 0,
  is_online boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bubbles table
CREATE TABLE IF NOT EXISTS bubbles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  x numeric NOT NULL,
  y numeric NOT NULL,
  vx numeric DEFAULT 0,
  vy numeric DEFAULT 0,
  reactions integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create direct_messages table
CREATE TABLE IF NOT EXISTS direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  to_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bubbles ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Bubbles policies
CREATE POLICY "Anyone can read bubbles"
  ON bubbles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own bubbles"
  ON bubbles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bubbles"
  ON bubbles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Direct messages policies
CREATE POLICY "Users can read their own messages"
  ON direct_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send messages"
  ON direct_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update messages they received"
  ON direct_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = to_user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bubbles_user_id ON bubbles(user_id);
CREATE INDEX IF NOT EXISTS idx_bubbles_created_at ON bubbles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_from_user ON direct_messages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_to_user ON direct_messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON direct_messages(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();