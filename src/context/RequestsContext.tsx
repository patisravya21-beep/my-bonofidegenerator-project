import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BonafideRequest } from '../types';
import { faker } from '@faker-js/faker';

interface RequestsContextType {
  requests: BonafideRequest[];
  submitRequest: (request: Omit<BonafideRequest, 'id' | 'requestDate' | 'status'>) => void;
  updateRequestStatus: (requestId: string, status: 'approved' | 'rejected', processedBy: string) => void;
  getRequestsByStudent: (studentId: string) => BonafideRequest[];
  getAllRequests: () => BonafideRequest[];
}

const RequestsContext = createContext<RequestsContextType | undefined>(undefined);

export const RequestsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<BonafideRequest[]>([]);

  const submitRequest = (requestData: Omit<BonafideRequest, 'id' | 'requestDate' | 'status'>) => {
    const newRequest: BonafideRequest = {
      ...requestData,
      id: faker.string.uuid(),
      requestDate: new Date().toISOString(),
      status: 'pending',
    };
    setRequests(prev => [newRequest, ...prev]);
  };

  const updateRequestStatus = (requestId: string, status: 'approved' | 'rejected', processedBy: string) => {
    setRequests(prev =>
      prev.map(request =>
        request.id === requestId
          ? {
              ...request,
              status,
              processedDate: new Date().toISOString(),
              processedBy,
              certificatePath: status === 'approved' ? `certificates/${requestId}.pdf` : undefined,
            }
          : request
      )
    );
  };

  const getRequestsByStudent = (studentId: string): BonafideRequest[] => {
    return requests.filter(request => request.studentId === studentId);
  };

  const getAllRequests = (): BonafideRequest[] => {
    return requests;
  };

  return (
    <RequestsContext.Provider
      value={{
        requests,
        submitRequest,
        updateRequestStatus,
        getRequestsByStudent,
        getAllRequests,
      }}
    >
      {children}
    </RequestsContext.Provider>
  );
};

export const useRequests = () => {
  const context = useContext(RequestsContext);
  if (context === undefined) {
    throw new Error('useRequests must be used within a RequestsProvider');
  }
  return context;
};
