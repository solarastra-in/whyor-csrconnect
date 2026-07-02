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
  const email = user.email.toLowerCase();
  
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

  // Employee Check
  const allCompaniesSnapshot = await getDocs(companiesRef);
  const domain = email.split('@')[1];
  
  const selectedCompanyId = localStorage.getItem('selectedCompanyId');

  for (const docSnap of allCompaniesSnapshot.docs) {
    const data = docSnap.data() as Company;
    
    // If a specific company was selected, only verify against that company
    if (selectedCompanyId && docSnap.id !== selectedCompanyId) continue;

    if (data.allowedDomains && data.allowedDomains.includes(domain)) {
      return {
        role: 'employee',
        company: { id: docSnap.id, ...data }
      };
    }
  }

  return { role: 'none' };
}
