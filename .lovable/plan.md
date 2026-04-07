## Phase 1: Foundation (this message)

### 1. Fix Branding
- Update index.html meta tags, title, OG data — remove all Lovable branding

### 2. Database Schema
- **profiles** table (user_id, display_name, avatar_url, subscription_tier)
- **plants** table (master plant database — name, scientific_name, care data, toxicity)
- **user_plants** table (user's garden — plant_id, nickname, location, last_watered, health_score, photo_url)
- **plant_journal_entries** table (photos, notes, milestones per user_plant)
- **community_posts** table (forum posts)
- Storage bucket for plant photos
- All with proper RLS policies

### 3. Authentication
- Login, Register, Forgot Password pages
- Auth context with session management
- Protected routes + paywall gate component

### 4. Core App Pages
- **Dashboard** — overview with watering reminders, streak, weather widget
- **MyGarden** — CRUD plant shelf connected to Supabase
- **PlantDetail** — individual plant view with journal
- **CareCalendar** — weekly care task view
- **Community** — browse/create posts
- **Settings** — account management

### 5. AI Plant Identifier
- Enable Lovable AI gateway
- Edge function for plant identification from photo description
- Plant identifier page with camera/upload UI

### 6. Landing Page Improvements
- Testimonials section
- Before/After section
- CTA section
- Updated pricing ($7.99 one-time + bumps)

### 7. Navigation
- Separate landing nav vs app nav (sidebar for authenticated users)
- Mobile-responsive app layout
