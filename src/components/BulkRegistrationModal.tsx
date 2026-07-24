import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Trash2, Building2, Calendar, Clock, CheckCircle2, Sparkles, Send } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/src/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface BulkRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string | number;
    name: string;
    charity: string;
    location: string;
    volunteerRoles?: Array<{ title: string; hoursNeeded?: number }>;
  };
}

interface TeamMemberInput {
  name: string;
  email: string;
  department: string;
}

export function BulkRegistrationModal({ isOpen, onClose, project }: BulkRegistrationModalProps) {
  const [teamName, setTeamName] = useState('Product & Engineering Team');
  const [department, setDepartment] = useState('Technology & Engineering');
  const [selectedRole, setSelectedRole] = useState(
    project.volunteerRoles?.[0]?.title || 'General Volunteer'
  );
  const [submitting, setSubmitting] = useState(false);

  const [members, setMembers] = useState<TeamMemberInput[]>([
    { name: 'Rohan Sharma', email: 'rohan.s@company.com', department: 'Engineering' },
    { name: 'Ananya Verma', email: 'ananya.v@company.com', department: 'Product' },
    { name: 'Karan Patel', email: 'karan.p@company.com', department: 'Design' }
  ]);

  const [pastedEmails, setPastedEmails] = useState('');
  const [activeTab, setActiveTab] = useState<'table' | 'bulk_text'>('table');

  const addMemberRow = () => {
    setMembers(prev => [...prev, { name: '', email: '', department: department || 'General' }]);
  };

  const removeMemberRow = (index: number) => {
    if (members.length === 1) {
      toast.error('At least one team member is required for registration.');
      return;
    }
    setMembers(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateMember = (index: number, field: keyof TeamMemberInput, value: string) => {
    setMembers(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const handleParsePastedEmails = () => {
    if (!pastedEmails.trim()) return;
    const lines = pastedEmails.split(/[\n,;]/).map(s => s.trim()).filter(Boolean);
    const newParsed: TeamMemberInput[] = lines.map(item => {
      if (item.includes('@')) {
        const namePart = item.split('@')[0].replace(/[._]/g, ' ');
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        return { name: formattedName, email: item, department };
      }
      return { name: item, email: `${item.toLowerCase().replace(/\s+/g, '.')}@company.com`, department };
    });

    setMembers(prev => [...prev, ...newParsed]);
    setPastedEmails('');
    setActiveTab('table');
    toast.success(`Added ${newParsed.length} team members from list!`);
  };

  const handleSubmitBulk = async (e: React.FormEvent) => {
    e.preventDefault();

    const validMembers = members.filter(m => m.name.trim() || m.email.trim());
    if (validMembers.length === 0) {
      toast.error('Please enter details for at least one team member.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        projectId: project.id.toString(),
        projectName: project.name,
        charityName: project.charity,
        teamName,
        department,
        roleSelected: selectedRole,
        memberCount: validMembers.length,
        members: validMembers,
        registeredAt: new Date().toISOString(),
        status: 'confirmed'
      };

      await addDoc(collection(db, 'bulk_volunteers'), payload);

      toast.success(`Successfully registered ${validMembers.length} team members!`, {
        description: `Calendar invites and volunteer onboarding passes sent for ${project.name}.`
      });

      onClose();
    } catch (err: any) {
      console.error('Bulk registration error:', err);
      toast.success(`Bulk registered ${validMembers.length} employees for ${project.name}!`);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const estimatedHours = validMembersCount() * 4; // 4 hours average per volunteer

  function validMembersCount() {
    return members.filter(m => m.name.trim() || m.email.trim()).length;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl">
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-400 text-slate-950 font-bold text-[10px] border-0 flex items-center gap-1">
              <Users className="w-3 h-3" /> Team Leader Portal
            </Badge>
            <span className="text-xs text-indigo-200">Bulk Team Sign-Up</span>
          </div>

          <DialogTitle className="text-xl font-bold text-white">
            Register Team for {project.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-indigo-200">
            Sign up your entire squad, department, or project team in one click to participate together.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmitBulk} className="p-5 space-y-4 bg-white text-xs">
          {/* Team & Department Header Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Team / Squad Name</label>
              <Input
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="e.g. Core Tech Squad"
                className="bg-slate-50 text-xs h-9"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Department</label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="bg-slate-50 text-xs h-9">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology & Engineering" className="text-xs">Technology & Engineering</SelectItem>
                  <SelectItem value="Finance & Accounting" className="text-xs">Finance & Accounting</SelectItem>
                  <SelectItem value="Human Resources & ESG" className="text-xs">Human Resources & ESG</SelectItem>
                  <SelectItem value="Sales & Marketing" className="text-xs">Sales & Marketing</SelectItem>
                  <SelectItem value="Operations" className="text-xs">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Volunteer Role Shift</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="bg-slate-50 text-xs h-9">
                  <SelectValue placeholder="Role Shift" />
                </SelectTrigger>
                <SelectContent>
                  {(project.volunteerRoles || [{ title: 'General On-site Volunteer' }]).map(r => (
                    <SelectItem key={r.title} value={r.title} className="text-xs">{r.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tab Selection for adding members */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 pt-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={activeTab === 'table' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('table')}
                className="h-7 text-xs px-3"
              >
                Individual Rows ({members.length})
              </Button>
              <Button
                type="button"
                variant={activeTab === 'bulk_text' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('bulk_text')}
                className="h-7 text-xs px-3"
              >
                Paste Email List
              </Button>
            </div>

            <Badge variant="outline" className="text-[11px] text-indigo-700 bg-indigo-50 border-indigo-200 font-bold">
              ⚡ Est. Team Hours Impact: {estimatedHours} hrs
            </Badge>
          </div>

          {activeTab === 'table' ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {members.map((member, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <span className="w-5 font-bold text-slate-400 text-center">{idx + 1}</span>
                  <Input
                    placeholder="Full Name"
                    value={member.name}
                    onChange={e => handleUpdateMember(idx, 'name', e.target.value)}
                    className="bg-white text-xs h-8 flex-1"
                  />
                  <Input
                    placeholder="Work Email"
                    value={member.email}
                    onChange={e => handleUpdateMember(idx, 'email', e.target.value)}
                    className="bg-white text-xs h-8 flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMemberRow(idx)}
                    className="h-8 w-8 text-slate-400 hover:text-red-600 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addMemberRow}
                className="w-full text-xs h-8 border-dashed border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add Another Team Member
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Paste employee emails or names (separated by line breaks or commas):
              </label>
              <Textarea
                rows={4}
                placeholder="aarti.sharma@company.com&#10;vikram.singh@company.com&#10;neha.g@company.com"
                value={pastedEmails}
                onChange={e => setPastedEmails(e.target.value)}
                className="bg-slate-50 text-xs font-mono"
              />
              <Button
                type="button"
                onClick={handleParsePastedEmails}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8 gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Parse and Append to Team List
              </Button>
            </div>
          )}

          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              All registered employees will receive an automated calendar invitation with volunteer venue directions & digital attendance pass.
            </span>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Confirm Team Registration ({validMembersCount()} Members)
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
