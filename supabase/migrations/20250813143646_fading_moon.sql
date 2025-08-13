/*
  # Fix profiles table RLS policy

  1. Security Updates
    - Update INSERT policy for profiles table to allow authenticated users to create their own profiles
    - Ensure the policy uses auth.uid() = id for proper user identification

  2. Changes
    - Drop existing INSERT policy if it exists
    - Create new INSERT policy that allows users to insert their own profile data
*/

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new INSERT policy that allows authenticated users to create their own profiles
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;