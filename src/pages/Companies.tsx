import { Building2, Users, ArrowUpRight, Search, CheckCircle2, Plus, Edit2 } from 'lucide-react';
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
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingCompany || !editingCompany.name || !editingCompany.adminEmails || !editingCompany.allowedDomains) {
      toast.error("Please fill all required fields (Name, Emails, Domains).");
      return;
    }
    setIsEditSubmitting(true);
    try {
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
        smtpSettings: editingCompany.smtpSettings,
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Enterprise Partner</DialogTitle>
            <DialogDescription>
              Update corporate partner details, goals, and SMTP settings.
            </DialogDescription>
          </DialogHeader>
          {editingCompany && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="profile">Profile & Goals</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                <TabsTrigger value="settings">Settings & SMTP</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Company Name *</Label>
                  <Input
                    id="edit-name"
                    value={editingCompany.name}
                    onChange={(e) => setEditingCompany({...editingCompany, name: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-adminEmails">Admin Emails (comma-separated) *</Label>
                  <Input
                    id="edit-adminEmails"
                    value={editingCompany.adminEmails}
                    onChange={(e) => setEditingCompany({...editingCompany, adminEmails: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-allowedDomains">Allowed Employee Domains (comma-separated) *</Label>
                  <Input
                    id="edit-allowedDomains"
                    value={editingCompany.allowedDomains}
                    onChange={(e) => setEditingCompany({...editingCompany, allowedDomains: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-employeeStrength">Total Employee Strength</Label>
                  <Input
                    id="edit-employeeStrength"
                    type="number"
                    value={editingCompany.employeeStrength}
                    onChange={(e) => setEditingCompany({...editingCompany, employeeStrength: e.target.value})}
                  />
                </div>
              </TabsContent>

              <TabsContent value="profile" className="space-y-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-overview">Company Overview</Label>
                  <Textarea
                    id="edit-overview"
                    className="resize-none"
                    rows={3}
                    value={editingCompany.overview}
                    onChange={(e) => setEditingCompany({...editingCompany, overview: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-whyCSR">Why is CSR Important to them?</Label>
                  <Textarea
                    id="edit-whyCSR"
                    className="resize-none"
                    rows={3}
                    value={editingCompany.whyCSRImportant}
                    onChange={(e) => setEditingCompany({...editingCompany, whyCSRImportant: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-goals">What they want to achieve (Goals)</Label>
                  <Textarea
                    id="edit-goals"
                    className="resize-none"
                    rows={3}
                    value={editingCompany.goals}
                    onChange={(e) => setEditingCompany({...editingCompany, goals: e.target.value})}
                  />
                </div>
              </TabsContent>

              <TabsContent value="contacts" className="space-y-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-promoters">Promoters / Key Stakeholders</Label>
                  <Input
                    id="edit-promoters"
                    placeholder="e.g. John Doe (CEO), Jane Smith (CFO)"
                    value={editingCompany.promoters}
                    onChange={(e) => setEditingCompany({...editingCompany, promoters: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-contacts">Main Contacts</Label>
                  <Textarea
                    id="edit-contacts"
                    className="resize-none"
                    rows={3}
                    placeholder="Names, Phone numbers, Emails"
                    value={editingCompany.contacts}
                    onChange={(e) => setEditingCompany({...editingCompany, contacts: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-connection">How they want to connect</Label>
                  <Input
                    id="edit-connection"
                    placeholder="e.g. Monthly virtual meetings, Quarterly reports"
                    value={editingCompany.connectionPreference}
                    onChange={(e) => setEditingCompany({...editingCompany, connectionPreference: e.target.value})}
                  />
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 py-2">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="edit-surveys">Enable Employee Surveys</Label>
                    <p className="text-sm text-gray-500">Allow sending automated post-project surveys to their employees.</p>
                  </div>
                  <Switch
                    id="edit-surveys"
                    checked={editingCompany.enableEmployeeSurveys}
                    onCheckedChange={(checked) => setEditingCompany({...editingCompany, enableEmployeeSurveys: checked})}
                  />
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Company SMTP Settings</h4>
                  <p className="text-xs text-gray-500">Configure custom email server for sending notifications to this company's employees.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="smtp-host">Host</Label>
                      <Input
                        id="smtp-host"
                        placeholder="smtp.example.com"
                        value={editingCompany.smtpSettings?.host}
                        onChange={(e) => setEditingCompany({...editingCompany, smtpSettings: {...editingCompany.smtpSettings, host: e.target.value}})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="smtp-port">Port</Label>
                      <Input
                        id="smtp-port"
                        type="number"
                        placeholder="587"
                        value={editingCompany.smtpSettings?.port}
                        onChange={(e) => setEditingCompany({...editingCompany, smtpSettings: {...editingCompany.smtpSettings, port: Number(e.target.value)}})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="smtp-user">Username</Label>
                      <Input
                        id="smtp-user"
                        value={editingCompany.smtpSettings?.user}
                        onChange={(e) => setEditingCompany({...editingCompany, smtpSettings: {...editingCompany.smtpSettings, user: e.target.value}})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="smtp-pass">Password</Label>
                      <Input
                        id="smtp-pass"
                        type="password"
                        value={editingCompany.smtpSettings?.pass}
                        onChange={(e) => setEditingCompany({...editingCompany, smtpSettings: {...editingCompany.smtpSettings, pass: e.target.value}})}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      id="smtp-secure"
                      checked={editingCompany.smtpSettings?.secure}
                      onCheckedChange={(checked) => setEditingCompany({...editingCompany, smtpSettings: {...editingCompany.smtpSettings, secure: checked}})}
                    />
                    <Label htmlFor="smtp-secure">Use Secure Connection (TLS/SSL)</Label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={isEditSubmitting}>
              {isEditSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
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
