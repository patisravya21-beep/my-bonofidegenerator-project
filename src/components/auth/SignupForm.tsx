import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockColleges } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { FileInput } from '../ui/FileInput';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [role, setRole] = useState<'admin' | 'student'>('student');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Student fields
    rollNo: '',
    department: '',
    course: '',
    collegeId: '',
    // Admin fields
    collegeName: '',
    collegeAddress: '',
    collegeLogo: '',
  });
  const [collegeLogoFile, setCollegeLogoFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate file size for college logo (max 10MB)
    if (collegeLogoFile && collegeLogoFile.size > 10 * 1024 * 1024) {
      setError('College logo file size must be less than 10MB');
      return;
    }

    setLoading(true);

    try {
      // Convert file to a URL for demo purposes
      let logoUrl = formData.collegeLogo;
      if (collegeLogoFile) {
        logoUrl = URL.createObjectURL(collegeLogoFile);
      }

      const success = await signup({
        ...formData,
        role,
        collegeLogo: logoUrl,
        collegeLogoFile, // Include file for potential backend upload
      });
      if (!success) {
        setError('Signup failed. Email might already be in use. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const collegeOptions = mockColleges.map(college => ({
    value: college.id,
    label: college.name,
  }));

  const departmentOptions = [
    { value: 'computer-science', label: 'Computer Science' },
    { value: 'electronics', label: 'Electronics Engineering' },
    { value: 'mechanical', label: 'Mechanical Engineering' },
    { value: 'civil', label: 'Civil Engineering' },
    { value: 'information-technology', label: 'Information Technology' },
  ];

  const courseOptions = [
    { value: 'btech', label: 'B.Tech' },
    { value: 'mtech', label: 'M.Tech' },
    { value: 'bsc', label: 'B.Sc' },
    { value: 'msc', label: 'M.Sc' },
    { value: 'bca', label: 'BCA' },
    { value: 'mca', label: 'MCA' },
  ];

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Sign Up</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">I am a:</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="student"
                checked={role === 'student'}
                onChange={(e) => setRole(e.target.value as 'student')}
                className="mr-2"
              />
              Student
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="admin"
                checked={role === 'admin'}
                onChange={(e) => setRole(e.target.value as 'admin')}
                className="mr-2"
              />
              College Admin
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder="Enter your full name"
            required
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email"
            required
          />

          {role === 'student' && (
            <>
              <Input
                label="Roll Number"
                value={formData.rollNo}
                onChange={(e) => handleInputChange('rollNo', e.target.value)}
                placeholder="Enter your roll number"
                required
              />
              
              <Select
                label="Department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                options={departmentOptions}
                placeholder="Select your department"
                required
              />
              
              <Select
                label="Course"
                value={formData.course}
                onChange={(e) => handleInputChange('course', e.target.value)}
                options={courseOptions}
                placeholder="Select your course"
                required
              />
              
              <Select
                label="College"
                value={formData.collegeId}
                onChange={(e) => handleInputChange('collegeId', e.target.value)}
                options={collegeOptions}
                placeholder="Select your college"
                required
              />
            </>
          )}

          {role === 'admin' && (
            <>
              <Input
                label="College Name"
                value={formData.collegeName}
                onChange={(e) => handleInputChange('collegeName', e.target.value)}
                placeholder="Enter college name"
                required
              />
              
              <Input
                label="College Address"
                value={formData.collegeAddress}
                onChange={(e) => handleInputChange('collegeAddress', e.target.value)}
                placeholder="e.g., 123 University Ave, Knowledge City, 12345"
                required
              />

              <FileInput
                label="College Logo"
                value={collegeLogoFile}
                onChange={setCollegeLogoFile}
                accept="image/*"
                preview={true}
              />
              
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <strong>Tip:</strong> Upload your college logo for official certificates. Recommended size: 200x200px, formats: PNG, JPG, max 10MB.
              </div>
            </>
          )}
          
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Create a strong password (min 6 characters)"
            required
          />
          
          <Input
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="Confirm your password"
            required
          />

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600 text-sm"
            >
              {error}
            </motion.p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>

        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-800 text-center">
            <strong>✓ Ready to go!</strong> After signup, you can login with the same credentials you just created.
          </p>
        </div>
      </motion.div>
    </Card>
  );
};
