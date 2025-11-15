-- Row Level Security Policies for LEHELP Platform
-- Run this after init.sql to secure all tables

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_assignments ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- User profiles policies
CREATE POLICY "Users can view own user_profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own user_profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user_profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Lawyer profiles policies
CREATE POLICY "Anyone can view verified lawyers" ON lawyer_profiles
  FOR SELECT USING (verified = true);

CREATE POLICY "Lawyers can view own profile" ON lawyer_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Lawyers can update own profile" ON lawyer_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Lawyers can insert own profile" ON lawyer_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Cases policies
CREATE POLICY "Users can view own cases" ON cases
  FOR SELECT USING (
    auth.uid() = client_id OR 
    auth.uid() = assigned_lawyer_id
  );

CREATE POLICY "Clients can insert cases" ON cases
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Case participants can update" ON cases
  FOR UPDATE USING (
    auth.uid() = client_id OR 
    auth.uid() = assigned_lawyer_id
  );

-- Case events policies
CREATE POLICY "Case participants can view events" ON case_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = case_events.case_id 
      AND (cases.client_id = auth.uid() OR cases.assigned_lawyer_id = auth.uid())
    )
  );

CREATE POLICY "Case participants can insert events" ON case_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = case_events.case_id 
      AND (cases.client_id = auth.uid() OR cases.assigned_lawyer_id = auth.uid())
    )
  );

-- Documents policies
CREATE POLICY "Case participants can view documents" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = documents.case_id 
      AND (cases.client_id = auth.uid() OR cases.assigned_lawyer_id = auth.uid())
    )
  );

CREATE POLICY "Case participants can upload documents" ON documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = documents.case_id 
      AND (cases.client_id = auth.uid() OR cases.assigned_lawyer_id = auth.uid())
    )
  );

-- Messages policies
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete own messages" ON messages
  FOR UPDATE USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Activity logs policies
CREATE POLICY "Users can view own activity" ON activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Case assignments policies
CREATE POLICY "Lawyers can view own assignments" ON case_assignments
  FOR SELECT USING (auth.uid() = lawyer_id);

CREATE POLICY "Case owners can view assignments" ON case_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = case_assignments.case_id 
      AND cases.client_id = auth.uid()
    )
  );

CREATE POLICY "Lawyers can update own assignments" ON case_assignments
  FOR UPDATE USING (auth.uid() = lawyer_id);
