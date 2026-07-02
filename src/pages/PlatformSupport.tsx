import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export function PlatformSupport() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Support Tickets</h1>
          <p className="text-gray-500">Manage inquiries from charities, companies, and employees.</p>
        </div>
      </div>
      
      <Tabs defaultValue="open" className="w-full">
        <TabsList>
          <TabsTrigger value="open">Open Tickets</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>
        
        <TabsContent value="open" className="mt-6 space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 font-medium">Ticket ID</th>
                      <th className="px-6 py-4 font-medium">Requester</th>
                      <th className="px-6 py-4 font-medium">Issue</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">#TKT-892</td>
                      <td className="px-6 py-4">Green Future NGO<br/><span className="text-xs text-gray-500">contact@greenfuture.org</span></td>
                      <td className="px-6 py-4">Need help updating FCRA certificate</td>
                      <td className="px-6 py-4"><Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200"><Clock className="w-3 h-3 mr-1"/> Open</Badge></td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="outline" onClick={() => toast('Reply dialog would open here')}>Reply</Button>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">#TKT-891</td>
                      <td className="px-6 py-4">Acme Corp<br/><span className="text-xs text-gray-500">admin@acme.com</span></td>
                      <td className="px-6 py-4">Cannot configure SAML SSO</td>
                      <td className="px-6 py-4"><Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200"><Clock className="w-3 h-3 mr-1"/> Open</Badge></td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="outline" onClick={() => toast('Reply dialog would open here')}>Reply</Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resolved" className="mt-6 space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 font-medium">Ticket ID</th>
                      <th className="px-6 py-4 font-medium">Requester</th>
                      <th className="px-6 py-4 font-medium">Issue</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-500">#TKT-880</td>
                      <td className="px-6 py-4 text-gray-500">John Doe<br/><span className="text-xs text-gray-400">john@acme.com</span></td>
                      <td className="px-6 py-4 text-gray-500">Missed logging hours for last week</td>
                      <td className="px-6 py-4"><Badge variant="outline" className="text-green-700 bg-green-50 border-green-200"><CheckCircle className="w-3 h-3 mr-1"/> Resolved</Badge></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
