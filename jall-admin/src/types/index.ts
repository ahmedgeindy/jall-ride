export type BookingStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface Driver {
  id:         number;
  name:       string;
  phone:      string | null;
  available:  boolean;
  created_at: string;
}

export interface Car {
  id:        number;
  make:      string;
  model:     string;
  plate:     string;
  seats:     number;
  available: boolean;
  color:     string | null;
}

export interface Booking {
  id:              number;
  user_id:         number;
  car_id:          number;
  pickup_location: string;
  destination:     string;
  ride_date:       string;
  created_at:      string;
  status:          BookingStatus;
  price:           number;
  driver_id:       number | null;
  client_name?:    string;
  driver_name?:    string;
  make?:           string;
  model?:          string;
  plate?:          string;
}

export interface DashboardStats {
  totalBookings:   number;
  activeRides:     number;
  revenueToday:    number;
  availableCars:   number;
  bookingsPerDay:  { date: string; count: number }[];
  recentBookings:  Booking[];
}
