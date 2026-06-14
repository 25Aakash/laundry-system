'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// --- Type Definitions ---
export interface Customer {
  id: string;
  name: string;
  mobile: string;
  alternateMobile?: string;
  address?: string;
  email?: string;
  notes?: string;
  createdDate: string;
  activeStatus: boolean;
}

export interface Garment {
  id: string; // LM-000001
  qrCode: string; // Same as id
  customerId: string;
  categoryId: string;
  brand: string;
  color: string;
  size: string;
  fabric: string;
  remarks?: string;
  photo?: string; // base64 or placeholder
  createdDate: string;
  activeStatus: boolean;
}

export interface MasterItem {
  id: string;
  name: string;
  description?: string;
  activeStatus: boolean;
}

export interface JobItem {
  id: string;
  garmentId: string;
  serviceId: string;
  defectIds: string[];
  remarks?: string;
  quantity: number;
}

export interface Job {
  id: string; // e.g. Job #1001
  jobNumber: string;
  customerId: string;
  status: 'Received' | 'In Process' | 'Ready' | 'Delivered';
  remarks?: string;
  createdDate: string;
  items: JobItem[];
  photos: { url: string; type: 'front' | 'back' | 'defect' }[];
}

interface MockStoreContextType {
  customers: Customer[];
  garments: Garment[];
  categories: MasterItem[];
  services: MasterItem[];
  defects: MasterItem[];
  jobs: Job[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdDate' | 'activeStatus'>) => Customer;
  addGarment: (garment: Omit<Garment, 'id' | 'qrCode' | 'createdDate' | 'activeStatus'>) => Garment;
  addJob: (customerId: string, items: Omit<JobItem, 'id'>[], remarks?: string, photos?: { url: string; type: 'front' | 'back' | 'defect' }[]) => Job;
  updateJobStatus: (jobId: string, status: Job['status']) => void;
  addCategory: (name: string) => void;
  editCategory: (id: string, name: string, active: boolean) => void;
  addService: (name: string, description?: string) => void;
  editService: (id: string, name: string, description: string, active: boolean) => void;
  addDefect: (name: string) => void;
  editDefect: (id: string, name: string, active: boolean) => void;
}

const MockStoreContext = createContext<MockStoreContextType | undefined>(undefined);

export function MockStoreProvider({ children }: { children: React.ReactNode }) {
  // --- Seed Data ---
  const [categories, setCategories] = useState<MasterItem[]>([
    { id: 'cat-1', name: 'Shirt', activeStatus: true },
    { id: 'cat-2', name: 'T-Shirt', activeStatus: true },
    { id: 'cat-3', name: 'Jeans', activeStatus: true },
    { id: 'cat-4', name: 'Trouser', activeStatus: true },
    { id: 'cat-5', name: 'Blazer', activeStatus: true },
    { id: 'cat-6', name: 'Saree', activeStatus: true },
    { id: 'cat-7', name: 'Jacket', activeStatus: true },
    { id: 'cat-8', name: 'Blanket', activeStatus: true },
  ]);

  const [services, setServices] = useState<MasterItem[]>([
    { id: 'srv-1', name: 'Dry Clean', description: 'Premium chemical dry cleaning', activeStatus: true },
    { id: 'srv-2', name: 'Wash & Fold', description: 'Standard machine wash and tumble fold', activeStatus: true },
    { id: 'srv-3', name: 'Steam Iron', description: 'Crisp hot-steam press', activeStatus: true },
    { id: 'srv-4', name: 'Stain Removal', description: 'Targeted spot treatment', activeStatus: true },
    { id: 'srv-5', name: 'Premium Wash', description: 'Gentle hand wash with fabric conditioning', activeStatus: true },
    { id: 'srv-6', name: 'Alteration', description: 'Hems, pockets, or zipper replacement', activeStatus: true },
  ]);

  const [defects, setDefects] = useState<MasterItem[]>([
    { id: 'def-1', name: 'Stain', activeStatus: true },
    { id: 'def-2', name: 'Tear', activeStatus: true },
    { id: 'def-3', name: 'Missing Button', activeStatus: true },
    { id: 'def-4', name: 'Zip Broken', activeStatus: true },
    { id: 'def-5', name: 'Collar Damage', activeStatus: true },
    { id: 'def-6', name: 'Color Fade', activeStatus: true },
  ]);

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 'cust-1',
      name: 'John Doe',
      mobile: '9876543210',
      alternateMobile: '9876543211',
      address: '123 Indigo Boulevard, Metro City',
      email: 'john.doe@example.com',
      notes: 'Prefers standard laundry soap, no scent.',
      createdDate: '2026-05-10T10:00:00Z',
      activeStatus: true,
    },
    {
      id: 'cust-2',
      name: 'Sarah Connor',
      mobile: '9988776655',
      address: '456 Cyberdyne Way, Tech Hub',
      email: 'sconnor@resistance.net',
      notes: 'Wants steam ironed garments hung on wooden hangers.',
      createdDate: '2026-06-01T14:30:00Z',
      activeStatus: true,
    }
  ]);

  const [garments, setGarments] = useState<Garment[]>([
    {
      id: 'LM-000001',
      qrCode: 'LM-000001',
      customerId: 'cust-1',
      categoryId: 'cat-1',
      brand: 'Zara',
      color: 'Navy Blue',
      size: 'M',
      fabric: 'Cotton Linen',
      remarks: 'Fraying threads on cuffs',
      photo: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
      createdDate: '2026-05-10T10:05:00Z',
      activeStatus: true,
    },
    {
      id: 'LM-000002',
      qrCode: 'LM-000002',
      customerId: 'cust-1',
      categoryId: 'cat-3',
      brand: 'Levi\'s 501',
      color: 'Light Wash',
      size: '32/32',
      fabric: 'Denim',
      remarks: 'Worn out knees',
      photo: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      createdDate: '2026-05-10T10:10:00Z',
      activeStatus: true,
    },
    {
      id: 'LM-000003',
      qrCode: 'LM-000003',
      customerId: 'cust-2',
      categoryId: 'cat-5',
      brand: 'Armani',
      color: 'Charcoal Black',
      size: 'L',
      fabric: 'Virgin Wool',
      remarks: 'Slight shine on elbows',
      photo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400',
      createdDate: '2026-06-01T14:35:00Z',
      activeStatus: true,
    }
  ]);

  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 'job-1001',
      jobNumber: '1001',
      customerId: 'cust-1',
      status: 'Ready',
      remarks: 'Clean carefully',
      createdDate: '2026-06-10T10:30:00Z',
      items: [
        {
          id: 'ji-1',
          garmentId: 'LM-000001',
          serviceId: 'srv-1', // Dry Clean
          defectIds: ['def-1'], // Stain
          quantity: 1
        },
        {
          id: 'ji-2',
          garmentId: 'LM-000002',
          serviceId: 'srv-2', // Wash
          defectIds: [],
          quantity: 1
        }
      ],
      photos: [
        { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', type: 'front' }
      ]
    },
    {
      id: 'job-1002',
      jobNumber: '1002',
      customerId: 'cust-2',
      status: 'In Process',
      remarks: 'Next-day rush job',
      createdDate: '2026-06-12T16:00:00Z',
      items: [
        {
          id: 'ji-3',
          garmentId: 'LM-000003',
          serviceId: 'srv-5', // Premium Wash
          defectIds: ['def-3'], // Missing Button
          quantity: 1
        }
      ],
      photos: [
        { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400', type: 'front' }
      ]
    }
  ]);

  // --- Actions ---

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdDate' | 'activeStatus'>): Customer => {
    const newCust: Customer = {
      ...customer,
      id: `cust-${Date.now()}`,
      createdDate: new Date().toISOString(),
      activeStatus: true
    };
    setCustomers(prev => [newCust, ...prev]);
    return newCust;
  };

  const addGarment = (garment: Omit<Garment, 'id' | 'qrCode' | 'createdDate' | 'activeStatus'>): Garment => {
    // Generate QR in format LM-00000X
    const num = garments.length + 1;
    const qrCode = `LM-${String(num).padStart(6, '0')}`;
    const newGarment: Garment = {
      ...garment,
      id: qrCode,
      qrCode,
      createdDate: new Date().toISOString(),
      activeStatus: true
    };
    setGarments(prev => [newGarment, ...prev]);
    return newGarment;
  };

  const addJob = (
    customerId: string, 
    items: Omit<JobItem, 'id'>[], 
    remarks?: string,
    photos?: { url: string; type: 'front' | 'back' | 'defect' }[]
  ): Job => {
    const num = jobs.length + 1001;
    const jobNumber = String(num);
    const newJob: Job = {
      id: `job-${num}`,
      jobNumber,
      customerId,
      status: 'Received',
      remarks,
      createdDate: new Date().toISOString(),
      items: items.map((item, idx) => ({ ...item, id: `ji-${Date.now()}-${idx}` })),
      photos: photos || []
    };
    setJobs(prev => [newJob, ...prev]);
    return newJob;
  };

  const updateJobStatus = (jobId: string, status: Job['status']) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status } : job
    ));
  };

  // --- Category CRUD ---
  const addCategory = (name: string) => {
    setCategories(prev => [...prev, { id: `cat-${Date.now()}`, name, activeStatus: true }]);
  };

  const editCategory = (id: string, name: string, active: boolean) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name, activeStatus: active } : c));
  };

  // --- Service CRUD ---
  const addService = (name: string, description?: string) => {
    setServices(prev => [...prev, { id: `srv-${Date.now()}`, name, description, activeStatus: true }]);
  };

  const editService = (id: string, name: string, description: string, active: boolean) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, name, description, activeStatus: active } : s));
  };

  // --- Defect CRUD ---
  const addDefect = (name: string) => {
    setDefects(prev => [...prev, { id: `def-${Date.now()}`, name, activeStatus: true }]);
  };

  const editDefect = (id: string, name: string, active: boolean) => {
    setDefects(prev => prev.map(d => d.id === id ? { ...d, name, activeStatus: active } : d));
  };

  return (
    <MockStoreContext.Provider value={{
      customers,
      garments,
      categories,
      services,
      defects,
      jobs,
      addCustomer,
      addGarment,
      addJob,
      updateJobStatus,
      addCategory,
      editCategory,
      addService,
      editService,
      addDefect,
      editDefect
    }}>
      {children}
    </MockStoreContext.Provider>
  );
}

export function useMockStore() {
  const context = useContext(MockStoreContext);
  if (context === undefined) {
    throw new Error('useMockStore must be used within a MockStoreProvider');
  }
  return context;
}
