import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building, Settings, Shield, Bell, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getAuth } from 'firebase/auth';
import { useAuth } from '@/src/contexts/AuthContext';
import { getUserRoleInfo, Company } from '@/src/lib/userRole';
import { db } from '@/src/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';


export function CompanySettings() {
  const { user } = useAuth();
  const [autoMatch, setAutoMatch] = useState(true);
  const [monthlyReports, setMonthlyReports] = useState(true);
  const [leaderboardEnabled, setLeaderboardEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [about, setAbout] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [brandColor, setBrandColor] = useState('#2563eb');
  
  const [smtpSettings, setSmtpSettings] = useState({ host: '', port: 587, user: '', pass: '', secure: false });
  const [enableEmployeeSurveys, setEnableEmployeeSurveys] = useState(false);

  useEffect(() => {
    async function loadCompany() {
      if (user) {
        const info = await getUserRoleInfo(user);
        if (info.company) {
          setCompany(info.company);
          setCompanyName(info.company.name || "");
          setWebsite((info.company as any).website || "");
          setAbout((info.company as any).about || "");
          if (info.company.smtpSettings) {
            setSmtpSettings(info.company.smtpSettings);
          }
          if (info.company.enableEmployeeSurveys !== undefined) {
            setEnableEmployeeSurveys(info.company.enableEmployeeSurveys);
          }
        }
      }
      setLoading(false);
    }
    loadCompany();
  }, [user]);

  const handleCopy = () => {
    navigator.clipboard.writeText("https://auth.solarastra.in/saml2/idpresponse");
    setCopied(true);
    toast.success("ACS URL copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = async () => {
    if (!company) return;
    try {
      await updateDoc(doc(db, 'companies', company.id), {
        name: companyName,
        website,
        about
      });
      toast.success('Profile saved successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save profile');
    }
  };

  const handleSavePreferences = async () => {
    if (!company) return;
    try {
      await updateDoc(doc(db, 'companies', company.id), {
        enableEmployeeSurveys
      });
      toast.success('Preferences saved successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save preferences');
    }
  };

  const handleSaveSAML = async () => {
    if (!company) return;
    try {
      // Dummy SAML saving logic as per the mock data
      toast.success('SAML configuration saved successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save SAML configuration');
    }
  };

  const handleSaveBranding = async () => {
    if (!company) return;
    try {
      // Mock logic for branding save
      toast.success('Branding saved successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save branding');
    }
  };

  const handleSaveSmtp = async () => {
    if (!company) return;
    try {
      // Get the Firebase token
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("No authentication token");

      const response = await fetch(`/api/company/${company.id}/smtp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(smtpSettings)
      });
      
      if (!response.ok) {
        throw new Error("Failed to save via API");
      }
      
      // Still store non-sensitive config in public doc so UI knows it's configured
      const { pass, ...publicSmtpSettings } = smtpSettings;
      await updateDoc(doc(db, 'companies', company.id), {
        smtpSettings: publicSmtpSettings
      });
      
      toast.success('SMTP configuration saved securely');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save SMTP configuration');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !company) return;
    const file = e.target.files[0];
    
    // Check file size (limit to 500KB to fit well within Firestore 1MB limit)
    if (file.size > 500 * 1024) {
      toast.error('Image is too large. Please upload an image smaller than 500KB.');
      return;
    }
    
    setUploadingLogo(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        try {
          await updateDoc(doc(db, 'companies', company.id), {
            logoUrl: base64String
          });
          
          setCompany({ ...company, logoUrl: base64String } as any);
          toast.success('Logo uploaded successfully');
        } catch (dbError) {
          console.error(dbError);
          toast.error('Failed to save logo to database');
        } finally {
          setUploadingLogo(false);
        }
      };
      reader.onerror = () => {
        toast.error('Failed to read file');
        setUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      toast.error('Failed to process image');
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Portal Settings</h1>
        <p className="text-gray-500 mt-1">Manage your company profile, billing, and CSR preferences.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-6 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="smtp">SMTP</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-gray-500" />
                <CardTitle>Company Profile</CardTitle>
              </div>
              <CardDescription>Update your company's public information shown to employees.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" defaultValue="Technology & Software" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://techcorp.example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="about">About Company</Label>
                <textarea 
                  id="about" 
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={about}
                  onChange={e => setAbout(e.target.value)}
                  placeholder="Write a short description about your company..."
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => toast('Changes discarded')}>Discard Changes</Button>
            <Button onClick={handleSaveProfile}>Save Profile</Button>
          </div>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Whitelabeling & Branding</CardTitle>
              <CardDescription>Customize the employee portal to match your corporate identity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Company Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center border border-dashed border-gray-300 overflow-hidden">
                      {(company as any)?.logoUrl ? (
                        <img src={(company as any).logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Building className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="relative">
                      <Input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        accept="image/*" 
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                      />
                      <Button variant="outline" size="sm" className="pointer-events-none">
                        {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                      </Button>
                    </div>
                    <span className="text-xs text-gray-500">Recommended: 256x256px PNG</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Primary Brand Color</Label>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { name: 'Ocean Blue', color: '#2563eb', class: 'bg-blue-600' },
                      { name: 'Forest Green', color: '#16a34a', class: 'bg-green-600' },
                      { name: 'Sunset Orange', color: '#ea580c', class: 'bg-orange-600' },
                      { name: 'Royal Purple', color: '#9333ea', class: 'bg-purple-600' },
                      { name: 'Slate Gray', color: '#475569', class: 'bg-slate-600' }
                    ].map((theme) => (
                      <div
                        key={theme.name}
                        onClick={() => setBrandColor(theme.color)}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${brandColor === theme.color ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-300 bg-white'}`}
                      >
                        <div className={`h-8 w-8 rounded-full ${theme.class} shadow-sm border border-black/10`}></div>
                        <span className="text-xs font-medium text-gray-700">{theme.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-sm text-gray-500">Custom Hex:</span>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="brandColor" 
                        value={brandColor} 
                        onChange={(e) => setBrandColor(e.target.value)} 
                        className="w-28 font-mono text-sm" 
                      />
                      <div className="h-9 w-9 rounded-md border border-gray-200 shadow-sm" style={{ backgroundColor: brandColor }}></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portalName">Custom Portal Name</Label>
                  <Input id="portalName" defaultValue="TechCorp Giving" />
                  <p className="text-xs text-gray-500">This name will be displayed in the header of the employee portal.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => toast('Changes discarded')}>Discard Changes</Button>
            <Button onClick={handleSaveBranding}>Save Branding</Button>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-500" />
                <CardTitle>CSR Program Preferences</CardTitle>
              </div>
              <CardDescription>Configure how your CSR program operates on the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="auto-match" className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-900">Automatic Donation Matching</span>
                  <span className="font-normal text-sm text-gray-500">Automatically match eligible employee donations up to their annual limit.</span>
                </Label>
                <Switch 
                  id="auto-match" 
                  checked={autoMatch} 
                  onCheckedChange={setAutoMatch}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="leaderboard" className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-900">Enable Department Leaderboards</span>
                  <span className="font-normal text-sm text-gray-500">Show department rankings on employee dashboards to encourage participation.</span>
                </Label>
                <Switch 
                  id="leaderboard" 
                  checked={leaderboardEnabled} 
                  onCheckedChange={setLeaderboardEnabled}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="monthly-reports" className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-900">Automated Monthly Reports</span>
                  <span className="font-normal text-sm text-gray-500">Receive a consolidated CSR impact report via email on the 1st of every month.</span>
                </Label>
                <Switch 
                  id="monthly-reports" 
                  checked={monthlyReports} 
                  onCheckedChange={setMonthlyReports}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="employee-surveys" className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-900">Employee Surveys</span>
                  <span className="font-normal text-sm text-gray-500">Send post-project feedback surveys to employees.</span>
                </Label>
                <Switch 
                  id="employee-surveys" 
                  checked={enableEmployeeSurveys} 
                  onCheckedChange={setEnableEmployeeSurveys}
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => toast('Changes discarded')}>Discard Changes</Button>
            <Button onClick={handleSavePreferences}>Save Preferences</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Invoices</CardTitle>
              <CardDescription>Manage your subscription and matching fund deposits.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Your next invoice for platform fees is due on July 1, 2026.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-500" />
                <CardTitle>Security & SSO</CardTitle>
              </div>
              <CardDescription>Manage SSO integration and admin access controls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">SAML / Single Sign-On (SSO)</h4>
                    <p className="text-sm text-gray-500">Allow your employees to sign in seamlessly using their corporate credentials.</p>
                  </div>
                  <Dialog>
                    <DialogTrigger render={<Button variant="outline" />}>
                      Configure SSO
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>SSO Configuration Guide</DialogTitle>
                        <DialogDescription>
                          Follow these instructions to integrate your enterprise Identity Provider (e.g., Okta, Azure AD).
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-gray-900">Step 1: Create a SAML Application</h3>
                          <p className="text-sm text-gray-600">
                            In your Identity Provider's admin console, create a new SAML 2.0 application.
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-semibold text-gray-900">Step 2: Configure SAML Settings</h3>
                          <p className="text-sm text-gray-600">
                            Use the following values to configure your application:
                          </p>
                          <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-4">
                            <div>
                              <Label className="text-xs text-slate-500">Single Sign-On URL (ACS URL)</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="text-xs bg-white px-2 py-1 border rounded flex-1">
                                  https://auth.solarastra.in/saml2/idpresponse
                                </code>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCopy}>
                                  {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-slate-500" />}
                                </Button>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-slate-500">Audience URI (SP Entity ID)</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="text-xs bg-white px-2 py-1 border rounded flex-1">
                                  https://solarastra.in/saml/metadata
                                </code>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-slate-500">Name ID Format</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="text-xs bg-white px-2 py-1 border rounded flex-1">
                                  EmailAddress
                                </code>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-semibold text-gray-900">Step 3: Map Attributes</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Ensure the following attributes are mapped in your SAML response:
                          </p>
                          <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                            <li><code className="bg-slate-100 px-1 rounded">email</code> - User's primary email address</li>
                            <li><code className="bg-slate-100 px-1 rounded">firstName</code> - User's given name</li>
                            <li><code className="bg-slate-100 px-1 rounded">lastName</code> - User's family name</li>
                          </ul>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-200">
                          <h3 className="font-semibold text-gray-900">Submit Identity Provider Details</h3>
                          <p className="text-sm text-gray-600">
                            Provide the details from your Identity Provider to complete the integration.
                          </p>
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <Label>IdP Single Sign-On URL</Label>
                              <Input placeholder="https://your-idp.com/sso/saml" />
                            </div>
                            <div className="space-y-1">
                              <Label>IdP Issuer (Entity ID)</Label>
                              <Input placeholder="https://your-idp.com/issuer" />
                            </div>
                            <div className="space-y-1">
                              <Label>X.509 Certificate</Label>
                              <textarea 
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" type="button">Cancel</Button>
                        <Button type="button" onClick={handleSaveSAML}>Save Configuration</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Allowed Email Domains</h4>
                    <p className="text-sm text-gray-500">Only users with these email domains can join your portal.</p>
                  </div>
                  <Button variant="outline" onClick={() => toast('Domain management would open here')}>Manage Domains</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Role-Based Access Control</h4>
                    <p className="text-sm text-gray-500">Manage portal administrators and their permissions.</p>
                  </div>
                  <Button variant="outline" onClick={() => toast('Role management would open here')}>Manage Roles</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smtp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
              <CardDescription>Configure your company's SMTP server for sending emails to employees.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input id="smtpHost" placeholder="smtp.example.com" value={smtpSettings.host} onChange={e => setSmtpSettings({...smtpSettings, host: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input id="smtpPort" type="number" placeholder="587" value={smtpSettings.port || ''} onChange={e => setSmtpSettings({...smtpSettings, port: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input id="smtpUser" placeholder="admin@example.com" value={smtpSettings.user} onChange={e => setSmtpSettings({...smtpSettings, user: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPass">SMTP Password</Label>
                <Input id="smtpPass" type="password" placeholder="••••••••" value={smtpSettings.pass} onChange={e => setSmtpSettings({...smtpSettings, pass: e.target.value})} />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch id="smtpSecure" checked={smtpSettings.secure} onCheckedChange={c => setSmtpSettings({...smtpSettings, secure: c})} />
                <Label htmlFor="smtpSecure">Use SSL/TLS</Label>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => toast('SMTP changes discarded')}>Discard</Button>
            <Button onClick={handleSaveSmtp}>Save SMTP Config</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
