-- Add assoc_id to profiles (used by employees to know which association they belong to)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS assoc_id uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- Add user_id and email to employees (link DB row to auth user)
ALTER TABLE employees ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS email text;

-- Allow "employee" as a valid role in profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'association', 'employee'));

-- RLS: employees can read their own profile
DROP POLICY IF EXISTS "employees_read_own_profile" ON profiles;
CREATE POLICY "employees_read_own_profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- RLS: employees can read the association they belong to
DROP POLICY IF EXISTS "employees_read_assoc" ON associations;
CREATE POLICY "employees_read_assoc"
  ON associations FOR SELECT
  USING (
    id IN (
      SELECT assoc_id FROM profiles WHERE id = auth.uid() AND role = 'employee'
    )
  );

-- RLS: employees can read tasks of their association
DROP POLICY IF EXISTS "employees_read_tasks" ON tasks;
CREATE POLICY "employees_read_tasks"
  ON tasks FOR SELECT
  USING (
    assoc_id IN (
      SELECT assoc_id FROM profiles WHERE id = auth.uid() AND role = 'employee'
    )
  );

-- RLS: employees can update task status for tasks assigned to them
DROP POLICY IF EXISTS "employees_update_own_tasks" ON tasks;
CREATE POLICY "employees_update_own_tasks"
  ON tasks FOR UPDATE
  USING (
    assoc_id IN (
      SELECT assoc_id FROM profiles WHERE id = auth.uid() AND role = 'employee'
    )
  );

-- RLS: employees can read their colleagues
DROP POLICY IF EXISTS "employees_read_team" ON employees;
CREATE POLICY "employees_read_team"
  ON employees FOR SELECT
  USING (
    assoc_id IN (
      SELECT assoc_id FROM profiles WHERE id = auth.uid() AND role = 'employee'
    )
  );
