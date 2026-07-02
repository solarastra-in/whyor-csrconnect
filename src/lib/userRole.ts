import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { User } from 'firebase/auth';

export interface SmtpSettings {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
}

export interface Company {
  id: string;
  name: string;
  adminEmails: string[];
  allowedDomains: string[];
  whyCSRImportant?: string;
  overview?: string;
  promoters?: string;
  contacts?: string;
  connectionPreference?: string;
  goals?: string;
  employeeStrength?: number;
  enableEmployeeSurveys?: boolean;
  smtpSettings?: SmtpSettings;
}

export interface UserRoleInfo {
  role: 'platform_admin' | 'company_admin' | 'employee' | 'none';
  company?: Company;
}

export async function getUserRoleInfo(user: User | null): Promise<UserRoleInfo> {
  if (!user || !user.email) {
    return { role: 'none' };
  }

  const email = user.email.toLowerCase();
  
  if (email === 'solarastra.in@gmail.com') {
    return { role: 'platform_admin' };
  }

  // Check if user is a company admin
  const companiesRef = collection(db, 'companies');
  const adminQuery = query(companiesRef, where('adminEmails', 'array-contains', email));
  const adminSnapshot = await getDocs(adminQuery);

  if (!adminSnapshot.empty) {
    const doc = adminSnapshot.docs[0];
    return {
      role: 'company_admin',
      company: { id: doc.id, ...doc.data() } as Company
    };
  }

  // Employee Check
  const allCompaniesSnapshot = await getDocs(companiesRef);
  const domain = email.split('@')[1];
  
  const selectedCompanyId = localStorage.getItem('selectedCompanyId');

  for (const doc of allCompaniesSnapshot.docs) {
    const data = doc.data() as Company;
    
    // If a specific company was selected, only verify against that company
    if (selectedCompanyId && doc.id !== selectedCompanyId) continue;

    if (data.allowedDomains && data.allowedDomains.includes(domain)) {
      return {
        role: 'employee',
        company: { id: doc.id, ...data }
      };
    }
  }

  return { role: 'none' };
}
