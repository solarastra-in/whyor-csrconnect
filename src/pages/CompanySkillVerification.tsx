import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, FileCheck, ExternalLink, Clock } from 'lucide-react';

const mockPendingVerifications = [
  {
    id: 1,
    employeeName: 'Sarah Jenkins',
    department: 'Engineering',
    skill: 'First Aid / CPR',
    submittedAt: '2026-06-28',
    status: 'pending',
    proofUrl: '#',
    notes: 'Completed American Red Cross certification'
  },
  {
    id: 2,
    employeeName: 'David Chen',
    department: 'Design',
    skill: 'Sign Language',
    submittedAt: '2026-06-29',
    status: 'pending',
    proofUrl: '#',
    notes: 'ASL Level 2 certification'
  },
  {
    id: 3,
    employeeName: 'Priya Patel',
    department: 'Marketing',
    skill: 'Disaster Relief Training',
    submittedAt: '2026-06-30',
    status: 'pending',
    proofUrl: '#',
    notes: 'FEMA ICS-100 completion certificate'
  }
];

export function CompanySkillVerification() {
  const [verifications, setVerifications] = useState(mockPendingVerifications);

  const handleVerify = (id: number, employeeName: string, skill: string) => {
    setVerifications(prev => prev.filter(v => v.id !== id));
    toast.success(`Skill Verified`, {
      description: `${skill} has been verified for ${employeeName}.`
    });
  };

  const handleReject = (id: number, employeeName: string) => {
    setVerifications(prev => prev.filter(v => v.id !== id));
    toast.error(`Verification Rejected`, {
      description: `Rejected skill verification for ${employeeName}.`
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Skill Verification</h1>
        <p className="text-gray-500 mt-2">
          Review and verify employee-uploaded skills and certifications to build trust in the skill-matching system.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-indigo-600" />
            <CardTitle>Pending Verifications</CardTitle>
          </div>
          <CardDescription>
            {verifications.length} skills pending review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verifications.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
              <p className="text-gray-500 mt-1">There are no pending skill verifications at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {verifications.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{item.employeeName}</h4>
                      <Badge variant="outline" className="text-xs text-gray-500">{item.department}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">{item.skill}</Badge>
                      <span className="text-xs text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Submitted {item.submittedAt}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-gray-600 mb-2 italic">"{item.notes}"</p>
                    )}
                    <a href={item.proofUrl} onClick={e => e.preventDefault()} className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Certificate/Proof
                    </a>
                  </div>
                  
                  <div className="flex gap-2 mt-4 sm:mt-0 sm:ml-4">
                    <Button 
                      variant="outline" 
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleReject(item.id, item.employeeName)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleVerify(item.id, item.employeeName, item.skill)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Verify
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
