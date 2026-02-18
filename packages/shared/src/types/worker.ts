export interface Worker {
  id: string;
  userId: string;
  employeeId: string;
  name: string;
  phone: string;
  supervisorId?: string;
  dateOfBirth?: Date;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalNotes?: string;
  photoUrl?: string;
  createdAt: Date;
}

export interface Supervisor {
  id: string;
  userId: string;
  name: string;
  phone: string;
  area?: string;
  createdAt: Date;
}
