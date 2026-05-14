export interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  email: string;
  phone: string;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  plate: string;
  make: string;
  model: string;
  color: string;
}

export interface AccessLog {
  id: string;
  vehiclePlate: string;
  type: 'entry' | 'exit';
  timestamp: Date;
  ownerName: string;
}

// Initial Mock Data
export const initialEmployees: Employee[] = [
  { id: '1', name: 'Dr. Roberto Silva', department: 'Engenharia', role: 'Professor', email: 'roberto.silva@uni.edu', phone: '(11) 98888-7777' },
  { id: '2', name: 'Ana Souza', department: 'Administração', role: 'Secretária', email: 'ana.souza@uni.edu', phone: '(11) 97777-6666' },
  { id: '3', name: 'Carlos Santos', department: 'TI', role: 'Analista', email: 'carlos.santos@uni.edu', phone: '(11) 96666-5555' },
];

export const initialVehicles: Vehicle[] = [
  { id: 'v1', ownerId: '1', plate: 'ABC-1234', make: 'Toyota', model: 'Corolla', color: 'Prata' },
  { id: 'v2', ownerId: '2', plate: 'XYZ-5678', make: 'Honda', model: 'Civic', color: 'Preto' },
  { id: 'v3', ownerId: '3', plate: 'KJH-9900', make: 'Volkswagen', model: 'Golf', color: 'Branco' },
];

export const initialLogs: AccessLog[] = [
  { id: 'l1', vehiclePlate: 'ABC-1234', type: 'entry', timestamp: new Date(Date.now() - 3600000), ownerName: 'Dr. Roberto Silva' },
  { id: 'l2', vehiclePlate: 'XYZ-5678', type: 'entry', timestamp: new Date(Date.now() - 1800000), ownerName: 'Ana Souza' },
];
