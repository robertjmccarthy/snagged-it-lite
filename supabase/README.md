# Supabase Setup for SnaggedIt Lite

This directory contains the SQL script needed to set up the Supabase database for the SnaggedIt Lite application.

## How to Use the Setup Script

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project" and follow the setup wizard
4. Choose a name for your project and set a secure database password
5. Select a region closest to your users
6. Wait for your project to be created (this may take a few minutes)

### Step 2: Run the SQL Script

1. In your Supabase dashboard, navigate to the "SQL Editor" section
2. Click "New Query"
3. Copy the entire contents of the `setup.sql` file
4. Paste it into the SQL editor
5. Click "Run" to execute the script
6. Verify that the script ran successfully by checking the Tables section

### Step 3: Set Up Storage Bucket

The SQL script cannot create storage buckets directly, so you'll need to do this manually:

1. Go to the "Storage" section in your Supabase dashboard
2. Click "Create a new bucket"
3. Name it `issue-photos`
4. Set the bucket to private
5. Create the following RLS policies for the bucket:
   - **For SELECT operations:**
     - Policy name: "Users can view their own photos"
     - Policy definition: `auth.uid() = owner`
   - **For INSERT operations:**
     - Policy name: "Users can upload their own photos"
     - Policy definition: `auth.uid() = owner`
   - **For UPDATE operations:**
     - Policy name: "Users can update their own photos"
     - Policy definition: `auth.uid() = owner`
   - **For DELETE operations:**
     - Policy name: "Users can delete their own photos"
     - Policy definition: `auth.uid() = owner`

### Step 4: Get Your API Keys

1. Go to "Project Settings" (gear icon) → "API"
2. Copy the "Project URL" and "anon public" key
3. Create a `.env.local` file in the root of your project with these values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Database Schema

The setup script creates the following tables:

- `profiles`: User profile information
- `projects`: Projects that contain issues
- `issues`: Individual issues/snags documented by users
- `issue_photos`: Photos attached to issues
- `issue_comments`: Comments on issues

Each table has appropriate Row Level Security (RLS) policies to ensure users can only access their own data.

## Troubleshooting

If you encounter any errors when running the script:

1. Make sure you're running it in a new Supabase project
2. Check for any error messages in the SQL Editor output
3. Try running sections of the script separately if a specific part is failing
4. Ensure you have the necessary permissions in your Supabase project
