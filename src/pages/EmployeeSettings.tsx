import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Shield, User, X, Plus, Award } from 'lucide-react';
import { useVolunteer, AVAILABLE_BADGES } from '@/src/contexts/VolunteerContext';
import { toast } from 'sonner';

import { SkillGapAnalyzer } from '@/src/components/SkillGapAnalyzer';

export function EmployeeSettings() {
  const [activeTab, setActiveTab] = useState<'notifications' | 'profile' | 'privacy'>('profile');
  const [emailProjectRecs, setEmailProjectRecs] = useState(true);
  const [emailChallengeUpdates, setEmailChallengeUpdates] = useState(false);
  const [emailImpactReports, setEmailImpactReports] = useState(true);

  const { userSkills, setUserSkills, earnedBadges } = useVolunteer();
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim() && !userSkills.includes(newSkill.trim())) {
      setUserSkills([...userSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setUserSkills(userSkills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your notification preferences and profile details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-1">
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${activeTab === 'profile' ? 'text-blue-700 bg-blue-50 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('profile')}
          >
            <User className="mr-2 h-4 w-4" /> Profile
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${activeTab === 'notifications' ? 'text-blue-700 bg-blue-50 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className="mr-2 h-4 w-4" /> Notifications
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${activeTab === 'privacy' ? 'text-blue-700 bg-blue-50 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('privacy')}
          >
            <Shield className="mr-2 h-4 w-4" /> Privacy
          </Button>
        </div>

        <div className="md:col-span-2 space-y-6">
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <CardTitle>Email Notifications</CardTitle>
                </div>
                <CardDescription>Choose what updates you want to receive via email.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="deadline-alerts" className="flex flex-col space-y-1">
                    <span className="font-medium text-gray-900">Approaching Deadlines</span>
                    <span className="font-normal text-sm text-gray-500">Alerts when a project you saved or have skills for is nearing its sign-up deadline.</span>
                  </Label>
                  <Switch 
                    id="deadline-alerts" 
                    defaultChecked={true} 
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="project-recs" className="flex flex-col space-y-1">
                    <span className="font-medium text-gray-900">New Project Recommendations</span>
                    <span className="font-normal text-sm text-gray-500">Get notified when we find causes matching your interests.</span>
                  </Label>
                  <Switch 
                    id="project-recs" 
                    checked={emailProjectRecs} 
                    onCheckedChange={setEmailProjectRecs}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="challenge-updates" className="flex flex-col space-y-1">
                    <span className="font-medium text-gray-900">Challenge Updates</span>
                    <span className="font-normal text-sm text-gray-500">Updates on team challenges, leaderboards, and milestones.</span>
                  </Label>
                  <Switch 
                    id="challenge-updates" 
                    checked={emailChallengeUpdates} 
                    onCheckedChange={setEmailChallengeUpdates}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="impact-reports" className="flex flex-col space-y-1">
                    <span className="font-medium text-gray-900">Monthly Impact Reports</span>
                    <span className="font-normal text-sm text-gray-500">Receive a summary of your volunteer hours and matched donations.</span>
                  </Label>
                  <Switch 
                    id="impact-reports" 
                    checked={emailImpactReports} 
                    onCheckedChange={setEmailImpactReports}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <CardTitle>Skills & Certifications</CardTitle>
                  </div>
                  <CardDescription>Add your skills to find matching volunteer projects.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="e.g. Public Speaking, CPR, HTML/CSS..." 
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                      />
                      <Button type="button" onClick={handleAddSkill} variant="secondary">
                        <Plus className="h-4 w-4 mr-2" /> Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {userSkills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="px-3 py-1.5 text-sm font-medium flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100">
                          {skill}
                          <button onClick={() => handleRemoveSkill(skill)} className="hover:text-blue-900 rounded-full focus:outline-none">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {userSkills.length === 0 && (
                        <p className="text-sm text-gray-500 italic">No skills added yet.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <SkillGapAnalyzer />

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-gray-500" />
                    <CardTitle>Badges & Achievements</CardTitle>
                  </div>
                  <CardDescription>Digital badges you've earned through volunteering and impact.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {AVAILABLE_BADGES.map(badge => {
                      const isEarned = earnedBadges.includes(badge.id);
                      return (
                        <div key={badge.id} className={`p-4 rounded-lg border flex flex-col items-center text-center ${isEarned ? 'bg-white border-blue-100 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                          <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-3 ${isEarned ? 'bg-blue-50 text-blue-600' : 'bg-gray-200 text-gray-400 grayscale'}`}>
                            {badge.icon}
                          </div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">{badge.title}</h4>
                          <p className="text-xs text-gray-500">{badge.description}</p>
                          {!isEarned && <span className="mt-2 text-[10px] font-medium text-gray-400 uppercase tracking-wider">Locked</span>}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => toast('Changes discarded')}>Discard Changes</Button>
            <Button onClick={() => toast.success('Preferences saved!')}>Save Preferences</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
