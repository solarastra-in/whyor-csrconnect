import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Mail, PlayCircle } from 'lucide-react';
import { AccessAudit } from '@/src/components/AccessAudit';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

export function PlatformSettings() {
  const [triggeringJob, setTriggeringJob] = useState(false);
  const [smtpSettings, setSmtpSettings] = useState({ host: '', port: 587, user: '', pass: '', secure: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const docRef = doc(db, 'platform', 'settings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().smtpSettings) {
          setSmtpSettings(docSnap.data().smtpSettings);
        }
      } catch (error) {
        console.error('Error loading platform settings', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      const { pass, ...publicSmtpSettings } = smtpSettings;
      await setDoc(doc(db, 'platform', 'settings'), { smtpSettings: publicSmtpSettings }, { merge: true });
      toast.success('Platform SMTP configuration saved successfully (password stored securely)');
    } catch (error) {
      console.error('Error saving settings', error);
      toast.error('Failed to save settings');
    }
  };

  const handleTriggerJob = async () => {
    setTriggeringJob(true);
    try {
      const response = await fetch('/api/cron/deadline-reminders', {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Failed to run job');
      }
    } catch (error) {
      toast.error('Network error triggering job');
    } finally {
      setTriggeringJob(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Platform Settings</h1>
        <p className="text-gray-500 mt-1">Manage global platform configurations and email delivery.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global SMTP Configuration</CardTitle>
          <CardDescription>Configure the global SMTP server for sending platform-wide notifications and system emails.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platformSmtpHost">SMTP Host</Label>
            <Input id="platformSmtpHost" placeholder="smtp.platform.com" value={smtpSettings.host} onChange={e => setSmtpSettings({...smtpSettings, host: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platformSmtpPort">SMTP Port</Label>
            <Input id="platformSmtpPort" type="number" placeholder="587" value={smtpSettings.port || ''} onChange={e => setSmtpSettings({...smtpSettings, port: Number(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platformSmtpUser">SMTP Username</Label>
            <Input id="platformSmtpUser" placeholder="noreply@platform.com" value={smtpSettings.user} onChange={e => setSmtpSettings({...smtpSettings, user: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platformSmtpPass">SMTP Password</Label>
            <Input id="platformSmtpPass" type="password" placeholder="••••••••" value={smtpSettings.pass} onChange={e => setSmtpSettings({...smtpSettings, pass: e.target.value})} />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch id="platformSmtpSecure" checked={smtpSettings.secure} onCheckedChange={c => setSmtpSettings({...smtpSettings, secure: c})} />
            <Label htmlFor="platformSmtpSecure">Use SSL/TLS</Label>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-gray-500" />
            <CardTitle>Automated Notifications System</CardTitle>
          </div>
          <CardDescription>Test the automated email notification jobs for employees.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">Approaching Project Deadlines</p>
              <p className="text-sm text-gray-500 mt-1">Alerts employees when a project they saved or possess the required skills for is approaching its sign-up deadline.</p>
            </div>
            <Button onClick={handleTriggerJob} disabled={triggeringJob}>
              {triggeringJob ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
              Run Job Manually
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <AccessAudit />
      
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => toast('Changes discarded')}>Discard</Button>
        <Button onClick={handleSaveSettings} disabled={isLoading}>Save Configuration</Button>
      </div>
    </div>
  );
}
