export interface Driver {
  id: string;
  name: string;
  autoStand: string;
  licenseNumber: string;
  vehicleNumber: string;
  isAvailable: boolean;
  rating: number;
  totalRides: number;
}

export interface Ride {
  id: string;
  passengerId: string;
  driverId: string;
  pickup: string;
  destination: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  fare: number;
  timestamp: Date;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}