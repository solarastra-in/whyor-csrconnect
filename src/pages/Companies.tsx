import { Building2, Users, ArrowUpRight, Search, CheckCircle2, Plus, Edit2, Mail, Globe, Phone, Settings, Shield, Activity, FileText, Target, Briefcase, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { getAuth } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Company } from '@/src/lib/userRole';

export function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Registration Form State
  const [open, setOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', adminEmails: '', allowedDomains: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Form State
  const [editOpen, setEditOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'companies'));
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
      setCompanies(fetched);
    } catch (error) {
      console.error("Error fetching companies", error);
      toast.error('Failed to load companies.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!newCompany.name || !newCompany.adminEmails || !newCompany.allowedDomains) {
      toast.error("Please fill all fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'companies'), {
        name: newCompany.name,
        adminEmails: newCompany.adminEmails.split(',').map(e => e.trim().toLowerCase()),
        allowedDomains: newCompany.allowedDomains.split(',').map(d => d.trim().toLowerCase()),
        createdAt: Date.now()
      });
      toast.success('Company registered successfully.');
      setOpen(false);
      setNewCompany({ name: '', adminEmails: '', allowedDomains: '' });
      fetchCompanies();
    } catch (error) {
      console.error(error);
      toast.error('Failed to register company.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (company: Company) => {
    setEditingCompany({
      id: company.id!,
      name: company.name,
      adminEmails: company.adminEmails.join(', '),
      allowedDomains: company.allowedDomains.join(', '),
      whyCSRImportant: company.whyCSRImportant || '',
      overview: company.overview || '',
      promoters: company.promoters || '',
      contacts: company.contacts || '',
      connectionPreference: company.connectionPreference || '',
      goals: company.goals || '',
      employeeStrength: company.employeeStrength || '',
      enableEmployeeSurveys: company.enableEmployeeSurveys || false,
      smtpSettings: company.smtpSettings || { host: '', port: 587, user: '', pass: '', secure: false }
    });
    setEditErrors({});
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingCompany) return;
    const errors: Record<string, string> = {};
    if (!editingCompany.name?.trim()) errors.name = "Company name is required";
    if (!editingCompany.adminEmails?.trim()) errors.adminEmails = "Admin emails are required";
    if (!editingCompany.allowedDomains?.trim()) errors.allowedDomains = "Allowed employee domains are required";
    
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      toast.error("Please fill all required fields correctly.");
      return;
    }
    setEditErrors({});
    setIsEditSubmitting(true);
    try {
      let publicSmtpSettings = editingCompany.smtpSettings;
      if (publicSmtpSettings) {
        const { pass, ...rest } = publicSmtpSettings;
        publicSmtpSettings = rest as any;
      }
      
      await updateDoc(doc(db, 'companies', editingCompany.id), {
        name: editingCompany.name,
        adminEmails: editingCompany.adminEmails.split(',').map((e: string) => e.trim().toLowerCase()),
        allowedDomains: editingCompany.allowedDomains.split(',').map((d: string) => d.trim().toLowerCase()),
        whyCSRImportant: editingCompany.whyCSRImportant,
        overview: editingCompany.overview,
        promoters: editingCompany.promoters,
        contacts: editingCompany.contacts,
        connectionPreference: editingCompany.connectionPreference,
        goals: editingCompany.goals,
        employeeStrength: Number(editingCompany.employeeStrength) || 0,
        enableEmployeeSurveys: editingCompany.enableEmployeeSurveys,
        smtpSettings: publicSmtpSettings,
        updatedAt: Date.now()
      });
      toast.success('Company updated successfully.');
      setEditOpen(false);
      fetchCompanies();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update company.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Enterprise Partners</h1>
          <p className="text-gray-500">Corporate partners and their employee engagement metrics.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="flex items-center gap-2" />}>
            <Plus className="h-4 w-4" /> Register Partner
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Company</DialogTitle>
              <DialogDescription>
                Add a new corporate partner to the platform and assign their admins.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Acme Corp"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adminEmails">Admin Emails (comma-separated)</Label>
                <Input
                  id="adminEmails"
                  placeholder="admin@acme.com, hr@acme.com"
                  value={newCompany.adminEmails}
                  onChange={(e) => setNewCompany({...newCompany, adminEmails: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="allowedDomains">Allowed Employee Domains (comma-separated)</Label>
                <Input
                  id="allowedDomains"
                  placeholder="acme.com, acme.org"
                  value={newCompany.allowedDomains}
                  onChange={(e) => setNewCompany({...newCompany, allowedDomains: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleRegister} disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Register Company'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Search companies..." className="pl-9" />
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-600" />
                Edit Enterprise Partner
              </DialogTitle>
              <DialogDescription className="mt-1 text-gray-500">
                Update corporate partner details, impact goals, and settings.
              </DialogDescription>
            </div>
          </div>
          
          <div className="p-6">
            {editingCompany && (
              <Tabs defaultValue="basic" className="w-full flex flex-col md:flex-row gap-6">
                <TabsList className="flex flex-col h-auto w-full md:w-56 bg-transparent space-y-1 p-0">
                  <TabsTrigger value="basic" className="w-full justify-start px-4 py-2.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none rounded-md text-gray-600">
                    <Building2 className="h-4 w-4 mr-2" /> Basic Info
                  </TabsTrigger>
                  <TabsTrigger value="profile" className="w-full justify-start px-4 py-2.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none rounded-md text-gray-600">
                    <Target className="h-4 w-4 mr-2" /> Profile & Goals
                  </TabsTrigger>
                  <TabsTrigger value="contacts" className="w-full justify-start px-4 py-2.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none rounded-md text-gray-600">
                    <Users className="h-4 w-4 mr-2" /> Contacts
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="w-full justify-start px-4 py-2.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none rounded-md text-gray-600">
                    <Settings className="h-4 w-4 mr-2" /> Settings & SMTP
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex-1 overflow-hidden">
                  <TabsContent value="basic" className="space-y-6 m-0 outline-none">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Core Information</h3>
                      <div className="space-y-5">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-name" className="text-gray-700 font-medium flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" /> Company Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="edit-name"
                            value={editingCompany.name}
                            onChange={(e) => setEditingCompany({...editingCompany, name: e.target.value})}
                            className={`bg-white ${editErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          />
                          {editErrors.name && <p className="text-xs text-red-500">{editErrors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-employeeStrength" className="text-gray-700 font-medium flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" /> Total Employee Strength
                          </Label>
                          <Input
                            id="edit-employeeStrength"
                            type="number"
                            value={editingCompany.employeeStrength}
                            onChange={(e) => setEditingCompany({...editingCompany, employeeStrength: e.target.value})}
                            className="bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Access & Security</h3>
                      <div className="space-y-5">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-adminEmails" className="text-gray-700 font-medium flex items-center gap-2">
                            <Shield className="h-4 w-4 text-gray-400" /> Admin Emails (comma-separated) <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="edit-adminEmails"
                            value={editingCompany.adminEmails}
                            onChange={(e) => setEditingCompany({...editingCompany, adminEmails: e.target.value})}
                            className={`bg-white ${editErrors.adminEmails ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          />
                          {editErrors.adminEmails ? (
                            <p className="text-xs text-red-500">{editErrors.adminEmails}</p>
                          ) : (
                            <p className="text-xs text-gray-500">These users will have full administrative access to this company's portal.</p>
                          )}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-allowedDomains" className="text-gray-700 font-medium flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-400" /> Allowed Employee Domains <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="edit-allowedDomains"
                            value={editingCompany.allowedDomains}
                            onChange={(e) => setEditingCompany({...editingCompany, allowedDomains: e.target.value})}
                            className={`bg-white ${editErrors.allowedDomains ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            placeholder="e.g., acme.com, acme.org"
                          />
                          {editErrors.allowedDomains ? (
                            <p className="text-xs text-red-500">{editErrors.allowedDomains}</p>
                          ) : (
                            <p className="text-xs text-gray-500">Users signing in with these email domains are automatically recognized as employees.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="profile" className="space-y-6 m-0 outline-none">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Company Profile</h3>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-overview" className="text-gray-700 font-medium">Company Overview</Label>
                        <Textarea
                          id="edit-overview"
                          className="resize-none bg-white"
                          rows={4}
                          placeholder="Brief description of the company and its primary business..."
                          value={editingCompany.overview}
                          onChange={(e) => setEditingCompany({...editingCompany, overview: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">CSR Strategy & Goals</h3>
                      <div className="space-y-5">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-whyCSR" className="text-gray-700 font-medium flex items-center gap-2">
                            <Heart className="h-4 w-4 text-gray-400" /> Why is CSR Important to them?
                          </Label>
                          <Textarea
                            id="edit-whyCSR"
                            className="resize-none bg-white"
                            rows={3}
                            value={editingCompany.whyCSRImportant}
                            onChange={(e) => setEditingCompany({...editingCompany, whyCSRImportant: e.target.value})}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-goals" className="text-gray-700 font-medium flex items-center gap-2">
                            <Target className="h-4 w-4 text-gray-400" /> What they want to achieve (Goals)
                          </Label>
                          <Textarea
                            id="edit-goals"
                            className="resize-none bg-white"
                            rows={3}
                            value={editingCompany.goals}
                            onChange={(e) => setEditingCompany({...editingCompany, goals: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="contacts" className="space-y-6 m-0 outline-none">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Stakeholders</h3>
                      <div className="space-y-5">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-promoters" className="text-gray-700 font-medium">Promoters / Key Stakeholders</Label>
                          <Input
                            id="edit-promoters"
                            placeholder="e.g. John Doe (CEO), Jane Smith (CFO)"
                            value={editingCompany.promoters}
                            onChange={(e) => setEditingCompany({...editingCompany, promoters: e.target.value})}
                            className="bg-white"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-contacts" className="text-gray-700 font-medium flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" /> Main Contacts
                          </Label>
                          <Textarea
                            id="edit-contacts"
                            className="resize-none bg-white"
                            rows={4}
                            placeholder="Names, Phone numbers, Emails"
                            value={editingCompany.contacts}
                            onChange={(e) => setEditingCompany({...editingCompany, contacts: e.target.value})}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-connection" className="text-gray-700 font-medium">How they want to connect</Label>
                          <Input
                            id="edit-connection"
                            placeholder="e.g. Monthly virtual meetings, Quarterly reports"
                            value={editingCompany.connectionPreference}
                            onChange={(e) => setEditingCompany({...editingCompany, connectionPreference: e.target.value})}
                            className="bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-6 m-0 outline-none">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Features</h3>
                      <div className="flex items-start justify-between border border-gray-200 bg-white p-4 rounded-lg shadow-sm">
                        <div className="space-y-1">
                          <Label htmlFor="edit-surveys" className="text-gray-900 font-medium flex items-center gap-2">
                            <Activity className="h-4 w-4 text-indigo-500" /> Enable Employee Surveys
                          </Label>
                          <p className="text-sm text-gray-500 ml-6">Allow sending automated post-project surveys to their employees.</p>
                        </div>
                        <Switch
                          id="edit-surveys"
                          checked={editingCompany.enableEmployeeSurveys}
                          onCheckedChange={(checked) => setEditingCompany({...editingCompany, enableEmployeeSurveys: checked})}
                        />
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Mail className="h-5 w-5 text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900">Custom SMTP Configuration</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">Configure custom email server for sending notifications to this company's employees.</p>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-5 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="smtp-host" className="text-gray-700 font-medium">Host</Label>
                            <Input
                              id="smtp-host"
                              placeholder="smtp.example.com"
                              value={editingCompany.smtpSettings?.host}
                              onChange={(e) => setEditingCompany({...editingCompany, smtpSettings: {...editingCompany.smtpSettings, host: e.target.value}})}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="smtp-port" className="text-gray-700 font-medium">Port</Label>
                            <Input
                              id="smtp-port"
                              type="number"
                              placeholder="587"
                              value={editingCompany.smtpSettings?.port}
                              onChange={(e) => setEditingCompany({...editingCompany, smtpSettings: {...editingCompany.smtpSettings, port: Number(e.target.value)}})}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="smtp-user" className="text-gray-700 font-medium">Username</Label>
                            <Input
                              id="smtp-user"
                              placeholder="admin@example.com"
                              value={editingCompany.smtpSettings?.user}
                              onChange={(e) => setEditingCompany({...editingCompany, smtpSettings: {...editingCompany.smtpSettings, user: e.target.value}})}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="smtp-pass" className="text-gray-700 font-medium">Password</Label>
                            <Input
                              id="smtp-pass"
                              type="password"
                              placeholder="••••••••"
                              value={editingCompany.smtpSettings?.pass}
                              onChange={(e) => setEditingCompany({...editingCompany, smtpSettings: {...editingCompany.smtpSettings, pass: e.target.value}})}
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                          <Switch
                            id="smtp-secure"
                            checked={editingCompany.smtpSettings?.secure}
                            onCheckedChange={(checked) => setEditingCompany({...editingCompany, smtpSettings: {...editingCompany.smtpSettings, secure: checked}})}
                          />
                          <Label htmlFor="smtp-secure" className="text-gray-700 font-medium">Use SSL/TLS (Secure Connection)</Label>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </div>
          
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3 rounded-b-lg">
            <Button variant="outline" onClick={() => setEditOpen(false)} className="bg-white">Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={isEditSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">
              {isEditSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No companies found</h3>
          <p className="text-gray-500 mb-4">Register your first corporate partner.</p>
          <Button onClick={() => setOpen(true)}>Register Partner</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company.id}>
              <CardHeader className="pb-4 relative">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600" onClick={() => openEditDialog(company)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                      Active
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-xl mt-4">{company.name}</CardTitle>
                <CardDescription>
                  Admins: {company.adminEmails.length} | Domains: {company.allowedDomains.join(', ')}
                  {company.employeeStrength ? ` | Employees: ${company.employeeStrength}` : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center">
                      <Users className="h-3 w-3 mr-1" /> Active Vols
                    </p>
                    <p className="font-semibold">0</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Impact</p>
                    <p className="font-semibold text-green-600">₹0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
