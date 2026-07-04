import { db } from '@/src/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Building, Upload, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export function CompanyOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    website: '',
    about: '',
    portalName: '',
    brandColor: '#2563eb',
    autoMatch: true,
    allowedDomains: '',
  });

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user || !user.email) throw new Error("Not authenticated");
        
        await addDoc(collection(db, 'companies'), {
          name: formData.companyName,
          industry: formData.industry,
          website: formData.website,
          about: formData.about,
          brandColor: formData.brandColor,
          autoMatch: formData.autoMatch,
          adminEmails: [user.email.toLowerCase()],
          allowedDomains: [user.email.split('@')[1].toLowerCase(), ...formData.allowedDomains.split(',').map(d => d.trim()).filter(Boolean)],
          status: 'pending_review',
          createdAt: new Date().getTime()
        });
        
        // Sync claims
        const token = await user.getIdToken(true);
        await fetch('/api/auth/sync-claims', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        localStorage.removeItem('companyOnboardingDraft'); toast.success('Company registration submitted for review!');
        navigate('/company');
      } catch (error) {
        console.error(error);
        toast.error('Failed to register company.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome to GoodWork Platform</h1>
          <p className="text-gray-500 mt-2">Let's set up your Corporate Social Responsibility (CSR) portal in a few easy steps.</p>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                </div>
                {s < 4 && <div className={`h-1 w-12 mx-2 rounded-full ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-lg border-0">
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
                <CardDescription>Tell us about your organization to get started.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input 
                    id="companyName" 
                    placeholder="e.g. Acme Corp" 
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input 
                    id="industry" 
                    placeholder="e.g. Technology" 
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input 
                    id="website" 
                    placeholder="https://example.com" 
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about">About Company</Label>
                  <textarea 
                    id="about" 
                    placeholder="Brief description of your company..." 
                    value={formData.about}
                    onChange={(e) => setFormData({...formData, about: e.target.value})}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Whitelabeling & Branding</CardTitle>
                <CardDescription>Customize the employee portal to match your corporate identity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Company Logo</Label>
                    <div className="relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <Input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        accept="image/*" 
                        onChange={() => toast.success('Logo uploaded successfully')} 
                      />
                      <Upload className="h-8 w-8 text-gray-400 mb-2 pointer-events-none" />
                      <p className="text-sm font-medium text-gray-700 pointer-events-none">Click to upload logo</p>
                      <p className="text-xs text-gray-500 mt-1 pointer-events-none">PNG, JPG up to 5MB</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="portalName">Custom Portal Name</Label>
                    <Input 
                      id="portalName" 
                      placeholder="e.g. Acme Gives Back" 
                      value={formData.portalName}
                      onChange={(e) => setFormData({...formData, portalName: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brandColor">Primary Brand Color</Label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        id="brandColor" 
                        value={formData.brandColor}
                        onChange={(e) => setFormData({...formData, brandColor: e.target.value})}
                        className="h-10 w-10 p-1 rounded cursor-pointer"
                      />
                      <Input 
                        value={formData.brandColor} 
                        onChange={(e) => setFormData({...formData, brandColor: e.target.value})}
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Program Preferences</CardTitle>
                <CardDescription>Configure your initial CSR rules. (You can change these later)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4 p-4 border rounded-lg bg-white">
                  <div className="mt-1">
                    <Switch 
                      checked={formData.autoMatch}
                      onCheckedChange={(v) => setFormData({...formData, autoMatch: v})}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Enable 1:1 Donation Matching</h4>
                    <p className="text-sm text-gray-500 mt-1">Automatically match employee donations to verified charities up to an annual limit.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 border rounded-lg bg-white">
                  <div className="mt-1">
                    <Switch defaultChecked />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Department Leaderboards</h4>
                    <p className="text-sm text-gray-500 mt-1">Foster friendly competition by showing department volunteer hours and donations.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 border rounded-lg bg-white">
                  <div className="mt-1">
                    <Switch defaultChecked />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Automated Monthly Reports</h4>
                    <p className="text-sm text-gray-500 mt-1">Send a consolidated impact report to administrators every month.</p>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>Single Sign-On (SSO)</CardTitle>
                <CardDescription>How will your employees access the portal?</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="saml" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="saml">SAML / OAuth</TabsTrigger>
                    <TabsTrigger value="email">Email Domains</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="saml" className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Connect your corporate identity provider (Okta, Entra ID, Google Workspace) for seamless employee access.</p>
                    <div className="p-6 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center text-center">
                      <Building className="h-10 w-10 text-gray-400 mb-3" />
                      <h3 className="font-medium text-gray-900">Configure Identity Provider</h3>
                      <p className="text-sm text-gray-500 mt-1 mb-4">Our support team will help you map the SAML attributes.</p>
                      <Button variant="outline" onClick={() => toast.success('Metadata XML downloading...')}>Download Metadata XML</Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="email" className="space-y-4">
                    <p className="text-sm text-gray-600">Alternatively, restrict access to specific email domains.</p>
                    <div className="space-y-2">
                      <Label>Allowed Domains</Label>
                      <Input placeholder="acmecorp.com, subsidiary.com" value={formData.allowedDomains} onChange={(e) => setFormData({...formData, allowedDomains: e.target.value})} />
                      <p className="text-xs text-gray-500">Press enter to add multiple domains.</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          )}

          <CardFooter className="flex justify-between border-t pt-6">
            <Button 
              variant="outline" 
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              Back
            </Button>
            <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
              {step === 4 ? 'Complete Setup' : 'Next Step'} 
              {step !== 4 && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
