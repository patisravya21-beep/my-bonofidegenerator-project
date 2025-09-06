import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, College, Student, Admin } from '../types';
import { faker } from '@faker-js/faker';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  logout: () => void;
  getCurrentUserProfile: () => Student | Admin | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Seed data for initial setup
const seedAdminUser: User & { password: string } = {
  id: 'admin-user-1',
  fullName: 'Dr. Evelyn Reed',
  email: 'admin@greenwood.edu',
  role: 'admin',
  createdAt: new Date().toISOString(),
  password: 'password123',
};

const seedCollege: College = {
  id: 'college-1',
  name: 'Greenwood University',
  logo: 'https://img-wrapper.vercel.app/image?url=https://placehold.co/200x200/3498db/ffffff?text=GU',
  address: '123 University Avenue, Knowledge City, 12345',
  adminId: 'admin-user-1',
  createdAt: new Date().toISOString(),
};

const seedAdmin: Admin = {
  id: 'admin-1',
  userId: 'admin-user-1',
  collegeId: 'college-1',
  user: {
    id: 'admin-user-1',
    fullName: 'Dr. Evelyn Reed',
    email: 'admin@greenwood.edu',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  college: seedCollege,
};


// Mock data storage, initialized with seed data
const mockUsers: (User & { password: string })[] = [seedAdminUser];
const mockColleges: College[] = [seedCollege];
const mockStudents: Student[] = [];
const mockAdmins: Admin[] = [seedAdmin];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userWithPassword = mockUsers.find(u => u.email === email);
      if (userWithPassword && userWithPassword.password === password) {
        const { password: _, ...user } = userWithPassword;
        setAuthState({
          user,
          isAuthenticated: true,
          loading: false,
        });
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (userData: any): Promise<boolean> => {
    try {
      const userId = faker.string.uuid();
      
      if (mockUsers.find(u => u.email === userData.email)) {
        throw new Error('Email already exists');
      }

      const userWithPassword = {
        id: userId,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
        createdAt: new Date().toISOString(),
        password: userData.password,
      };

      mockUsers.push(userWithPassword);

      const { password: _, ...user } = userWithPassword;

      if (userData.role === 'admin') {
        const collegeId = faker.string.uuid();
        const college: College = {
          id: collegeId,
          name: userData.collegeName,
          logo: userData.collegeLogo,
          address: userData.collegeAddress,
          adminId: userId,
          createdAt: new Date().toISOString(),
        };
        mockColleges.push(college);

        const admin: Admin = {
          id: faker.string.uuid(),
          userId,
          collegeId,
          user,
          college,
        };
        mockAdmins.push(admin);
      } else {
        const student: Student = {
          id: faker.string.uuid(),
          userId,
          rollNo: userData.rollNo,
          department: userData.department,
          course: userData.course,
          collegeId: userData.collegeId,
          user,
          college: mockColleges.find(c => c.id === userData.collegeId)
        };
        mockStudents.push(student);
      }

      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
    localStorage.removeItem('currentUser');
  };

  const getCurrentUserProfile = (): Student | Admin | null => {
    if (!authState.user) return null;
    
    if (authState.user.role === 'admin') {
      const adminProfile = mockAdmins.find(admin => admin.userId === authState.user!.id);
      if (adminProfile && !adminProfile.college) {
        adminProfile.college = mockColleges.find(c => c.id === adminProfile.collegeId);
      }
      return adminProfile || null;
    } else {
      const studentProfile = mockStudents.find(student => student.userId === authState.user!.id);
      if (studentProfile && !studentProfile.college) {
        studentProfile.college = mockColleges.find(c => c.id === studentProfile.collegeId);
      }
      return studentProfile || null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        logout,
        getCurrentUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { mockColleges, mockStudents, mockAdmins };
export const mockUsersPublic = mockUsers.map(({ password, ...user }) => user);
