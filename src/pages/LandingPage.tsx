import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import { Building2, UserCircle, LayoutDashboard, HeartHandshake, Globe, ShieldCheck, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/src/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getUserRoleInfo, UserRoleInfo, Company } from '@/src/lib/userRole';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { toast } from 'sonner';
import { FAQ, FAQItem } from '@/src/components/FAQ';
import { LanguageSwitcher } from '@/src/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const landingPageFaqs: FAQItem[] = [
  {
    question: "How do I onboard my company to the platform?",
    answer: "You can click on 'Set up a new company portal' in the Company Admin section. You'll need to provide your company details, verified domains, and initial employee lists to get started."
  },
  {
    question: "What features are included in the employee portal?",
    answer: "Employees can discover verified charities, join volunteering challenges, track their impact, pledge donations, and earn community points for their engagement."
  },
  {
    question: "Are the charities on this platform verified?",
    answer: "Yes, every NGO undergoes a rigorous onboarding journey. We validate CSR-1, 80G, and MCA documentation using AI-assisted checks to ensure funds go to legitimate organizations."
  },
  {
    question: "Can we set up custom corporate matching?",
    answer: "Absolutely. Company admins can configure corporate matching rules (e.g., 1:1 or 2:1 matching up to a certain limit) for their employees' donations from the Company Settings dashboard."
  }
];

export function LandingPage() {
  const { user, signIn, signInAsDemo, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [roleInfo, setRoleInfo] = useState<UserRoleInfo | null>(null);
  const [checkingRole, setCheckingRole] = useState(false);
  
  // Employee Company Selection
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  useEffect(() => {
    // Fetch companies for dropdown
    getDocs(collection(db, 'companies')).then(snapshot => {
      setCompanies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company)));
    }).catch(err => {
      console.error('Error fetching companies:', err);
    });
  }, []);

  useEffect(() => {
    if (user) {
      setCheckingRole(true);
      getUserRoleInfo(user).then(info => {
        setRoleInfo(info);
        setCheckingRole(false);
        // Auto redirect
        if (info.role === 'platform_admin') {
          navigate('/admin');
        } else if (info.role === 'company_admin') {
          navigate('/company');
        } else if (info.role === 'employee' && info.company) {
          // If they selected a specific company, we can check here, but getUserRoleInfo 
          // already does domain matching. The user is allowed if any domain matched.
          // If we want strict selection check, we can compare `info.company.id === selectedCompanyId`.
          navigate('/employee');
        }
      }).catch(() => {
        setCheckingRole(false);
      });
    }
  }, [user, navigate]);

  const handleEmployeeLogin = () => {
    setShowCompanyDialog(true);
  };

  const proceedWithSelectedCompany = async () => {
    if (!selectedCompanyId) {
      toast.error('Please select a company');
      return;
    }
    // Set in local storage so we can check it after SSO redirects (if using redirect, though we use popup)
    localStorage.setItem('selectedCompanyId', selectedCompanyId);
    setShowCompanyDialog(false);
    await signIn();
  };

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-8 w-8 text-indigo-600" />
              <span className="font-bold text-xl tracking-tight text-slate-900">Corporate Purpose Platform</span>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              {user ? (
                <Button variant="outline" onClick={signOut} className="text-slate-600 border-slate-300">Sign Out</Button>
              ) : (
                <Button onClick={signIn} className="bg-indigo-600 hover:bg-indigo-700">Sign In</Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        <Badge variant="secondary" className="mb-6 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100">Enterprise Ready CSR Platform</Badge>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          {t('landing.hero.title')}
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          {t('landing.hero.subtitle')}
        </p>
        
        <div className="relative mx-auto max-w-5xl rounded-xl overflow-hidden shadow-2xl border border-slate-200 mb-16 group">
          <img 
            src="https://images.unsplash.com/photo-1593113563332-ceb47c2f6d0f?q=80&w=2070&auto=format&fit=crop" 
            alt="People volunteering together" 
            className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 text-white text-left flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-bold mb-1">Empowering Communities</h3>
              <p className="text-slate-200">Connecting corporate resources with verified grassroots impact.</p>
            </div>
            <div className="hidden sm:flex space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-xs text-slate-200 uppercase tracking-wider">NGOs</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                <p className="text-2xl font-bold text-white">2M+</p>
                <p className="text-xs text-slate-200 uppercase tracking-wider">Hours</p>
              </div>
            </div>
          </div>
        </div>
        
        {!user ? (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-8 text-slate-900">Select your portal to get started</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
              <button onClick={handleEmployeeLogin} className="block group text-left w-full">
                <Card className="h-full transition-all hover:shadow-md hover:border-blue-300 border-slate-200">
                  <CardHeader>
                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <UserCircle className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{t('landing.login.employee')}</CardTitle>
                    <CardDescription>Discover projects & track impact.</CardDescription>
                  </CardHeader>
                </Card>
              </button>
              <div className="flex flex-col h-full">
                <button onClick={signIn} className="block group flex-1 text-left w-full">
                  <Card className="h-full transition-all hover:shadow-md hover:border-purple-300 border-slate-200">
                    <CardHeader>
                      <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg">{t('landing.login.company')}</CardTitle>
                      <CardDescription>Manage engagement & matching.</CardDescription>
                    </CardHeader>
                  </Card>
                </button>
                <Link to="/onboarding/company" className="text-xs text-purple-600 text-center mt-3 hover:underline">
                  {t('landing.nav.onboard')} &rarr;
                </Link>
              </div>
              <button onClick={signIn} className="block group text-left w-full">
                <Card className="h-full transition-all hover:shadow-md hover:border-slate-400 border-slate-200">
                  <CardHeader>
                    <div className="h-12 w-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <LayoutDashboard className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">Platform Admin</CardTitle>
                    <CardDescription>Onboard charities & partners.</CardDescription>
                  </CardHeader>
                </Card>
              </button>
            </div>
            <div className="mt-8 flex justify-center">
              <Button variant="ghost" onClick={signInAsDemo} className="text-slate-500">
                View Demo Mode
              </Button>
            </div>

            <Dialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog}>
              <DialogContent className="sm:max-w-xl p-6 sm:p-8">
                <DialogHeader>
                  <DialogTitle>Select Your Company</DialogTitle>
                  <DialogDescription>
                    Choose your company to log in to your employee portal. We will verify your email domain.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                  >
                    <option value="" disabled>Select a company</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" onClick={() => setShowCompanyDialog(false)}>Cancel</Button>
                  <Button onClick={proceedWithSelectedCompany}>Continue with Google</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200 mt-8">
            <h2 className="text-2xl font-bold mb-6">Redirecting to your portal...</h2>
            {roleInfo?.role === 'none' && (
              <div className="text-left">
                <p className="text-slate-600 mb-6 text-center">Your email ({user.email}) is not associated with any registered company.</p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={signOut}>Sign Out</Button>
                  <Link to="/onboarding/company">
                    <Button>Register your Company</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Why, How, What Section */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">The Complete Corporate Purpose Suite</h2>
            <p className="mt-4 text-lg text-slate-600">Workplace giving, matching, volunteering, ERGs, and corporate grants in one fully white-labeled platform.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Fully White-Labeled</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Your brand, your identity. From the login screen down to the 4th level pages, the entire portal adopts your company's logo, colors, and nomenclature.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Engagement & ERGs</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Empower employees with Employee Resource Groups (ERGs), gamified volunteering, micro-actions, and peer-to-peer matching campaigns.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Corporate Grants</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Streamline your corporate grantmaking. Review verified NGO applications, manage budgets, and track the long-term impact of your corporate philanthropy.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Enterprise Ready</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Scalable architecture with SSO integrations, global compliance, detailed impact reporting, and automated matching capabilities built in.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FAQ items={landingPageFaqs} />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-slate-500 text-sm border-t border-slate-200 bg-white">
        &copy; {new Date().getFullYear()} Corporate Purpose Platform. Empowering corporate giving.
      </footer>
    </div>
  );
}
