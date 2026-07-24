import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Share2, Linkedin, Twitter, Copy, Check, MessageSquare, 
  Send, ExternalLink, Sparkles, Building2, Globe 
} from 'lucide-react';
import { toast } from 'sonner';

interface ProjectShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string | number;
    name: string;
    charity: string;
    location: string;
    description: string;
    tags?: string[];
  };
}

export function ProjectShareModal({ isOpen, onClose, project }: ProjectShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedSlackText, setCopiedSlackText] = useState(false);

  // Generate shareable link
  const shareUrl = `${window.location.origin}/projects?id=${project.id}`;
  
  // Custom share message templates
  const linkedInPostText = ` excited to support ${project.name} organized by ${project.charity}! Join us in making a real CSR impact in ${project.location}. #CSRConnect #Volunteering #CorporateSocialResponsibility #${project.tags?.[0]?.replace(/\s+/g, '') || 'CSR'}`;

  const twitterPostText = `Join me in volunteering for ${project.name} by ${project.charity}! 🌟 Make an impact in ${project.location}: ${shareUrl}`;

  const internalSlackText = `📢 *Volunteer Opportunity: ${project.name}*\n📍 *Location:* ${project.location} | *NGO Partner:* ${project.charity}\n💡 *About:* ${project.description.slice(0, 140)}...\n👉 *Sign up or Pledge Hours:* ${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Project link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySlackSnippet = () => {
    navigator.clipboard.writeText(internalSlackText);
    setCopiedSlackText(true);
    toast.success('Formatted Slack/Teams announcement copied!');
    setTimeout(() => setCopiedSlackText(false), 2000);
  };

  const handleShareLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=600');
    toast.info('Opened LinkedIn sharing window!');
  };

  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterPostText)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=500');
    toast.info('Opened Twitter/X sharing window!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-400 text-slate-950 font-bold text-[10px] border-0 flex items-center gap-1">
              <Share2 className="w-3 h-3" /> Social Sharing
            </Badge>
            <span className="text-xs text-indigo-200">Inspire Colleague Volunteering</span>
          </div>

          <DialogTitle className="text-xl font-bold text-white">
            Share {project.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-indigo-200">
            Invite fellow employees or post to professional networks to boost volunteer participation.
          </DialogDescription>
        </div>

        <div className="p-5 space-y-5 bg-white text-xs">
          {/* External Social Networks */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block">External Professional Networks</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleShareLinkedIn}
                className="bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs h-10 gap-2 w-full justify-start px-3"
              >
                <Linkedin className="w-4 h-4 fill-white" /> LinkedIn Post
              </Button>

              <Button
                onClick={handleShareTwitter}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 gap-2 w-full justify-start px-3"
              >
                <Twitter className="w-4 h-4 fill-white" /> Post on X / Twitter
              </Button>
            </div>
          </div>

          {/* Internal Company Channels (Slack / Microsoft Teams) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" /> Internal Company Channels (Slack / Teams)
              </label>
              <Button
                onClick={handleCopySlackSnippet}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px] text-indigo-600 hover:bg-indigo-50 font-semibold"
              >
                {copiedSlackText ? <Check className="w-3 h-3 text-emerald-600 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copiedSlackText ? 'Copied' : 'Copy Slack Format'}
              </Button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed">
              {internalSlackText}
            </div>
          </div>

          {/* Shareable URL Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">Direct Project Link</label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={shareUrl}
                className="bg-slate-50 text-xs font-mono h-9"
              />
              <Button
                onClick={handleCopyLink}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 bg-slate-50 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} className="w-full text-xs">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
