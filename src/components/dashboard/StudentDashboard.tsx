import React, { useState } from 'react';
import { useRequests } from '../../context/RequestsContext';
import { useAuth, mockColleges } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Plus, Download, FileText, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';
import { CertificateTemplate } from '../certificate/CertificateTemplate';
import { BonafideRequest } from '../../types';

export const StudentDashboard: React.FC = () => {
  const { getRequestsByStudent, submitRequest } = useRequests();
  const { user, getCurrentUserProfile } = useAuth();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    purpose: '',
    academicYear: '',
    year: '',
    contactInfo: '',
  });

  const profile = getCurrentUserProfile();
  const studentId = profile?.id || '';
  const myRequests = getRequestsByStudent(studentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRequest({
      ...formData,
      studentId,
      student: profile as any,
    });
    setFormData({
      purpose: '',
      academicYear: '',
      year: '',
      contactInfo: '',
    });
    setShowRequestForm(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const downloadCertificate = (request: BonafideRequest) => {
    setIsGenerating(request.id);
    const college = mockColleges.find(c => c.id === (profile as any)?.collegeId);

    if (!college) {
      alert("Could not find college information for this certificate.");
      setIsGenerating(null);
      return;
    }

    const certificateContainer = document.createElement('div');
    certificateContainer.style.position = 'absolute';
    certificateContainer.style.left = '-9999px';
    document.body.appendChild(certificateContainer);

    const root = createRoot(certificateContainer);
    root.render(<CertificateTemplate request={request} college={college} />);

    setTimeout(() => {
      const certificateElement = certificateContainer.children[0] as HTMLElement;
      if (certificateElement) {
        html2canvas(certificateElement, { scale: 2, useCORS: true }).then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
          });
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save(`bonafide-certificate-${request.id}.pdf`);
          
          root.unmount();
          document.body.removeChild(certificateContainer);
          setIsGenerating(null);
        });
      } else {
        root.unmount();
        document.body.removeChild(certificateContainer);
        setIsGenerating(null);
      }
    }, 500);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const stats = {
    total: myRequests.length,
    pending: myRequests.filter(r => r.status === 'pending').length,
    approved: myRequests.filter(r => r.status === 'approved').length,
  };

  const purposeOptions = [
    { value: 'bank-loan', label: 'Bank Loan Application' },
    { value: 'passport', label: 'Passport Verification' },
    { value: 'scholarship', label: 'Scholarship Application' },
    { value: 'visa', label: 'Visa Processing' },
    { value: 'employment', label: 'Employment Verification' },
    { value: 'higher-education', label: 'Higher Education Application' },
    { value: 'other', label: 'Other' },
  ];

  const yearOptions = [
    { value: '1st', label: '1st Year' },
    { value: '2nd', label: '2nd Year' },
    { value: '3rd', label: '3rd Year' },
    { value: '4th', label: '4th Year' },
    { value: '5th', label: '5th Year' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user?.fullName}</h2>
        <p className="text-gray-600">Manage your bonafide certificate requests.</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* New Request Button */}
      <div className="mb-6">
        <Button
          onClick={() => setShowRequestForm(!showRequestForm)}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Request Form */}
      {showRequestForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">New Bonafide Request</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Purpose"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  options={purposeOptions}
                  placeholder="Select purpose"
                  required
                />
                
                <Input
                  label="Academic Year"
                  value={formData.academicYear}
                  onChange={(e) => handleInputChange('academicYear', e.target.value)}
                  placeholder="e.g., 2024-2025"
                  required
                />
                
                <Select
                  label="Year"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  options={yearOptions}
                  placeholder="Select current year"
                  required
                />
                
                <Input
                  label="Contact Information"
                  value={formData.contactInfo}
                  onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                  placeholder="Phone number or email"
                  required
                />
              </div>
              
              <div className="flex space-x-4">
                <Button type="submit">Submit Request</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRequestForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* My Requests */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-medium text-gray-900">My Requests</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Academic Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {myRequests.map((request) => (
                <motion.tr
                  key={request.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{request.purpose}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {request.academicYear} | Year: {request.year}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={request.status}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(request.requestDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {request.status === 'approved' && (
                      <Button
                        onClick={() => downloadCertificate(request)}
                        variant="primary"
                        size="sm"
                        disabled={isGenerating === request.id}
                      >
                        {isGenerating === request.id ? (
                          'Generating...'
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </>
                        )}
                      </Button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {myRequests.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No requests yet. Create your first request!</p>
          </div>
        )}
      </Card>
    </div>
  );
};
