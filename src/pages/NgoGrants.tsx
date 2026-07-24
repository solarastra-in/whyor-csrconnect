import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Search, DollarSign, Building2, CheckCircle2, Clock, XCircle, AlertCircle, Send, Landmark } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { db } from '@/src/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { getUserRoleInfo, UserRoleInfo } from '@/src/lib/userRole';
import { toast } from 'sonner';

interface GrantApplication {
  id?: string;
  title: string;
  ngoId: string;
  ngoName: string;
  companyId?: string;
  companyName?: string;
  amountRequested: number;
  sdgCategory: string;
  summary: string;
  outcomes: string;
  status: 'pending_review' | 'approved' | 'rejected';
  createdAt?: any;
  feedback?: string;
}

export function NgoGrants() {
  const { user } = useAuth();
  const [roleInfo, setRoleInfo] = useState<UserRoleInfo | null>(null);
  const [grants, setGrants] = useState<GrantApplication[]>([]);
  const [companiesList, setCompaniesList] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [targetCompanyId, setTargetCompanyId] = useState('all');
  const [amountRequested, setAmountRequested] = useState('250000');
  const [sdgCategory, setSdgCategory] = useState('Education & Youth Empowerment');
  const [summary, setSummary] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      getUserRoleInfo(user).then(info => {
        setRoleInfo(info);
        if (info.charity?.id) {
          fetchGrants(info.charity.id);
        } else {
          setLoading(false);
        }
      });
      fetchCompanies();
    }
  }, [user]);

  const fetchCompanies = async () => {
    try {
      const snap = await getDocs(collection(db, 'companies'));
      const list = snap.docs.map(d => ({ id: d.id, name: d.data().name || 'Corporate Partner' }));
      setCompaniesList(list);
    } catch (e) {
      console.error('Error fetching companies:', e);
    }
  };

  const fetchGrants = async (charityId: string) => {
    setLoading(true);
    try {
      const q = query(collection(db, 'grants'), where('ngoId', '==', charityId));
      const snap = await getDocs(q);
      const list: GrantApplication[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as GrantApplication));
      setGrants(list);
    } catch (e) {
      console.error('Error fetching NGO grants:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleInfo?.charity?.id) {
      toast.error('NGO details missing. Please complete NGO verification first.');
      return;
    }

    if (!title.trim() || !summary.trim()) {
      toast.error('Please complete required grant proposal fields.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedCompany = companiesList.find(c => c.id === targetCompanyId);

      const grantData = {
        title: title.trim(),
        ngoId: roleInfo.charity.id,
        ngoName: roleInfo.charity.name,
        companyId: targetCompanyId === 'all' ? 'general_pool' : targetCompanyId,
        companyName: selectedCompany ? selectedCompany.name : 'Open Corporate Pool',
        amountRequested: parseFloat(amountRequested) || 100000,
        sdgCategory,
        summary: summary.trim(),
        outcomes: outcomes.trim(),
        status: 'pending_review',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'grants'), grantData);
      toast.success('Grant Application submitted successfully!', {
        description: 'Corporate CSR committees can now review your proposal for grant allocation.'
      });

      setGrants(prev => [{ id: docRef.id, ...grantData } as GrantApplication, ...prev]);
      setIsOpen(false);
      resetForm();
    } catch (e: any) {
      toast.error('Failed to submit grant application: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setTargetCompanyId('all');
    setAmountRequested('250000');
    setSdgCategory('Education & Youth Empowerment');
    setSummary('');
    setOutcomes('');
  };

  const totalRequested = grants.reduce((sum, g) => sum + (g.amountRequested || 0), 0);
  const totalApproved = grants.filter(g => g.status === 'approved').reduce((sum, g) => sum + (g.amountRequested || 0), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-indigo-600" />
            CSR Grant Applications
          </h1>
          <p className="text-gray-500 mt-1">
            Submit grant proposals to corporate partner funds and track funding approvals & disbursement.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Apply For Grant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Submit CSR Grant Application</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmitGrant} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase">Grant Project / Proposal Title *</label>
                <Input
                  placeholder="e.g. Rural Clean Drinking Water & Solar Well Installation"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase">Target Corporate Partner</label>
                  <Select value={targetCompanyId} onValueChange={setTargetCompanyId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Corporate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Open Corporate Pool (All Companies)</SelectItem>
                      {companiesList.map(comp => (
                        <SelectItem key={comp.id} value={comp.id}>{comp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase">Amount Requested (₹) *</label>
                  <Input
                    type="number"
                    value={amountRequested}
                    onChange={e => setAmountRequested(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase">Focus Area / SDG</label>
                <Select value={sdgCategory} onValueChange={setSdgCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Education & Youth Empowerment">Education & Youth Empowerment</SelectItem>
                    <SelectItem value="Clean Water & Sanitation (SDG 6)">Clean Water & Sanitation (SDG 6)</SelectItem>
                    <SelectItem value="Environmental Conservation (SDG 13)">Environmental Conservation (SDG 13)</SelectItem>
                    <SelectItem value="Healthcare Infrastructure">Healthcare Infrastructure</SelectItem>
                    <SelectItem value="Livelihood & Women Empowerment">Livelihood & Women Empowerment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase">Executive Summary & Purpose *</label>
                <Textarea
                  placeholder="Describe the problem, target community beneficiaries, execution strategy, and grant budget allocation..."
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  rows={4}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase">Target Measurable Outcomes</label>
                <Textarea
                  placeholder="e.g. 5,000 villagers given access to clean water, 20 solar wells constructed within 6 months"
                  value={outcomes}
                  onChange={e => setOutcomes(e.target.value)}
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                <Landmark className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Disbursements will be routed to your verified NGO 80G bank account set up under NGO Settings.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                  {submitting ? 'Submitting...' : 'Submit Proposal'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Applications</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{grants.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase">Requested Funding</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">₹{totalRequested.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase">Approved Funding</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">₹{totalApproved.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Grants Table / Cards */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading grant applications...</div>
      ) : grants.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-2">
          <CardContent className="space-y-3">
            <FileText className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-800 text-lg">No Grant Proposals Submitted</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Submit grant applications to corporate partners to secure CSR capital for your organization's social impact programs.
            </p>
            <Button onClick={() => setIsOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="w-4 h-4 mr-1" /> Apply for First Grant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {grants.map(grant => (
            <Card key={grant.id} className="p-5 border hover:border-indigo-200 transition-colors bg-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 font-medium text-xs">
                      {grant.sdgCategory}
                    </Badge>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" /> {grant.companyName || 'Corporate Partner'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">{grant.title}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2 max-w-3xl">{grant.summary}</p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 min-w-[180px]">
                  <span className="text-xl font-extrabold text-gray-900">
                    ₹{grant.amountRequested?.toLocaleString()}
                  </span>

                  {grant.status === 'approved' && (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved & Disbursed
                    </Badge>
                  )}
                  {grant.status === 'pending_review' && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300 gap-1">
                      <Clock className="w-3 h-3 text-amber-600" /> Pending Review
                    </Badge>
                  )}
                  {grant.status === 'rejected' && (
                    <Badge className="bg-rose-100 text-rose-800 border-rose-300 gap-1">
                      <XCircle className="w-3 h-3 text-rose-600" /> Proposal Declined
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
