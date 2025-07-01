# Monetization Feature - OnlyPips Journal

This document explains how to set up and use the monetization feature that allows users to support the platform through affiliate broker links.

## 🚀 Overview

The monetization feature consists of:
1. **Support Modal** - Shows every 3 days to encourage user support
2. **Support Button** - Persistent button in the navigation for easy access
3. **Affiliate Management** - Database-driven affiliate information

## 📋 Setup Instructions

### 1. Database Setup

Run the SQL migrations in `database_migrations.sql` in your Supabase SQL editor:

```sql
-- Add has_supported field to users table
ALTER TABLE users 
ADD COLUMN has_supported BOOLEAN DEFAULT FALSE;

-- Create affiliate_info table
CREATE TABLE IF NOT EXISTS affiliate_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    broker_name TEXT NOT NULL,
    link TEXT NOT NULL,
    logo_url TEXT,
    message_body TEXT NOT NULL,
    button_label TEXT NOT NULL DEFAULT 'Support via Broker',
    active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Configure Affiliate Information

Insert your affiliate information into the `affiliate_info` table:

```sql
INSERT INTO affiliate_info (
    broker_name,
    link,
    logo_url,
    message_body,
    button_label,
    active
) VALUES (
    'Your Broker Name',
    'https://your-affiliate-link.com',
    'https://your-logo-url.com/logo.png',
    'Support OnlyPips Journal by opening an account with our trusted broker partner. Your support helps us keep this platform free and continuously improve our features.',
    'Open Account & Support Us',
    true
);
```

**Important**: Only one record should have `active = true` at a time.

### 3. Row Level Security (RLS) Policies

The SQL file includes RLS policies to ensure:
- Only authenticated users can read active affiliate info
- Users can only update their own `has_supported` field
- Only service role can manage affiliate info

## 🎯 How It Works

### Support Modal Behavior

1. **Frequency**: Shows every 3 days on login/page load
2. **Conditions**: Only shows if:
   - User is authenticated
   - No active affiliate info exists
   - User hasn't clicked "Don't show again"
   - User hasn't supported before
   - 3 days have passed since last shown

3. **Actions**:
   - **Close**: Hides modal for 3 days
   - **Don't show again**: Permanently disables modal
   - **Support via Broker**: Opens affiliate link + updates user status

### Support Button

- **Location**: Top-right corner (desktop) and mobile menu
- **Behavior**: Always available if affiliate info is active
- **Action**: Opens affiliate link and updates user support status

### localStorage Keys

The feature uses these localStorage keys:
- `has_supported`: Set when user clicks affiliate link
- `dont_show_support_modal`: Set when user clicks "Don't show again"
- `support_modal_last_shown`: Timestamp of last modal display

## 🛠️ Components

### SupportModal
- Displays affiliate information in a modal dialog
- Handles user interactions and database updates
- Responsive design for mobile and desktop

### SupportButton
- Persistent button for quick access to affiliate link
- Appears in navigation bar
- Handles loading states and user feedback

### SupportManager
- Manages modal display logic
- Checks localStorage and database conditions
- Only renders when affiliate info is active

## 📊 Database Schema

### affiliate_info Table
```sql
- id: UUID (Primary Key)
- broker_name: TEXT (Broker name)
- link: TEXT (Affiliate URL)
- logo_url: TEXT (Broker logo URL)
- message_body: TEXT (Support message)
- button_label: TEXT (Button text)
- active: BOOLEAN (Only one should be true)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### users Table (Updated)
```sql
- has_supported: BOOLEAN (New field)
```

## 🎨 Customization

### Styling
The components use Tailwind CSS classes and can be customized:
- Modal appearance in `SupportModal.tsx`
- Button styling in `SupportButton.tsx`
- Colors, spacing, and animations

### Content
- **Message**: Update `message_body` in database
- **Button Text**: Update `button_label` in database
- **Logo**: Update `logo_url` in database

### Timing
- **Modal Frequency**: Change `threeDaysInMs` in `SupportManager.tsx`
- **Display Logic**: Modify conditions in `checkSupportModalConditions()`

## 🔧 Management

### Switching Affiliate Partners

1. Deactivate current affiliate:
```sql
UPDATE affiliate_info SET active = false WHERE active = true;
```

2. Activate new affiliate:
```sql
UPDATE affiliate_info SET active = true WHERE id = 'new-affiliate-id';
```

### Analytics

Track support metrics:
```sql
-- Count users who have supported
SELECT COUNT(*) FROM users WHERE has_supported = true;

-- Support rate
SELECT 
    COUNT(*) FILTER (WHERE has_supported = true) as supported_users,
    COUNT(*) as total_users,
    ROUND(
        COUNT(*) FILTER (WHERE has_supported = true) * 100.0 / COUNT(*), 
        2
    ) as support_rate
FROM users;
```

## 🚨 Troubleshooting

### Modal Not Showing
1. Check if affiliate info exists and is active
2. Verify user authentication
3. Check localStorage for dismissal flags
4. Ensure RLS policies are correct

### Database Errors
1. Verify `has_supported` field exists in users table
2. Check RLS policies for users table
3. Ensure affiliate_info table exists

### UI Issues
1. Check browser console for errors
2. Verify component imports
3. Ensure Tailwind CSS is loaded

## 📝 Notes

- The feature is designed to be non-intrusive
- Users can always access support via the persistent button
- Modal frequency can be adjusted based on user feedback
- All affiliate information is stored in the database for easy management
- The system respects user preferences and doesn't spam users

## 🔮 Future Enhancements

Potential improvements:
- A/B testing for different messages
- Multiple affiliate partners with rotation
- Support for different user segments
- Integration with analytics platforms
- Admin dashboard for affiliate management 