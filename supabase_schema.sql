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
    updated_at TIMESTAMPTZ DEFAULT NOW()
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
    created_at TIMESTAMPTZ DEFAULT NOW()
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Basic Seed Data
INSERT INTO vehicles (name, tagline, model, odometer, registry, region, image_url)
VALUES (
    'YAMAHA MT-07', 
    'HYPER NAKED STREET FIGHTER', 
    'MOD. 2023', 
    12450, 
    'MT-07-2023', 
    'California, US',
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800'
);

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
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
