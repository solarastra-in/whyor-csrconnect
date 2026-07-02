import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export function CompanyCampaigns() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Matching & Campaigns</h1>
          <p className="text-gray-500 mt-1">Manage donation matching rules and special giving campaigns.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => toast.success('New Campaign dialog would open here')}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-indigo-100">
          <CardHeader className="bg-indigo-50/50 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 mb-2">Default Rule</Badge>
                <CardTitle className="text-lg">Standard Annual Matching</CardTitle>
                <CardDescription>Applies to all verified charities on the platform.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast('Edit Rule dialog would open here')}>Edit Rule</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Match Ratio</p>
                <p className="text-xl font-bold mt-1">1:1</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Employee Limit</p>
                <p className="text-xl font-bold mt-1">₹50,000 / year</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Budget Consumed</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xl font-bold">24%</p>
                  <p className="text-xs text-gray-400">(₹12L of ₹50L)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 mb-2">Active Campaign</Badge>
                <CardTitle className="text-lg">Disaster Relief: Kerala Floods</CardTitle>
                <CardDescription>Special boosted matching for affected regions.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast('Manage Campaign dialog would open here')}>Manage</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Match Ratio</p>
                <p className="text-xl font-bold mt-1 text-green-600">2:1 Boosted</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Timeframe</p>
                <p className="text-xl font-bold mt-1">Aug 1 - Aug 31</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Funds Raised</p>
                <p className="text-xl font-bold mt-1">₹4.5L Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
