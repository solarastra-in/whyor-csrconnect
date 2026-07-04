import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/src/contexts/AuthContext';
import { db } from '@/src/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export function NgoSettings() {
  const { user } = useAuth();
  const [charityId, setCharityId] = useState<string | null>(null);
  const [paymentConfig, setPaymentConfig] = useState({
    bankDetails: '',
    upiDetails: '',
    paymentMode: 'direct' as 'direct' | 'portal' | 'split',
    platformFee: 0,
    splitPercentage: 0
  });

  useEffect(() => {
    import('@/src/lib/userRole').then(({ getUserRoleInfo }) => {
      getUserRoleInfo(user).then(info => {
        if (info.charity) {
          setCharityId(info.charity.id);
          if (info.charity.paymentConfig) {
            setPaymentConfig({
              bankDetails: info.charity.paymentConfig.bankDetails || '',
              upiDetails: info.charity.paymentConfig.upiDetails || '',
              paymentMode: info.charity.paymentConfig.paymentMode || 'direct',
              platformFee: info.charity.paymentConfig.platformFee || 0,
              splitPercentage: info.charity.paymentConfig.splitPercentage || 0
            });
          }
        }
      });
    });
  }, [user]);

  const handleSave = async () => {
    if (!charityId) return;
    try {
      await updateDoc(doc(db, 'charities', charityId), {
        paymentConfig
      });
      toast.success('Settings saved successfully');
    } catch (e) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payment & Settings</h1>
        <p className="text-gray-500 mt-1">Configure your receiving accounts and payment preferences.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Bank & UPI Details</CardTitle>
          <CardDescription>Where should companies send grants and donations?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Bank Account Details</Label>
            <Input 
              placeholder="Account Name, Number, IFSC" 
              value={paymentConfig.bankDetails} 
              onChange={e => setPaymentConfig({...paymentConfig, bankDetails: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <Label>UPI ID</Label>
            <Input 
              placeholder="ngo@upi" 
              value={paymentConfig.upiDetails} 
              onChange={e => setPaymentConfig({...paymentConfig, upiDetails: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <Label>Preferred Payment Routing</Label>
            <select 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={paymentConfig.paymentMode}
              onChange={e => setPaymentConfig({...paymentConfig, paymentMode: e.target.value as any})}
            >
              <option value="direct">Direct to NGO</option>
              <option value="portal">Through Portal</option>
              <option value="split">Split (Percentage based)</option>
            </select>
          </div>
          {paymentConfig.paymentMode === 'split' && (
            <div className="space-y-2">
              <Label>Split Percentage to NGO (%)</Label>
              <Input 
                type="number"
                placeholder="80" 
                value={paymentConfig.splitPercentage} 
                onChange={e => setPaymentConfig({...paymentConfig, splitPercentage: Number(e.target.value)})} 
              />
            </div>
          )}
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 mt-4">Save Configuration</Button>
        </CardContent>
      </Card>
    </div>
  );
}
