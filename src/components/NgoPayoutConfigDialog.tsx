import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings, Loader2 } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export function NgoPayoutConfigDialog() {
  const [open, setOpen] = useState(false);
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState<string>('');
  const [platformFee, setPlatformFee] = useState<string>('0');
  const [splitPercentage, setSplitPercentage] = useState<string>('100');
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (open) fetchCharities();
  }, [open]);

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'charities'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCharities(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentsForCharity = async (charityId: string, charityName: string) => {
    try {
      const snap = await getDocs(collection(db, 'payments'));
      const allPayments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const filtered = allPayments.filter((p: any) => 
        p.charityId === charityId || 
        p.ngoId === charityId || 
        p.ngoName === charityName
      );
      setPayments(filtered);
    } catch (err) {
      console.error("Error fetching charity payments:", err);
    }
  };

  const handleSelectCharity = (id: string) => {
    const charity = charities.find(c => c.id === id);
    if (charity) {
      setSelectedCharity(id);
      setPlatformFee(charity.paymentConfig?.platformFee?.toString() || '0');
      setSplitPercentage(charity.paymentConfig?.splitPercentage?.toString() || '100');
      fetchPaymentsForCharity(id, charity.name);
    } else {
      setSelectedCharity('');
      setPayments([]);
    }
  };

  const getProjections = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const completedRecent = payments.filter((p: any) => {
      const isCompleted = p.status === 'completed';
      const paymentDate = p.date ? new Date(p.date) : new Date();
      return isCompleted && paymentDate >= thirtyDaysAgo;
    });
    
    let grossMonthly = completedRecent.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const isBaseline = grossMonthly === 0;
    if (isBaseline) {
      grossMonthly = 100000; // default ₹100k baseline
    }
    
    const feePercent = Number(platformFee) || 0;
    const splitPercent = Number(splitPercentage) || 0;
    
    const routedViaPlatform = grossMonthly * (splitPercent / 100);
    const routedDirect = grossMonthly * (1 - splitPercent / 100);
    
    const feeDeducted = routedViaPlatform * (feePercent / 100);
    const netPayout = routedDirect + (routedViaPlatform - feeDeducted);
    
    return {
      grossMonthly,
      routedViaPlatform,
      routedDirect,
      feeDeducted,
      netPayout,
      isBaseline
    };
  };

  const projections = selectedCharity ? getProjections() : null;

  const handleSave = async () => {
    if (!selectedCharity) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'charities', selectedCharity), {
        'paymentConfig.platformFee': Number(platformFee),
        'paymentConfig.splitPercentage': Number(splitPercentage)
      });
      toast.success("Payout configuration updated");
      setOpen(false);
    } catch (e) {
      toast.error("Failed to update config");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="w-4 h-4" /> NGO Payout Config
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>NGO Payout Configuration</DialogTitle>
          <DialogDescription>
            Configure platform fees and default split percentages per NGO.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : (
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Select NGO</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                value={selectedCharity}
                onChange={(e) => handleSelectCharity(e.target.value)}
              >
                <option value="">-- Select NGO --</option>
                {charities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            {selectedCharity && (
              <>
                <div>
                  <label className="text-sm font-medium">Platform Fee (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                    value={platformFee}
                    onChange={(e) => setPlatformFee(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Percentage deducted from payments routed via portal.</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Default Split to Portal (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                    value={splitPercentage}
                    onChange={(e) => setSplitPercentage(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">For split routing mode, what percentage is processed via the portal?</p>
                </div>

                {/* Projected Monthly Payouts Summary Widget */}
                {projections && (
                  <div className="mt-4 p-4 rounded-lg bg-indigo-50/70 border border-indigo-100 space-y-3">
                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                      Projected Monthly Payout Preview
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-2.5 rounded-lg border border-indigo-100/60 shadow-xs">
                        <span className="block text-[10px] text-gray-500 font-medium">Est. Gross Monthly</span>
                        <span className="text-sm font-bold text-gray-900">₹{projections.grossMonthly.toLocaleString()}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-indigo-100/60 shadow-xs">
                        <span className="block text-[10px] text-indigo-600 font-bold">Projected Payout</span>
                        <span className="text-sm font-bold text-indigo-700">₹{Math.round(projections.netPayout).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Portal Share (Split {splitPercentage}%):</span>
                        <span className="font-mono text-gray-900">₹{Math.round(projections.routedViaPlatform).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Direct Share:</span>
                        <span className="font-mono text-gray-900">₹{Math.round(projections.routedDirect).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-medium text-red-600">
                        <span>Platform Fee ({platformFee}%):</span>
                        <span className="font-mono">-₹{Math.round(projections.feeDeducted).toLocaleString()}</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-indigo-500 leading-relaxed italic pt-1 border-t border-indigo-100/30">
                      {projections.isBaseline 
                        ? "*Based on a standard ₹100,000 baseline donation volume (no actual transactions in last 30 days)."
                        : `*Based on ₹${projections.grossMonthly.toLocaleString()} of actual transaction volume in the last 30 days.`
                      }
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!selectedCharity || saving} className="bg-indigo-600 hover:bg-indigo-700">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
