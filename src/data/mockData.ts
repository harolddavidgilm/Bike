export const mockVehicles = [
  {
    id: 1,
    name: "YAMAHA MT-07",
    tagline: "HYPER NAKED STREET FIGHTER",
    model: "MOD. 2023",
    odometer: 12450,
    engine: "689cc Liquid-cooled",
    engineDetails: "DOHC 4-valve per cylinder",
    vin: "JYARM1234567890",
    registry: "MT-07-2023",
    region: "California, US",
    lastSynced: "14h ago",
    status: "ACTIVE",
    health: "OPTIMAL",
    investmentCost: 1245.50,
    annualOverhead: 412.00,
    avgConsumption: 4.2,
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    name: "DUCATI PANIGALE V4",
    tagline: "RACING REVOLUTION",
    model: "MOD. 2024",
    odometer: 3200,
    engine: "1103cc Desmosedici Stradale",
    engineDetails: "V4, 4-valve per cylinder",
    vin: "ZDAD0123456789",
    registry: "D-V4-2024",
    region: "Bologna, IT",
    lastSynced: "2h ago",
    status: "ACTIVE",
    health: "OPTIMAL",
    investmentCost: 5200.00,
    annualOverhead: 850.00,
    avgConsumption: 5.8,
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    name: "BMW R1250 GS",
    tagline: "ADVENTURE UNLIMITED",
    model: "MOD. 2022",
    odometer: 45600,
    engine: "1254cc Boxer",
    engineDetails: "ShiftCam, 2-cylinder",
    vin: "WB10J1234567890",
    registry: "BMW-GS-2022",
    region: "Munich, DE",
    lastSynced: "1d ago",
    status: "STANDBY",
    health: "MAINTENANCE_DUE",
    investmentCost: 3100.00,
    annualOverhead: 620.00,
    avgConsumption: 4.8,
    image: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800"
  }
];

export const mockVehicle = mockVehicles[0];

export const mockLogs = [
  { id: 1, date: "OCT 12, 2023", metric: "OIL & FILTER DEPLOYMENT", odometer: "12,450 KM", investment: "$145.00", icon: "square" },
  { id: 2, date: "AUG 28, 2023", metric: "CHAIN TENSION CALIBRATION", odometer: "11,200 KM", investment: "$45.00", icon: "square" },
  { id: 3, date: "JUN 15, 2023", metric: "ANNUAL SYSTEM AUDIT", odometer: "9,800 KM", investment: "$320.00", icon: "square" },
  { id: 4, date: "APR 04, 2023", metric: "HYDRAULIC FLUID FLUSH", odometer: "8,150 KM", investment: "$85.00", icon: "square" },
];

export const mockScheduled = [
  { id: 1, type: "TIRE REPLACEMENT", desc: "MICHELIN ROAD 6 PERFORMANCE", eta: "1,200 km", severity: "NORMAL", usageStatus: "80%", logged: "8,800", max: "10,000" },
  { id: 2, type: "BRAKE PAD SYNC", desc: "FRONT BREMBO SINTERED", eta: "450 km", severity: "CRITICAL", wearCoefficient: "92%", threshold: "95%" }
];
