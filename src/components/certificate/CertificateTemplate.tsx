import React from 'react';
import { BonafideRequest, College } from '../../types';

interface CertificateTemplateProps {
  request: BonafideRequest;
  college: College;
}

export const CertificateTemplate: React.FC<CertificateTemplateProps> = ({ request, college }) => {
  const issueDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Helper to format text from value
  const formatLabel = (value: string | undefined) => {
    if (!value) return 'N/A';
    return value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div
      className="bg-white text-black p-4 font-serif"
      style={{ width: '210mm', height: '297mm', boxSizing: 'border-box' }}
    >
      <div
        className="w-full h-full p-8 flex flex-col"
        style={{
          border: '1px solid black',
          outline: '4px double black',
          outlineOffset: '-8px',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <header className="pb-4" style={{ borderBottom: '3px double black' }}>
          <div className="flex items-center justify-center text-center space-x-4">
            {college.logo && (
              <img src={college.logo} alt={`${college.name} Logo`} className="h-20 w-20 object-contain" />
            )}
            <div className="flex-grow">
              <h1 className="text-3xl font-bold">{college.name}</h1>
              <p className="text-sm mt-1">{college.address}</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow pt-8 text-center">
          <h2 className="text-2xl font-bold underline uppercase tracking-widest mb-10">
            Bonafide Certificate
          </h2>

          <div className="text-lg leading-relaxed space-y-8 text-left px-4">
            <p>
              This is to certify that Mr./Ms. <span className="font-bold">{request.student?.user?.fullName || 'N/A'}</span>,
              Roll No: <span className="font-bold">{request.student?.rollNo || 'N/A'}</span>, Department of <span className="font-bold">{formatLabel(request.student?.department)}</span>,
              has been a bonafide student of this institution, enrolled in the <span className="font-bold">{formatLabel(request.student?.course)}</span> program
              during the academic year <span className="font-bold">{request.academicYear}</span>,
              Year <span className="font-bold">{request.year}</span>.
            </p>
            <p>
              This certificate is issued for the purpose of <span className="font-bold">{formatLabel(request.purpose)}</span>.
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="pt-12 mt-auto">
          <div className="flex justify-between items-end">
            <div>
              <p className="font-semibold">Date: {issueDate}</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">Principal/Registrar</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
