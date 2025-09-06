import React, { useState } from 'react';
import { useRequests } from '../../context/RequestsContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckCircle, XCircle, Download, Users, Clock, FileCheck, Building, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';
import { CertificateTemplate } from '../certificate/CertificateTemplate';
import { BonafideRequest } from '../../types';
import { exportDataToCsv } from '../../utils/csvHelper';

export const AdminDashboard: React.FC = () => {
  const { getAllRequests, updateRequestStatus } = useRequests();
  const { user, getCurrentUserProfile } = useAuth();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const profile = getCurrentUserProfile();
  const allRequests = getAllRequests();
  
  const filteredRequests = allRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const stats = {
    total: allRequests.length,
    pending: allRequests.filter(r => r.status === 'pending').length,
    approved: allRequests.filter(r => r.status === 'approved').length,
    rejected: allRequests.filter(r => r.status === 'rejected').length,
  };

  const handleApprove = (requestId: string) => {
    updateRequestStatus(requestId, 'approved', user?.fullName || 'Admin');
  };

  const handleReject = (requestId: string) => {
    updateRequestStatus(requestId, 'rejected', user?.fullName || 'Admin');
  };

  const handleExportCsv = () => {
    const formattedData = allRequests.map(req => ({
      'Request ID': req.id,
      'Student Name': req.student?.user?.fullName || 'N/A',
      'Roll Number': req.student?.rollNo || 'N/A',
      'Department': req.student?.department || 'N/A',
      'Course': req.student?.course || 'N/A',
      'Purpose': req.purpose,
      'Academic Year': req.academicYear,
      'Student Year': req.year,
      'Status': req.status,
      'Request Date': new Date(req.requestDate).toLocaleString(),
      'Processed Date': req.processedDate ? new Date(req.processedDate).toLocaleString() : 'N/A',
      'Processed By': req.processedBy || 'N/A',
    }));
    exportDataToCsv(formattedData, `bonafide-requests-export-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const generatePDF = (request: BonafideRequest) => {
    setIsGenerating(request.id);
    const college = (profile as any)?.college;

    if (!college) {
      alert('College information not found!');
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
          pdf.save(`bonafide-certificate-${request.student?.user?.fullName?.replace(/ /g, '_') || 'student'}.pdf`);
          
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user?.fullName}</h2>
            <p className="text-gray-600">Manage bonafide certificate requests for your college.</p>
          </div>
          {(profile as any)?.college?.logo && (
            <div className="flex items-center space-x-3">
              <img
                src={(profile as any).college.logo}
                alt="College Logo"
                className="h-12 w-12 object-cover rounded-lg border"
              />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{(profile as any)?.college?.name}</p>
                <p className="text-xs text-gray-500">College Admin</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* College Info Card */}
      {(profile as any)?.college && (
        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{(profile as any).college.name}</h3>
                <p className="text-sm text-gray-600">Administrative Dashboard</p>
              </div>
            </div>
            <Button onClick={handleExportCsv} variant="secondary" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <Users className="h-6 w-6 text-blue-600" />
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
              <FileCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 mr-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <Button
              key={status}
              onClick={() => setFilter(status)}
              variant={filter === status ? 'primary' : 'outline'}
              size="sm"
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-medium text-gray-900">Bonafide Requests</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
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
              {filteredRequests.map((request) => (
                <motion.tr
                  key={request.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {request.student?.user?.fullName || 'Unknown Student'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Roll: {request.student?.rollNo || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{request.purpose}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {request.student?.course || 'N/A'} - {request.student?.department || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
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
                    <div className="flex space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => handleApprove(request.id)}
                            variant="success"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(request.id)}
                            variant="danger"
                            size="sm"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {request.status === 'approved' && (
                        <Button
                          onClick={() => generatePDF(request)}
                          variant="primary"
                          size="sm"
                          disabled={isGenerating === request.id}
                        >
                          {isGenerating === request.id ? (
                            'Generating...'
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-1" />
                              Download PDF
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No requests found for the selected filter.</p>
          </div>
        )}
      </Card>
    </div>
  );
};
