-- Database Schema for BIKE Ecosystem

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table for Vehicles (Padrón Vehicular)
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    tagline TEXT,
    model TEXT,
    odometer INTEGER DEFAULT 0,
    engine TEXT,
    engine_details TEXT,
    vin TEXT UNIQUE,
    registry TEXT UNIQUE,
    region TEXT,
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, STANDBY, MAINTENANCE
    health TEXT DEFAULT 'OPTIMAL', -- OPTIMAL, CAUTION, CRITICAL
    investment_cost NUMERIC(12, 2),
    annual_overhead NUMERIC(12, 2),
    avg_consumption NUMERIC(4, 2),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Table for Maintenance/Refill Logs (Historical)
CREATE TABLE vehicle_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- REFILL, ANALYSIS, DETAILING, REPAIR
    title TEXT NOT NULL,
    detail TEXT,
    value TEXT, -- e.g. "-$22.40", "VERIFIED"
    odometer_at_entry INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. Table for Scheduled Tasks (Future)
CREATE TABLE scheduled_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    description TEXT,
    eta TEXT,
    severity TEXT DEFAULT 'NORMAL', -- NORMAL, CRITICAL
    wear_coefficient INTEGER, -- 0 to 100
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Basic Seed Data
-- INSERT INTO vehicles (name, tagline, model, odometer, registry, region, image_url)
-- VALUES (
--     'YAMAHA MT-07', 
--     'HYPER NAKED STREET FIGHTER', 
--     'MOD. 2023', 
--     12450, 
--     'MT-07-2023', 
--     'California, US',
--     'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800'
-- );

-- 4. Table for Documents (Moto & Conductor)
CREATE TABLE vehicle_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    owner_name TEXT, -- Nombre del conductor si es documento personal
    category TEXT NOT NULL, -- SOAT, LICENCIA, TARJETA_PROPIEDAD, etc
    document_name TEXT NOT NULL,
    expiry_date DATE NOT NULL,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 5. Table for Trip Segregation Flow
CREATE TABLE trip_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    odometer_km INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 6. Table for Fuel Management
CREATE TABLE fuel_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    odometer_km INTEGER NOT NULL,
    gallons NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    station_name TEXT DEFAULT 'S/N',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 7. Row Level Security Policies
-- Enable RLS on all tables
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can manage their own vehicles" ON vehicles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own vehicle logs" ON vehicle_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own scheduled tasks" ON scheduled_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own vehicle documents" ON vehicle_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own trip logs" ON trip_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own fuel logs" ON fuel_logs FOR ALL USING (auth.uid() = user_id);

-- Migration script (if tables already exist)
-- Run these individually if you need to add user_id to existing tables:
/*
ALTER TABLE vehicles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE vehicle_logs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE scheduled_tasks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE vehicle_documents ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE trip_logs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE fuel_logs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
*/
