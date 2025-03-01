export interface Departure {
  timestamp_scheduled: string;
  timestamp_predicted: string;
  delay_seconds: number;
  minutes: number;
}

export interface Stop {
  id: string;
  sequence: number;
  platform_code: string | null;
}

export interface Route {
  type: string;
  short_name: string;
}

export interface Trip {
  id: string;
  headsign: string;
  is_canceled: boolean;
}

export interface Vehicle {
  id: string;
  is_wheelchair_accessible: boolean;
  is_air_conditioned: boolean | null;
  has_charger: boolean | null;
}

export interface DepartureEntry {
  departure: Departure;
  stop: Stop;
  route: Route;
  trip: Trip;
  vehicle: Vehicle;
}

export type ApiResponse = DepartureEntry[][];

export interface DeparturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  previousBuildingCode: string | null;
  currentBuildingCode: string | null;
}
