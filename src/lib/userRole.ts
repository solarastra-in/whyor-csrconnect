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
  employeeEmails?: string[];
  whyCSRImportant?: string;
  overview?: string;
  promoters?: string;
  contacts?: string;
  connectionPreference?: string;
  goals?: string;
  employeeStrength?: number;
  enableEmployeeSurveys?: boolean;
  smtpSettings?: SmtpSettings;
  targetHours?: number;
}

export interface Charity {
  id: string;
  name: string;
  adminEmails: string[];
  employeeEmails?: string[];
  status?: string;
  focus?: string;
  website?: string;
  location?: string;
  summary?: string;
  paymentConfig?: {
    splitPercentage?: number;
    platformFee?: number;
    bankDetails?: string;
    upiDetails?: string;
    paymentMode?: 'direct' | 'portal' | 'split';
  }
}

export interface UserRoleInfo {
  role: 'platform_admin' | 'platform_staff' | 'company_admin' | 'employee' | 'ngo_admin' | 'ngo_employee' | 'none';
  charity?: Charity;
  company?: Company;
}

export async function getUserRoleInfo(user: User | null): Promise<UserRoleInfo> {
  if (!user) {
    return { role: 'none' };
  }
  
  if (user.isAnonymous) {
    return {
      role: 'employee',
      company: { id: 'demo_company', name: 'Demo Corp', adminEmails: [], allowedDomains: [] } as Company
    };
  }
  
  if (!user.email) {
    return { role: 'none' };
  }

  // Get token result to check custom claims
  const tokenResult = await user.getIdTokenResult();
  const claims = tokenResult.claims;
  
  if (claims.role === 'platform_admin' || user.email.toLowerCase() === 'solarastra.in@gmail.com') {
    return { role: 'platform_admin' };
  }
  
  const role = claims.role as 'company_admin' | 'employee' | 'none';
  const companyId = claims.companyId as string;

  if (role !== 'none' && companyId) {
    // We fetch the company document from firestore directly here
    const { getDoc, doc } = await import('firebase/firestore');
    const { db } = await import('@/src/lib/firebase');
    const docSnap = await getDoc(doc(db, 'companies', companyId));
    
    if (docSnap.exists()) {
      return {
        role,
        company: { id: docSnap.id, ...docSnap.data() } as Company
      };
    }
  }

  // Fallback if claims are not populated (should happen only if sync-claims failed)
  const email = user.email?.toLowerCase() || '';
  
  const { collection, getDocs, query, where } = await import('firebase/firestore');
  const { db } = await import('@/src/lib/firebase');
  // Check if user is a company admin
  const companiesRef = collection(db, 'companies');
  const adminQuery = query(companiesRef, where('adminEmails', 'array-contains', email));
  const adminSnapshot = await getDocs(adminQuery);

  if (!adminSnapshot.empty) {
    const docSnap = adminSnapshot.docs[0];
    return {
      role: 'company_admin',
      company: { id: docSnap.id, ...docSnap.data() } as Company
    };
  }

  
  // Check if user is an NGO admin
  const charitiesRef = collection(db, 'charities');
  const ngoAdminQuery = query(charitiesRef, where('adminEmails', 'array-contains', email));
  const ngoAdminSnapshot = await getDocs(ngoAdminQuery);
  if (!ngoAdminSnapshot.empty) {
    const docSnap = ngoAdminSnapshot.docs[0];
    return {
      role: 'ngo_admin',
      charity: { id: docSnap.id, ...docSnap.data() } as Charity
    };
  }

  // Employee Check
  // Check if user is an NGO employee
  const ngoEmployeeQuery = query(charitiesRef, where('employeeEmails', 'array-contains', email));
  const ngoEmployeeSnapshot = await getDocs(ngoEmployeeQuery);
  if (!ngoEmployeeSnapshot.empty) {
    const docSnap = ngoEmployeeSnapshot.docs[0];
    return {
      role: 'ngo_employee',
      charity: { id: docSnap.id, ...docSnap.data() } as Charity
    };
  }
  
  const allCompaniesSnapshot = await getDocs(companiesRef);
  const domain = email.split('@')[1];
  
  const selectedCompanyId = localStorage.getItem('selectedCompanyId');

  for (const docSnap of allCompaniesSnapshot.docs) {
    const data = docSnap.data() as Company;
    
    // If a specific company was selected, only verify against that company
    if (selectedCompanyId && docSnap.id !== selectedCompanyId) continue;

    if ((data.allowedDomains && data.allowedDomains.includes(domain)) || (data.employeeEmails && data.employeeEmails.includes(email))) {
      return {
        role: 'employee',
        company: { id: docSnap.id, ...data }
      };
    }
  }

  return { role: 'none' };
}
