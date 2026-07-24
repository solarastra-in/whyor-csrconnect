import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Award, Star, TrendingUp, Trophy, Target, ArrowUpRight, Heart, Share2, MessageSquare, Send, IndianRupee, Medal, MessageSquareQuote } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';
import { useAuth } from '@/src/contexts/AuthContext';
import { useVolunteer } from '@/src/contexts/VolunteerContext';
import { collection, getDocs, doc, setDoc, addDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { PersonalCSRGoal } from '@/src/components/PersonalCSRGoal';
import { BadgesAndMilestonesSection } from '@/src/components/BadgesAndMilestonesSection';
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

const monthlyHoursData = [
  { month: 'Feb 2026', hours: 4, companyAvg: 3 },
  { month: 'Mar 2026', hours: 6, companyAvg: 4 },
  { month: 'Apr 2026', hours: 8, companyAvg: 5 },
  { month: 'May 2026', hours: 5, companyAvg: 5 },
  { month: 'Jun 2026', hours: 10, companyAvg: 6 },
  { month: 'Jul 2026', hours: 12, companyAvg: 7 },
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
    const year = new Date().getFullYear();
    const receiptHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Section 80G Tax Exemption Certificate - ${year}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.6; }
    .header { border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 24px; font-weight: bold; color: #4f46e5; margin: 0; }
    .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
    .badge { background: #e0e7ff; color: #3730a3; padding: 6px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; }
    .value { font-size: 15px; font-weight: 600; color: #0f172a; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #f1f5f9; text-align: left; padding: 12px; font-size: 12px; color: #475569; text-transform: uppercase; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .total-row { font-weight: bold; background: #f8fafc; }
    .footer { border-top: 1px solid #e2e8f0; pt: 20px; margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center; }
    .stamp { border: 2px dashed #4f46e5; color: #4f46e5; display: inline-block; padding: 10px 20px; font-weight: bold; font-size: 12px; text-transform: uppercase; border-radius: 6px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">OFFICIAL TAX DEDUCTION CERTIFICATE</h1>
      <p class="subtitle">Issued under Section 80G of the Income Tax Act | Global CSR Connect Platform</p>
    </div>
    <div class="badge">SECTION 80G VERIFIED</div>
  </div>

  <div class="info-grid">
    <div>
      <div class="label">Donor Name</div>
      <div class="value">${user?.displayName || 'Valued Donor'}</div>
    </div>
    <div>
      <div class="label">Donor Email</div>
      <div class="value">${user?.email || 'N/A'}</div>
    </div>
    <div>
      <div class="label">80G Reg. Number</div>
      <div class="value">AAATC80G2026102</div>
    </div>
    <div>
      <div class="label">Assessment Year</div>
      <div class="value">${year} - ${year + 1}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Receipt No.</th>
        <th>NGO / Partner Entity</th>
        <th>Category</th>
        <th>Tax Deduction</th>
        <th>Amount (INR)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>REC-CSR-${year}-8801</td>
        <td>Verified CSR NGO Partner</td>
        <td>Education & Youth Opportunity</td>
        <td>100% Eligible (Sec 80G)</td>
        <td>₹12,500.00</td>
      </tr>
      <tr class="total-row">
        <td colspan="4" style="text-align: right;">Total Tax-Deductible Contribution:</td>
        <td>₹12,500.00</td>
      </tr>
    </tbody>
  </table>

  <p style="font-size: 13px; color: #475569;">
    This receipt certifies that the donation specified above has been received and processed through the verified CSR Gateway. Under Section 80G of the Income Tax Act, 50%-100% of this contribution is eligible for deduction from taxable income.
  </p>

  <div style="text-align: right;">
    <div class="stamp">CSR CONNECT VERIFIED DISBURSEMENT STAMP</div>
  </div>

  <div class="footer">
    <p>Computer-generated official tax document. Valid without physical signature when verified against platform audit trail ID: <code>${Math.random().toString(36).substring(2, 10).toUpperCase()}</code>.</p>
  </div>
</body>
</html>`;

    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tax_Exemption_Certificate_80G_${year}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Official Section 80G Tax Exemption Certificate downloaded');
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
      
      {/* 6-Month Volunteer Hours Progression Trend Chart */}
      <Card className="border-indigo-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/30 border-b border-indigo-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 flex items-center gap-1 font-semibold text-[11px]">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-600" /> Data-Driven Impact
                </Badge>
                <span className="text-xs text-gray-500 font-medium">Last 6 Months (Feb - Jul 2026)</span>
              </div>
              <CardTitle className="text-lg font-bold text-gray-900">
                Volunteer Hours Progression & Trend
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">
                Track your monthly active volunteer hours logged against company benchmark averages.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-gray-100 shadow-xs">
              <div className="text-right">
                <span className="text-[10px] text-gray-400 font-medium block uppercase tracking-wider">Avg Monthly</span>
                <span className="text-base font-bold text-purple-700">7.5 hrs/mo</span>
              </div>
              <div className="h-7 w-px bg-gray-200" />
              <div className="text-right">
                <span className="text-[10px] text-gray-400 font-medium block uppercase tracking-wider">Growth Rate</span>
                <span className="text-base font-bold text-emerald-600">+200% 🚀</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyHoursData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} unit=" hrs" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
                  itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                  labelStyle={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}
                  formatter={(value: any, name: any) => [
                    `${value} hours`, 
                    name === 'hours' ? 'Your Volunteer Hours' : 'Company Employee Avg'
                  ]}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  formatter={(value) => (
                    <span className="text-xs font-medium text-slate-700 mr-4">
                      {value === 'hours' ? 'Your Hours' : 'Company Peer Avg'}
                    </span>
                  )}
                />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorHours)" 
                  dot={{ r: 5, fill: '#8b5cf6', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="companyAvg" 
                  stroke="#06b6d4" 
                  strokeWidth={2} 
                  strokeDasharray="4 4" 
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100 text-center">
            <div className="p-2.5 rounded-lg bg-purple-50/50 border border-purple-100">
              <span className="text-[11px] font-medium text-purple-700 block">Peak Month</span>
              <span className="text-sm font-bold text-gray-900">July 2026 (12 hrs)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
              <span className="text-[11px] font-medium text-emerald-700 block">Total 6-Mo Hours</span>
              <span className="text-sm font-bold text-gray-900">45 Volunteer Hrs</span>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100">
              <span className="text-[11px] font-medium text-blue-700 block">VS Company Avg</span>
              <span className="text-sm font-bold text-gray-900">+14 hrs Above Peer Avg</span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-100">
              <span className="text-[11px] font-medium text-amber-700 block">Consistency Score</span>
              <span className="text-sm font-bold text-gray-900">6/6 Months Active 🏅</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <BadgesAndMilestonesSection />

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
