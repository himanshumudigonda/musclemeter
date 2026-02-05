-- ============================================
-- MUSCLEMETER DATABASE SCHEMA
-- Supabase PostgreSQL
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- ENUMS
-- ============================================

-- User roles
CREATE TYPE user_role AS ENUM ('athlete', 'owner');

-- Booking status
CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'rejected', 'expired');

-- ============================================
-- PROFILES TABLE
-- ============================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'athlete',
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- GYMS TABLE
-- ============================================

CREATE TABLE gyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    location_lat DECIMAL(10, 8) NOT NULL,
    location_lng DECIMAL(11, 8) NOT NULL,
    upi_id TEXT NOT NULL,
    current_crowd_count INTEGER DEFAULT 0 CHECK (current_crowd_count >= 0),
    max_capacity INTEGER NOT NULL CHECK (max_capacity > 0),
    photos TEXT[] DEFAULT '{}',
    amenities TEXT[] DEFAULT '{}',
    opening_hours JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure crowd count doesn't exceed capacity
    CONSTRAINT crowd_within_capacity CHECK (current_crowd_count <= max_capacity)
);

-- Create index for location-based queries
CREATE INDEX idx_gyms_location ON gyms(location_lat, location_lng);
CREATE INDEX idx_gyms_owner ON gyms(owner_id);
CREATE INDEX idx_gyms_active ON gyms(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;

-- Gyms policies
CREATE POLICY "Active gyms are viewable by everyone"
    ON gyms FOR SELECT
    USING (is_active = true OR auth.uid() = owner_id);

CREATE POLICY "Owners can insert their own gyms"
    ON gyms FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own gyms"
    ON gyms FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own gyms"
    ON gyms FOR DELETE
    USING (auth.uid() = owner_id);

-- ============================================
-- PLANS TABLE
-- ============================================

CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    features TEXT[] DEFAULT '{}',
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_plans_gym ON plans(gym_id);
CREATE INDEX idx_plans_active ON plans(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Plans policies
CREATE POLICY "Active plans are viewable by everyone"
    ON plans FOR SELECT
    USING (is_active = true OR EXISTS (
        SELECT 1 FROM gyms WHERE gyms.id = plans.gym_id AND gyms.owner_id = auth.uid()
    ));

CREATE POLICY "Gym owners can insert plans"
    ON plans FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM gyms WHERE gyms.id = gym_id AND gyms.owner_id = auth.uid()
    ));

CREATE POLICY "Gym owners can update their plans"
    ON plans FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM gyms WHERE gyms.id = gym_id AND gyms.owner_id = auth.uid()
    ));

CREATE POLICY "Gym owners can delete their plans"
    ON plans FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM gyms WHERE gyms.id = gym_id AND gyms.owner_id = auth.uid()
    ));

-- ============================================
-- BOOKINGS TABLE
-- ============================================

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    transaction_id_utr TEXT,
    status booking_status DEFAULT 'pending',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    qr_code TEXT, -- Generated QR code for access
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_gym ON bookings(gym_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created ON bookings(created_at DESC);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
    ON bookings FOR SELECT
    USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM gyms WHERE gyms.id = bookings.gym_id AND gyms.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending bookings"
    ON bookings FOR UPDATE
    USING (
        (auth.uid() = user_id AND status = 'pending')
        OR EXISTS (
            SELECT 1 FROM gyms WHERE gyms.id = bookings.gym_id AND gyms.owner_id = auth.uid()
        )
    );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gyms_updated_at
    BEFORE UPDATE ON gyms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at
    BEFORE UPDATE ON plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup (supports Google OAuth)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_value user_role;
    user_full_name TEXT;
BEGIN
    -- Safely get the role, default to 'athlete' if invalid or missing
    BEGIN
        user_role_value := (NEW.raw_user_meta_data->>'role')::user_role;
    EXCEPTION WHEN OTHERS THEN
        user_role_value := 'athlete';
    END;
    
    -- Get name from various sources (email signup vs Google OAuth)
    user_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',           -- Email signup
        NEW.raw_user_meta_data->>'name',                -- Google OAuth
        NEW.raw_user_meta_data->>'user_name',           -- Fallback
        split_part(COALESCE(NEW.email, ''), '@', 1),    -- Extract from email
        'User'                                           -- Final fallback
    );
    
    INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        user_full_name,
        COALESCE(user_role_value, 'athlete'),
        NEW.raw_user_meta_data->>'avatar_url'           -- Google provides avatar
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Function to expire old bookings
CREATE OR REPLACE FUNCTION expire_old_bookings()
RETURNS void AS $$
BEGIN
    UPDATE bookings
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'approved'
    AND end_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- REALTIME
-- ============================================

-- Enable realtime for bookings (for live notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- Enable realtime for gyms (for crowd meter updates)
ALTER PUBLICATION supabase_realtime ADD TABLE gyms;

-- ============================================
-- SAMPLE DATA (Removed - create data through the app)
-- ============================================

-- Note: Sample profiles cannot be inserted directly because they 
-- require corresponding entries in auth.users table.
-- 
-- To add test data:
-- 1. Sign up through the app as an owner
-- 2. Create a gym through /dashboard/setup
-- 3. Sign up as an athlete to test bookings

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create storage bucket for gym photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('gym-photos', 'gym-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for gym photos
CREATE POLICY "Gym photos are publicly viewable"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'gym-photos');

CREATE POLICY "Authenticated users can upload gym photos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'gym-photos' AND auth.role() = 'authenticated');

-- Storage policies for avatars
CREATE POLICY "Avatars are publicly viewable"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Full-text search on gym names and descriptions
CREATE INDEX idx_gyms_search ON gyms USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Composite index for common booking queries
CREATE INDEX idx_bookings_gym_status ON bookings(gym_id, status);
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);
