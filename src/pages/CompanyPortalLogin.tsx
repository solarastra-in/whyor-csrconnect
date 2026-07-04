import React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/src/contexts/AuthContext';
import { db } from '@/src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Company } from '@/src/lib/userRole';
import { Building2, LogIn, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function CompanyPortalLogin() {
  const { companyId } = useParams();
  const { user, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [domainError, setDomainError] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmailInput(val);
    if (val.includes('@')) {
      const domain = val.split('@')[1].toLowerCase();
      const allowedDomains = company?.allowedDomains || [];
      const employeeEmails = company?.employeeEmails || [];
      
      if (allowedDomains.includes(domain) || employeeEmails.includes(val.toLowerCase())) {
        setDomainError('');
      } else {
        setDomainError('This email domain is not whitelisted for this company portal.');
      }
    } else {
      setDomainError('');
    }
  };


  useEffect(() => {
    if (user) {
      // If user is already logged in, redirect them to the app
      // We should ideally check their role first, but setting localstorage helps userRole.ts
      localStorage.setItem('selectedCompanyId', companyId || '');
      navigate('/');
    }
  }, [user, navigate, companyId]);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) return;
      try {
        const snap = await getDoc(doc(db, 'companies', companyId));
        if (snap.exists()) {
          setCompany({ id: snap.id, ...snap.data() } as Company);
        } else {
          toast.error("Company portal not found.");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [companyId]);

  const handleSSOLogin = async () => {
    try {
      localStorage.setItem('selectedCompanyId', companyId || '');
      await signIn();
    } catch (error) {
      console.error(error);
      toast.error("Login failed.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-6 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Portal Not Found</h2>
          <p className="text-gray-500 mb-6">The requested company portal does not exist.</p>
          <Button onClick={() => navigate('/')}>Return to Main Site</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md overflow-hidden shadow-xl border-0">
          <div className="p-8 text-center text-white" style={{ backgroundColor: (company as any).primaryColor || '#4f46e5' }}>
            {(company as any).logoUrl ? <img src={(company as any).logoUrl} alt={company.name} className="h-16 mx-auto mb-4 object-contain" /> : <Building2 className="w-16 h-16 mx-auto mb-4 opacity-90" />}
            <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
            <p className="mt-2 text-indigo-100">Employee Impact Portal</p>
          </div>
          <CardContent className="p-8 text-center bg-white">
            
            <p className="text-gray-600 mb-6">
              Sign in with your corporate account to access your employee resource groups, 
              volunteering opportunities, and matching campaigns.
            </p>
            
            <div className="space-y-4 mb-6 text-left">
              <div className="space-y-2">
                <Label htmlFor="email">Corporate Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="employee@company.com" 
                  value={emailInput}
                  onChange={handleEmailChange}
                />
                {domainError && <p className="text-sm text-red-500 mt-1">{domainError}</p>}
                {!domainError && emailInput.includes('@') && <p className="text-sm text-green-600 mt-1">Domain validated. You may proceed.</p>}
              </div>
            </div>
            
            <Button 
              onClick={handleSSOLogin} 
              disabled={!emailInput || !!domainError}
              className="w-full hover:opacity-90 h-12 text-lg text-white" style={{ backgroundColor: (company as any).primaryColor || '#4f46e5' }}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Corporate SSO Login
            </Button>

            
            <p className="mt-6 text-xs text-gray-400">
              By logging in, you agree to the terms of service and privacy policy established by {company.name}.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <footer className="py-6 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500 font-medium">
          <span>Powered By</span>
          <span className="text-indigo-600 font-bold tracking-tight">WhyOr CSR Connect</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">&copy; {new Date().getFullYear()} WhyOr. All rights reserved.</p>
      </footer>
    </div>
  );
}
