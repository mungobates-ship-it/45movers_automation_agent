# Dashboard Setup Guide

## 1. Supabase Setup

### Create Supabase Project
- Go to [supabase.com](https://supabase.com) and sign in
- Create a new project or use existing one
- Copy your project URL and anonymous key

### Database Schema
Run this SQL in Supabase SQL Editor:

```sql
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('critical','high','medium','low')) NOT NULL,
  status TEXT CHECK (status IN ('pending','in_progress','completed')) DEFAULT 'pending',
  owner TEXT,
  role TEXT,
  timeline TEXT,
  est_cost NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security) - allow all reads/writes for MVP
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON tasks FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public insert" ON tasks FOR INSERT WITH CHECK (true);
```

## 2. Environment Variables

Update `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Seed Data

Run this SQL in Supabase SQL Editor to insert the 22 PDR action items:

```sql
INSERT INTO tasks (title, description, priority, status, owner, role, timeline, est_cost) VALUES
('Xero reconciliation', 'Reconcile all accounts in Xero', 'critical', 'pending', 'Mungo Bates', 'Owner', 'This week', 0),
('Overdue invoice chasing', 'Follow up on unpaid invoices', 'critical', 'pending', 'Mungo Bates', 'Finance Agent', 'Ongoing', 0),
('Stripe integration', 'Set up Stripe for payment processing', 'critical', 'pending', 'Mungo Bates', 'Owner', 'Next week', 500),
('Daily vehicle checks', 'Establish daily vehicle inspection routine', 'high', 'pending', NULL, 'Crew Lead', 'This month', 0),
('Blanket stock management', 'Organize and track blanket inventory', 'high', 'pending', NULL, 'Operations', 'This week', 200),
('Training videos', 'Create crew training video library', 'high', 'pending', NULL, 'HR', 'Next month', 1000),
('Safety briefing protocol', 'Document safety briefing procedures', 'high', 'pending', NULL, 'Operations', 'This week', 0),
('Sign-off form', 'Create job completion sign-off form', 'high', 'pending', NULL, 'Customer Service', 'This week', 0),
('Incident forms', 'Create incident report forms', 'high', 'pending', NULL, 'HR', 'This week', 0),
('Police checks', 'Initiate police checks for all crew', 'high', 'pending', NULL, 'HR', 'Ongoing', 50),
('Reference checks', 'Conduct reference checks on crew', 'high', 'pending', NULL, 'HR', 'Ongoing', 0),
('H&S induction', 'Create health & safety induction program', 'high', 'pending', NULL, 'HR', 'Next month', 500),
('Uniform stock', 'Order and manage uniform inventory', 'high', 'pending', NULL, 'Operations', 'This month', 300),
('Crew bonuses', 'Establish crew bonus structure', 'medium', 'pending', NULL, 'Finance Agent', 'Next month', 0),
('Google Reviews QR code', 'Create QR code for Google Reviews', 'medium', 'pending', NULL, 'Sales', 'This week', 0),
('Booking calendar widget', 'Develop online booking system widget', 'medium', 'pending', NULL, 'Operations', 'Next month', 800),
('Crew hour tracking', 'Implement crew hour tracking system', 'medium', 'pending', NULL, 'Finance Agent', 'Next month', 600),
('Payment plan system', 'Set up customer payment plans', 'medium', 'pending', NULL, 'Finance Agent', 'Next month', 400),
('Payroll frequency', 'Determine optimal payroll schedule', 'medium', 'pending', NULL, 'Finance Agent', 'This month', 0),
('Accident protocol', 'Document accident response procedures', 'low', 'pending', NULL, 'Operations', 'Next month', 0),
('Vehicle maintenance log', 'Create vehicle maintenance tracking', 'low', 'pending', NULL, 'Operations', 'Next month', 0),
('Payroll frequency documentation', 'Document payroll schedule decision', 'low', 'pending', NULL, 'Finance Agent', 'This month', 0);
```

## 4. Run Local Development

```bash
cd 45movers-dashboard
npm run dev
```

Open [localhost:3000](http://localhost:3000) to see the dashboard.

## 5. Test Features

- ✅ View 22 tasks
- ✅ Filter by priority, status, role
- ✅ Click status badge to cycle status (pending → in_progress → completed)
- ✅ Watch progress bar update
- ✅ Verify Supabase updates tasks in real-time

## 6. Deploy to Vercel

```bash
# Initialize git and commit
git init
git add .
git commit -m "Initial PDR dashboard"

# Push to GitHub (create repo first)
git remote add origin https://github.com/YOUR_USERNAME/45movers-dashboard.git
git branch -M main
git push -u origin main
```

Then:
1. Go to [vercel.com](https://vercel.com)
2. Import the GitHub repository
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

Your dashboard will be live at your Vercel URL!
