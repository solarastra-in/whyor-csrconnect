import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Award, Star, TrendingUp, Trophy, Target, ArrowUpRight, Heart, Share2, MessageSquare, Send, IndianRupee, Medal, MessageSquareQuote } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useAuth } from '@/src/contexts/AuthContext';
import { useVolunteer } from '@/src/contexts/VolunteerContext';
import { collection, getDocs, doc, setDoc, addDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { PersonalCSRGoal } from '@/src/components/PersonalCSRGoal';
import { EmployeeGamificationBadges } from '@/src/components/EmployeeGamificationBadges';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const donationHistory = [
  { id: 1, date: '2024-08-15', charity: 'Jal Foundation', project: 'Clean Ganga', amount: 5000, match: 5000, status: 'Completed' },
  { id: 2, date: '2024-07-22', charity: 'Vidya Trust', project: 'Digital Skills', amount: 3000, match: 3000, status: 'Completed' },
  { id: 3, date: '2024-06-10', charity: 'Green Future', project: 'Tree Plantation', amount: 2000, match: 2000, status: 'Completed' },
];

const initialTestimonials = [
  {
    id: 1,
    project: 'Clean Ganga Initiative',
    text: "Cleaning the riverbanks was an eye-opening experience. It's amazing how much difference a few hours of collective effort can make. Looking forward to the next session!",
    date: '2024-08-16',
  },
  {
    id: 2,
    project: 'Digital Skills for Youth',
    text: "Teaching basic coding skills to these bright students reminded me why I got into tech in the first place. Very rewarding.",
    date: '2024-07-25',
  }
];

export function MyImpact() {
  const { totalHours } = useVolunteer();
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [newReflection, setNewReflection] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  const handleShareReflection = () => {
    if (!newReflection.trim() || !selectedProject) return;
    
    const newEntry = {
      id: Date.now(),
      project: selectedProject,
      text: newReflection,
      date: new Date().toISOString().split('T')[0]
    };
    
    setTestimonials([newEntry, ...testimonials]);
    setNewReflection("");
    setSelectedProject("");
    toast.success('Reflection shared successfully!');
  };

  const handleDownloadTaxReceipt = () => {
    // Generate a simple text blob simulating a receipt
    const receiptText = `
TAX RECEIPT - 80G COMPLIANT
--------------------------------
Name: ${user?.displayName || 'Volunteer'}
Email: ${user?.email || 'N/A'}
Date: ${new Date().toLocaleDateString()}

Total Donations This Year: ₹12,500
Eligible for Tax Deduction under Section 80G.

This is a computer-generated receipt.
    `;
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tax_Receipt_${new Date().getFullYear()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Tax receipt downloaded successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Impact</h1>
        <p className="text-gray-500 mt-1">Review your personal contribution history and generated impact.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Donated</p>
                <div className="text-3xl font-bold text-blue-700 mt-1">₹10,000</div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <IndianRupee className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Company Match</p>
                <div className="text-3xl font-bold text-green-700 mt-1">₹10,000</div>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Volunteer Hours</p>
                <div className="text-3xl font-bold text-purple-700 mt-1">{totalHours}</div>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PersonalCSRGoal currentHours={totalHours} currentDonations={10000} />
      
      <EmployeeGamificationBadges />

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquareQuote className="h-5 w-5 text-gray-500" />
          My Volunteer Reflections
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-dashed border-2 bg-gray-50 flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-gray-800">Share Your Experience</CardTitle>
              <CardDescription>Inspire others by reflecting on your recent volunteer work.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a completed project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Clean Ganga Initiative">Clean Ganga Initiative</SelectItem>
                  <SelectItem value="Digital Skills for Youth">Digital Skills for Youth</SelectItem>
                  <SelectItem value="Tree Plantation">Tree Plantation</SelectItem>
                </SelectContent>
              </Select>
              <Textarea 
                placeholder="Write a short story or reflection about your experience..." 
                className="resize-none h-24 bg-white"
                value={newReflection}
                onChange={(e) => setNewReflection(e.target.value)}
              />
              <Button 
                className="w-full" 
                disabled={!newReflection.trim() || !selectedProject}
                onClick={handleShareReflection}
              >
                <Send className="w-4 h-4 mr-2" /> Share Reflection
              </Button>
            </CardContent>
          </Card>
          
          <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
            {testimonials.map(t => (
              <Card key={t.id} className="relative bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex gap-4">
                  <div className="shrink-0 mt-1">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'ME'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="space-y-1 w-full">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-gray-900">{t.project}</h4>
                      <span className="text-xs text-gray-400 font-medium">{t.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed italic border-l-2 border-gray-200 pl-3 mt-2 py-1">
                      "{t.text}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Donation History</CardTitle>
            <button onClick={handleDownloadTaxReceipt} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
              Download Tax Receipt <ArrowUpRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Charity</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Your Donation</TableHead>
                <TableHead className="text-right">Company Match</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donationHistory.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.date}</TableCell>
                  <TableCell>{row.charity}</TableCell>
                  <TableCell>{row.project}</TableCell>
                  <TableCell className="text-right font-medium">₹{row.amount}</TableCell>
                  <TableCell className="text-right text-green-600">₹{row.match}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-50 text-green-700">{row.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
