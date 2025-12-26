export interface Barber {
  id: string;
  name: string;
  specialty?: string;
  photoUrl?: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  barber: Barber;
  service: Service;
}
