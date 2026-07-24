import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Mail, Send, Calendar, Users, CheckCircle2, Building2, Sparkles, 
  Copy, Download, Clock, ShieldCheck, Heart, Award, ArrowRight,
  TrendingUp, Check, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export function WeeklyEmailDigestGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [recipientGroup, setRecipientGroup] = useState('company-admins@enterprise.com');
  const [adminNote, setAdminNote] = useState(
    'Team, exceptional impact this week! Thank you to our 18 new volunteer sign-ups and every employee who helped complete the Coastal Mangrove Restoration drive.'
  );
  const [isAutoScheduleEnabled, setIsAutoScheduleEnabled] = useState(true);
  const [deliveryDay, setDeliveryDay] = useState('Every Monday at 9:00 AM IST');
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const mockDigestData = {
    weekRange: 'July 18, 2026 – July 24, 2026',
    newVolunteersCount: 18,
    newVolunteersList: [
      { name: 'David Chen', role: 'Product Designer', dept: 'Design & UX' },
      { name: 'Sarah Jenkins', role: 'Senior Software Engineer', dept: 'Engineering' },
      { name: 'Marcus Vance', role: 'DevOps Lead', dept: 'Infrastructure' },
      { name: 'Ananya Sharma', role: 'CSR Program Lead', dept: 'Sustainability' },
      { name: 'Priya Patel', role: 'HR Manager', dept: 'People & Culture' },
    ],
    completedProjectsCount: 3,
    completedProjectsList: [
      { 
        title: 'Coastal Mangrove Restoration Drive', 
        ngo: 'Green Earth Foundation', 
        impact: '1,000 Mangrove Saplings Planted', 
        hours: 240, 
        volunteers: 45 
      },
      { 
        title: 'Blood Donation & Free Health Screening', 
        ngo: 'Red Cross Society', 
        impact: '120 Units Collected, 350 Health Checks', 
        hours: 180, 
        volunteers: 60 
      },
      { 
        title: 'Tech Skills Workshop for Youth', 
        ngo: 'Youth Tech Alliance', 
        impact: '80 High School Students Trained in Python', 
        hours: 110, 
        volunteers: 18 
      },
    ],
    totalHoursLoggedThisWeek: 530,
    fundsMatchedThisWeek: 215000,
    upcomingDrive: {
      title: 'Senior Citizen Digital Literacy Bootcamp',
      date: 'Saturday, July 26, 2026',
      spotsLeft: 8
    }
  };

  const handleSendDigestNow = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsOpen(false);
      toast.success(`Weekly Admin Digest sent to ${recipientGroup}!`, {
        description: 'Check inbox for the rich HTML executive summary.'
      });
    }, 1000);
  };

  const handleCopyMarkdown = () => {
    const mdContent = `
# 📧 CSR Weekly Admin Digest (${mockDigestData.weekRange})
**Recipients:** ${recipientGroup}

> "${adminNote}"

---
## 🚀 Weekly Impact Highlights
- **New Volunteers Registered:** ${mockDigestData.newVolunteersCount}
- **Volunteer Hours Logged:** ${mockDigestData.totalHoursLoggedThisWeek} hrs
- **Matching Funds Raised:** ₹${mockDigestData.fundsMatchedThisWeek.toLocaleString()}

## 🎉 Completed CSR Projects This Week
${mockDigestData.completedProjectsList.map(p => `- **${p.title}** (${p.ngo}): ${p.impact} | ${p.hours} hrs logged by ${p.volunteers} volunteers`).join('\n')}

## 🙋 New Volunteer Sign-ups
${mockDigestData.newVolunteersList.map(v => `- ${v.name} (${v.role} - ${v.dept})`).join('\n')}

## 📅 Featured Drive for Next Week
**${mockDigestData.upcomingDrive.title}**
Date: ${mockDigestData.upcomingDrive.date} | Spots Left: ${mockDigestData.upcomingDrive.spotsLeft}
    `.trim();

    navigator.clipboard.writeText(mdContent);
    setCopied(true);
    toast.success('Digest markdown copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Trigger Card for Company Dashboard */}
      <Card className="border border-indigo-200 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-md overflow-hidden relative">
        <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-400 text-slate-950 font-extrabold text-xs px-2.5 py-0.5 border-0 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> Executive Admin Digest
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px]">
                {isAutoScheduleEnabled ? 'Auto-Schedule Active' : 'Manual Trigger'}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Weekly CSR Email Digest Summary
            </h3>
            <p className="text-xs text-indigo-200/90 leading-relaxed">
              Auto-generates an executive summary of new volunteer sign-ups, completed CSR projects, and weekly impact metrics sent directly to company leadership and admins.
            </p>
            <div className="flex items-center gap-4 text-xs text-indigo-300 pt-1">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-300" /> +18 New Volunteers
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 3 Completed Projects
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-300" /> {deliveryDay}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={() => setIsOpen(true)}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs px-4 py-2 h-10 gap-2 shadow-sm"
            >
              <Mail className="w-4 h-4" /> Preview & Dispatch Digest
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal Dialog for Email Digest Preview & Dispatch */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-black">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-extrabold text-white">
                    Weekly CSR Executive Email Digest
                  </DialogTitle>
                  <DialogDescription className="text-xs text-indigo-200">
                    Review, customize, and dispatch this week's admin report ({mockDigestData.weekRange}).
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 overflow-y-auto space-y-6 bg-slate-50 flex-1">
            {/* Recipient & Schedule Controls */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Recipient Email / Group</Label>
                  <Input 
                    value={recipientGroup} 
                    onChange={(e) => setRecipientGroup(e.target.value)}
                    className="text-xs h-9"
                    placeholder="e.g. execs@company.com"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Schedule Delivery</Label>
                  <div className="flex items-center justify-between h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-700">{deliveryDay}</span>
                    <Switch 
                      checked={isAutoScheduleEnabled} 
                      onCheckedChange={setIsAutoScheduleEnabled} 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Admin Intro Note (Optional Header)</Label>
                <Textarea 
                  value={adminNote} 
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="text-xs h-16 resize-none"
                  placeholder="Custom note to company leadership..."
                />
              </div>
            </div>

            {/* Email Digest Live Preview Container */}
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
              <div className="bg-indigo-950 text-white p-4 flex items-center justify-between border-b border-indigo-900">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-sm tracking-tight">Enterprise CSR Weekly Executive Summary</span>
                </div>
                <Badge className="bg-indigo-800 text-indigo-200 text-[10px]">HTML Email Preview</Badge>
              </div>

              <div className="p-5 space-y-5 text-slate-800 text-xs leading-relaxed">
                {/* Admin Note Box */}
                {adminNote && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border-l-4 border-amber-400 text-slate-800 italic text-xs">
                    "{adminNote}"
                  </div>
                )}

                {/* Key Metrics Banner */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-100">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase block">New Volunteers</span>
                    <strong className="text-lg font-black text-slate-900">+{mockDigestData.newVolunteersCount} Pledged</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">Completed Drives</span>
                    <strong className="text-lg font-black text-slate-900">{mockDigestData.completedProjectsCount} Projects</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-100">
                    <span className="text-[10px] font-bold text-purple-700 uppercase block">Total Hours</span>
                    <strong className="text-lg font-black text-slate-900">{mockDigestData.totalHoursLoggedThisWeek} hrs</strong>
                  </div>
                </div>

                {/* Completed Projects Section */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5 border-b pb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed Projects This Week
                  </h4>
                  <div className="space-y-2">
                    {mockDigestData.completedProjectsList.map((proj, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3">
                        <div>
                          <h5 className="font-bold text-slate-900">{proj.title}</h5>
                          <p className="text-[11px] text-slate-500 mt-0.5">NGO Partner: {proj.ngo}</p>
                          <p className="text-[11px] font-semibold text-emerald-700 mt-1">Impact: {proj.impact}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge variant="outline" className="bg-white text-indigo-900 border-indigo-200 font-bold text-[10px]">
                            {proj.hours} hrs logged
                          </Badge>
                          <span className="block text-[10px] text-slate-400 mt-1">{proj.volunteers} volunteers</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Newly Joined Volunteers */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5 border-b pb-1">
                    <Users className="w-4 h-4 text-indigo-600" /> Featured New Volunteers
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {mockDigestData.newVolunteersList.map((vol, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          {vol.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <strong className="block text-slate-900 font-bold truncate">{vol.name}</strong>
                          <span className="text-[10px] text-slate-500 truncate block">{vol.role} · {vol.dept}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Spotlight */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider block">Upcoming Next Week</span>
                    <strong className="text-xs font-bold text-white block mt-0.5">{mockDigestData.upcomingDrive.title}</strong>
                    <span className="text-[10px] text-indigo-200">{mockDigestData.upcomingDrive.date}</span>
                  </div>
                  <Badge className="bg-amber-400 text-slate-950 font-extrabold text-[10px] shrink-0">
                    {mockDigestData.upcomingDrive.spotsLeft} Spots Open
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 bg-white border-t border-slate-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyMarkdown}
              className="text-xs gap-1.5 w-full sm:w-auto"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Content!' : 'Copy Email Markdown'}
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="text-xs"
              >
                Close
              </Button>

              <Button
                type="button"
                onClick={handleSendDigestNow}
                disabled={isSending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 w-full sm:w-auto"
              >
                {isSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {isSending ? 'Sending Digest...' : 'Dispatch Email Digest Now'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
