/*
# Staff Management System Database Schema

1. New Tables
  - `profiles` - User profiles with role-based access (admin/staff)
    - `id` (uuid, primary key, references auth.users)
    - `email` (text, unique)
    - `full_name` (text)
    - `role` (text, admin or staff)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)
  
  - `classes` - Class information for teaching logs
    - `id` (uuid, primary key)
    - `name` (text, class name)
    - `description` (text, optional)
    - `created_at` (timestamp)
  
  - `time_logs` - Daily arrival time tracking
    - `id` (uuid, primary key)
    - `staff_id` (uuid, references profiles)
    - `date` (date)
    - `arrival_time` (time)
    - `created_at` (timestamp)
  
  - `teaching_logs` - Teaching time per class tracking
    - `id` (uuid, primary key)
    - `staff_id` (uuid, references profiles)
    - `class_id` (uuid, references classes)
    - `date` (date)
    - `start_time` (time)
    - `end_time` (time)
    - `created_at` (timestamp)

2. Security
  - Enable RLS on all tables
  - Add policies for admin access to all data
  - Add policies for staff to access only their own data
  - Prevent staff from modifying other staff records

3. Sample Data
  - Create sample classes for demonstration
  - Create admin user for initial setup
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'staff')) DEFAULT 'staff',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create time_logs table
CREATE TABLE IF NOT EXISTS time_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  arrival_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(staff_id,date)
);

-- Create teaching_logs table
CREATE TABLE IF NOT EXISTS teaching_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  CHECK (end_time > start_time)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Staff can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Staff can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = 'staff');

-- Classes policies
CREATE POLICY "Everyone can read classes"
  ON classes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage classes"
  ON classes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Time logs policies
CREATE POLICY "Admins can manage all time logs"
  ON time_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Staff can manage own time logs"
  ON time_logs
  FOR ALL
  TO authenticated
  USING (staff_id = auth.uid());

-- Teaching logs policies
CREATE POLICY "Admins can manage all teaching logs"
  ON teaching_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Staff can manage own teaching logs"
  ON teaching_logs
  FOR ALL
  TO authenticated
  USING (staff_id = auth.uid());

-- Insert sample classes
INSERT INTO classes (name, description) VALUES
  ('Mathematics', 'Basic and advanced mathematics courses'),
  ('Science', 'Physics, Chemistry, and Biology classes'),
  ('English Literature', 'Reading, writing, and literature analysis'),
  ('History', 'World history and social studies'),
  ('Computer Science', 'Programming and technology courses')
ON CONFLICT DO NOTHING;

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();