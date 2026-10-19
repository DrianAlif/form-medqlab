import React, { createContext, useContext, useState, useEffect } from 'react';

const EmployeeContext = createContext(null);

export const DEFAULT_EMPLOYEES = [
  {
    id: "EMP001",
    nik: "APS-ADMIN-001",
    name: "Admin",
    role: "admin",
    roleLabel: "System Administrator",
    department: "Human Resources",
    position: "HR Administrator",
    phone: "0812-3456-7890",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP002",
    nik: "APS-2026002",
    name: "Alif Drian",
    role: "employee",
    roleLabel: "Staff Karyawan",
    department: "Teknologi Informasi",
    position: "TSO",
    phone: "085780135868",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP003",
    nik: "APS-DIR-001",
    name: "Tri Prasetyo",
    role: "director",
    roleLabel: "Direktur Utama",
    department: "Direksi",
    position: "Direktur",
    phone: "0813-9876-5432",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP004",
    nik: "APS-2026003",
    name: "Ikhsan Akbar",
    role: "manager",
    roleLabel: "HOD Operasional",
    department: "Operasional",
    position: "HOD Operasional",
    phone: "0812-4455-6677",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP005",
    nik: "APS-2026004",
    name: "Galih Wicaksono",
    role: "employee",
    roleLabel: "Lead Developer",
    department: "Developer",
    position: "Senior Software Engineer",
    phone: "0815-1122-3344",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP006",
    nik: "APS-2026005",
    name: "Prahmadyan",
    role: "employee",
    roleLabel: "Implementator",
    department: "Project & Implementation",
    position: "Lead Implementor",
    phone: "0817-5566-7788",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80"
  }
];

const STORAGE_KEY = 'applimetis_employee_directory_v1';
const CURRENT_USER_KEY = 'applimetis_active_user_v1';

export function EmployeeProvider({ children }) {
  const [employees, setEmployees] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_EMPLOYEES;
    } catch {
      return DEFAULT_EMPLOYEES;
    }
  });

  const [currentUserId, setCurrentUserId] = useState(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      return saved || 'EMP001'; // Default: Admin
    } catch {
      return 'EMP001';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    } catch (e) {
      console.warn('Could not persist employees to localStorage', e);
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_USER_KEY, currentUserId);
    } catch (e) {
      console.warn('Could not persist currentUserId to localStorage', e);
    }
  }, [currentUserId]);

  const currentUser = employees.find(e => e.id === currentUserId) || employees[0] || DEFAULT_EMPLOYEES[0];

  const addEmployee = (newEmp) => {
    const id = `EMP${Date.now()}`;
    const emp = { ...newEmp, id };
    setEmployees(prev => [...prev, emp]);
    return emp;
  };

  const updateEmployee = (id, updatedFields) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updatedFields } : e));
  };

  const deleteEmployee = (id) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const value = {
    employees,
    currentUser,
    currentUserId,
    setCurrentUserId,
    addEmployee,
    updateEmployee,
    deleteEmployee
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployeeDirectory() {
  const ctx = useContext(EmployeeContext);
  if (!ctx) {
    return {
      employees: DEFAULT_EMPLOYEES,
      currentUser: DEFAULT_EMPLOYEES[0],
      currentUserId: 'EMP001',
      setCurrentUserId: () => {},
      addEmployee: () => {},
      updateEmployee: () => {},
      deleteEmployee: () => {}
    };
  }
  return ctx;
}

// Alias for 100% plug-and-play compatibility with HRIS-style components
export const useHRIS = useEmployeeDirectory;
