#!/bin/bash

# Deployment script for Zoom meeting Edge Function

echo "🚀 Deploying Zoom Meeting Edge Function to Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Login to Supabase (if not already logged in)
echo "🔐 Logging in to Supabase..."
supabase login

# Link to your project (you'll need to replace with your project reference)
echo "🔗 Linking to Supabase project..."
echo "Please run: supabase link --project-ref YOUR_PROJECT_REFERENCE"

# Deploy the Edge Function
echo "📦 Deploying Edge Function..."
supabase functions deploy create-zoom-meetings

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Set environment variables in Supabase Dashboard:"
echo "   - ZOOM_CLIENT_ID"
echo "   - ZOOM_CLIENT_SECRET"
echo "   - ZOOM_ACCOUNT_ID"
echo ""
echo "2. Run the SQL script to set up the database:"
echo "   - Execute setup-zoom-meetings.sql in your Supabase SQL Editor"
echo ""
echo "3. Update the SQL script with your actual project reference and service role key"
echo ""
echo "4. Test the function:"
echo "   curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-zoom-meetings' \\"
echo "     -H 'Authorization: Bearer YOUR_ANON_KEY' \\"
echo "     -H 'Content-Type: application/json'"
