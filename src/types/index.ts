export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'student';
  createdAt: string;
}

export interface College {
  id: string;
  name: string;
  logo?: string;
  address: string;
  adminId: string;
  createdAt: string;
}

export interface Student {
  id: string;
  userId: string;
  rollNo: string;
  department: string;
  course: string;
  collegeId: string;
  user?: User;
  college?: College;
}

export interface Admin {
  id: string;
  userId: string;
  collegeId: string;
  user?: User;
  college?: College;
}

export interface BonafideRequest {
  id: string;
  studentId: string;
  purpose: string;
  academicYear: string;
  year: string;
  contactInfo: string;
  status: 'pending' | 'approved' | 'rejected';
  certificatePath?: string;
  requestDate: string;
  processedDate?: string;
  processedBy?: string;
  student?: Student;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}
