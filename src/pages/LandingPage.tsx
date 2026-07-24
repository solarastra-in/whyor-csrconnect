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
import { CSRNewsFeed } from '@/src/components/CSRNewsFeed';
import { CSREcosystemBanner } from '@/src/components/CSREcosystemBanner';
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
        } else if (info.role === 'ngo_admin') {
          navigate('/ngo');
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

  const handleEmployeeLogin = () => { signIn(); };

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
        
        {/* Main CSR Ecosystem Banner from SVG Asset */}
        <div className="mx-auto max-w-6xl mb-12">
          <CSREcosystemBanner />
        </div>
        
        {!user ? (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-8 text-slate-900">Select your portal to get started</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left max-w-6xl mx-auto">
              <button onClick={handleEmployeeLogin} className="block group text-left w-full">
                <Card className="h-full transition-all hover:shadow-lg hover:border-blue-400 border-slate-200 overflow-hidden flex flex-col">
                  <div className="h-32 bg-slate-100 relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80" 
                      alt="Employee Volunteering" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                      <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow">
                        <UserCircle className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-sm tracking-wide">Employee</span>
                    </div>
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{t('landing.login.employee')}</CardTitle>
                    <CardDescription className="text-xs">Discover projects, join challenges & track personal impact.</CardDescription>
                  </CardHeader>
                </Card>
              </button>

              <div className="flex flex-col h-full">
                <button onClick={signIn} className="block group flex-1 text-left w-full">
                  <Card className="h-full transition-all hover:shadow-lg hover:border-purple-400 border-slate-200 overflow-hidden flex flex-col">
                    <div className="h-32 bg-slate-100 relative overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80" 
                        alt="Company Corporate Office" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                        <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center text-white shadow">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-sm tracking-wide">Company</span>
                      </div>
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{t('landing.login.company')}</CardTitle>
                      <CardDescription className="text-xs">Configure matching rules, grant budgets & ERG groups.</CardDescription>
                    </CardHeader>
                  </Card>
                </button>
                <Link to="/onboarding/company" className="text-xs text-purple-600 text-center mt-3 hover:underline font-medium">
                  {t('landing.nav.onboard')} &rarr;
                </Link>
              </div>
              
              <div className="flex flex-col h-full">
                <button onClick={signIn} className="block group flex-1 text-left w-full">
                  <Card className="h-full transition-all hover:shadow-lg hover:border-emerald-400 border-slate-200 overflow-hidden flex flex-col">
                    <div className="h-32 bg-slate-100 relative overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80" 
                        alt="NGO Grassroots Work" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                        <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow">
                          <HeartHandshake className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-sm tracking-wide">NGO / Charity</span>
                      </div>
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">NGO / Charity</CardTitle>
                      <CardDescription className="text-xs">Publish projects, request corporate grants & recruit skill-volunteers.</CardDescription>
                    </CardHeader>
                  </Card>
                </button>
                <Link to="/onboarding/charity" className="text-xs text-emerald-600 text-center mt-3 hover:underline font-medium">
                  Register NGO &rarr;
                </Link>
              </div>

              <button onClick={signIn} className="block group text-left w-full">
                <Card className="h-full transition-all hover:shadow-lg hover:border-slate-400 border-slate-200 overflow-hidden flex flex-col">
                  <div className="h-32 bg-slate-100 relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80" 
                      alt="Platform Analytics" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                      <div className="h-8 w-8 bg-slate-800 rounded-lg flex items-center justify-center text-white shadow">
                        <LayoutDashboard className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-sm tracking-wide">Platform Admin</span>
                    </div>
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Platform Admin</CardTitle>
                    <CardDescription className="text-xs">Verify NGO credentials, monitor global CSR analytics & compliance.</CardDescription>
                  </CardHeader>
                </Card>
              </button>
            </div>
            <div className="mt-8 flex justify-center">
              <Button variant="ghost" onClick={signInAsDemo} className="text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                Explore Demo Mode
              </Button>
            </div>
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
                  <Link to="/onboarding/charity">
                    <Button variant="secondary">Register your NGO</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Impact Pillars in Action Showcase */}
      <section className="py-16 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 mb-3">Impact Focus Areas</Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Grassroots Action Across Critical UN SDGs</h2>
            <p className="mt-3 text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Empowering companies and non-profits to measure tangible social and environmental progress in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group rounded-xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-indigo-500 transition-all duration-300">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80" 
                  alt="Reforestation Drive" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <Badge className="absolute top-3 left-3 bg-emerald-600/90 text-white border-0 text-xs font-semibold">
                  SDG 15: Life on Land
                </Badge>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-white mb-2">Urban Afforestation</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Miyawaki micro-forest planting drives restoring native biodiversity and capturing carbon in dense urban zones.
                </p>
              </div>
            </div>

            <div className="group rounded-xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-indigo-500 transition-all duration-300">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80" 
                  alt="Digital Literacy Class" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <Badge className="absolute top-3 left-3 bg-blue-600/90 text-white border-0 text-xs font-semibold">
                  SDG 4: Quality Education
                </Badge>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-white mb-2">Digital Literacy</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Employee tech volunteering bringing coding, AI literacy, and computer hardware to underfunded rural schools.
                </p>
              </div>
            </div>

            <div className="group rounded-xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-indigo-500 transition-all duration-300">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80" 
                  alt="River Cleanup Drive" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <Badge className="absolute top-3 left-3 bg-cyan-600/90 text-white border-0 text-xs font-semibold">
                  SDG 6: Clean Water
                </Badge>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-white mb-2">Water Sanitation</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Community riverfront cleanup campaigns, water filtration kit installations, and aquatic health testing.
                </p>
              </div>
            </div>

            <div className="group rounded-xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-indigo-500 transition-all duration-300">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80" 
                  alt="Solar Energy Installation" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <Badge className="absolute top-3 left-3 bg-amber-600/90 text-white border-0 text-xs font-semibold">
                  SDG 7: Clean Energy
                </Badge>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-white mb-2">Rural Micro-Grids</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Corporate grant-funded solar micro-grids bringing uninterrupted electrification to off-grid tribal villages.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Updates & CSR News Feed */}
      <section className="py-16 bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-2 bg-white text-indigo-700 border-indigo-200">Live Impact Stream</Badge>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Community CSR Updates & Highlights</h2>
            <p className="mt-2 text-slate-600 text-sm max-w-xl mx-auto">
              Real stories, campaign milestones, and grant impact reports shared directly by partner non-profits.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <CSRNewsFeed isAdmin={false} />
          </div>
        </div>
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
