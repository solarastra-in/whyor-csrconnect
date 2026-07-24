import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, FileText, Download, Play, BookOpen, ShieldCheck, Sparkles, HelpCircle, FileCheck, Award, Share2, Bookmark, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface ResourceItem {
  id: string;
  title: string;
  category: 'toolkits' | 'training' | 'policies' | 'playbooks';
  fileType: 'PDF' | 'PPTX' | 'DOCX' | 'XLSX';
  fileSize: string;
  description: string;
  tags: string[];
  downloadsCount: number;
  featured?: boolean;
  contentSnippet?: string;
}

const RESOURCES: ResourceItem[] = [
  {
    id: 'res-1',
    title: 'Corporate Volunteer On-Site Safety & Ethics Handbook 2026',
    category: 'toolkits',
    fileType: 'PDF',
    fileSize: '1.8 MB',
    description: 'Comprehensive guidelines covering field safety, beneficiary photo consent, medical protocols, and emergency contacts for on-site CSR activities.',
    tags: ['Safety', 'Compliance', 'Field Work', 'Mandatory'],
    downloadsCount: 1420,
    featured: true,
    contentSnippet: 'Section 1: General Safety Procedures & Beneficiary Privacy Protection...'
  },
  {
    id: 'res-2',
    title: 'Team Leader Volunteer Mobilization Playbook',
    category: 'playbooks',
    fileType: 'DOCX',
    fileSize: '850 KB',
    description: 'Step-by-step checklist for team leaders planning team-wide volunteer days, including venue coordination, transport, and attendance tracking.',
    tags: ['Team Leaders', 'Operations', 'Event Management'],
    downloadsCount: 890,
    featured: true,
    contentSnippet: 'Phase 1: 3 Weeks Before Event - Logistics & Department Alignment...'
  },
  {
    id: 'res-3',
    title: 'ESG & UN Sustainable Development Goals (SDGs) Employee Guide',
    category: 'policies',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    description: 'Understand how employee volunteer hours map directly into corporate ESG disclosures and UN SDG Goals 1 through 17.',
    tags: ['ESG', 'SDGs', 'Corporate Policy', 'Impact'],
    downloadsCount: 2150,
    featured: true
  },
  {
    id: 'res-4',
    title: 'Digital Youth Mentorship & Tutoring Best Practices',
    category: 'training',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    description: 'Best practice guide for virtual mentoring sessions, online safety, age-appropriate curriculum delivery, and student engagement.',
    tags: ['Education', 'Remote', 'Mentorship'],
    downloadsCount: 670
  },
  {
    id: 'res-5',
    title: 'Corporate Paid Volunteer Time-Off (VTO) Policy & FAQ',
    category: 'policies',
    fileType: 'PDF',
    fileSize: '950 KB',
    description: 'Official company policy detailing paid volunteering leave entitlement, manager approval workflow, and eligible charity activities.',
    tags: ['HR Policy', 'VTO Leave', 'Benefits'],
    downloadsCount: 3100
  },
  {
    id: 'res-6',
    title: 'Tree Plantation & Environmental Restoration Field Deck',
    category: 'toolkits',
    fileType: 'PPTX',
    fileSize: '4.5 MB',
    description: 'Visual slide deck detailing native species selection, soil preparation, Miyawaki afforestation methodology, and plant care schedule.',
    tags: ['Environment', 'Afforestation', 'Field Guide'],
    downloadsCount: 540
  },
  {
    id: 'res-7',
    title: 'CSR Matching Gift & Payroll Giving Process Walkthrough',
    category: 'policies',
    fileType: 'PDF',
    fileSize: '1.1 MB',
    description: 'How to leverage 1:1 corporate matching for individual donations processed via partner charities and tax exemption certificate receipts.',
    tags: ['Payroll Giving', 'Tax Benefit', 'Matching'],
    downloadsCount: 1820
  }
];

export function ResourceHub() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  // Quick Quiz State
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  const toggleBookmark = (id: string) => {
    setBookmarked(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    toast.success('Resource saved to your bookmarks!');
  };

  const handleDownload = (resource: ResourceItem) => {
    // Generate a downloadable document guide representing the toolkit
    const textContent = `================================================================
CORPORATE CSR RESOURCE HUB - OFFICIAL GUIDE & TOOLKIT
================================================================
Title:       ${resource.title}
Category:    ${resource.category.toUpperCase()}
Document Ref: ${resource.id.toUpperCase()}
Generated:   ${new Date().toLocaleDateString()}
Portal:      Corporate Volunteer Platform

----------------------------------------------------------------
1. EXECUTIVE OVERVIEW & DESCRIPTION
----------------------------------------------------------------
${resource.description}

----------------------------------------------------------------
2. KEY POLICIES & TAGS
----------------------------------------------------------------
Tags: ${resource.tags.join(', ')}

----------------------------------------------------------------
3. COMPLIANCE & SAFETY PROTOCOLS
----------------------------------------------------------------
- Always ensure manager pre-approval for VTO (Volunteer Time Off) hours.
- Adhere strictly to beneficiary photo consent and safety guidelines on-site.
- Log all completed volunteer hours on the corporate portal for matching grant eligibility.

================================================================
`;
    const blob = new Blob([textContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resource.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_guide.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Downloaded ${resource.title}`, {
      description: `Saved official document guide as Markdown.`
    });
  };

  const filteredResources = RESOURCES.filter(res => {
    const matchesCat = activeCategory === 'all' || res.category === activeCategory;
    const matchesSearch =
      res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const quizQuestions = [
    {
      question: "What is the primary requirement before taking Paid Volunteer Time-Off (VTO)?",
      options: [
        "No prior notification required",
        "Manager approval & logging via CSR Portal",
        "Submitting a personal tax return",
        "Completing 50 hours first"
      ],
      correct: 1
    },
    {
      question: "When taking photos during field volunteer drives, what protocol must be followed?",
      options: [
        "Post all photos immediately to personal social media",
        "Obtain consent & follow child/beneficiary privacy guidelines",
        "Never take any photos under any circumstances",
        "Sell photos to stock image sites"
      ],
      correct: 1
    }
  ];

  const handleAnswerSelect = (qIdx: number, oIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
  };

  const evaluateQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) score++;
    });
    setQuizScore(score);
    if (score === quizQuestions.length) {
      toast.success("Perfect Score! Volunteer Preparedness Badge Unlocked!", {
        description: "Your readiness certificate is updated in your employee profile."
      });
    } else {
      toast.info(`Score: ${score}/${quizQuestions.length}. Review guidelines and try again!`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <Badge className="bg-indigo-500/30 text-indigo-200 border-indigo-400/40 text-xs py-1 px-3">
            <BookOpen className="w-3.5 h-3.5 mr-1 text-indigo-300" /> Employee Knowledge Base
          </Badge>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Volunteer & CSR Resource Hub
          </h1>

          <p className="text-sm text-indigo-100 leading-relaxed">
            Access downloadable toolkits, field safety handbooks, team leader playbooks, and corporate ESG policies to prepare for your next volunteering drive.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-indigo-200">
            <span className="flex items-center gap-1">
              <FileCheck className="w-4 h-4 text-emerald-400" /> Verified Company Policies
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Field Safety Standards
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-4 h-4 text-indigo-400" /> Preparedness Certification
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input
            placeholder="Search toolkits, policies, or topics..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-50 text-xs h-9"
          />
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full sm:w-auto">
          <TabsList className="bg-slate-100 text-xs h-9 p-0.5">
            <TabsTrigger value="all" className="text-xs px-3 h-8">All Resources</TabsTrigger>
            <TabsTrigger value="toolkits" className="text-xs px-3 h-8">Toolkits</TabsTrigger>
            <TabsTrigger value="playbooks" className="text-xs px-3 h-8">Playbooks</TabsTrigger>
            <TabsTrigger value="policies" className="text-xs px-3 h-8">ESG Policies</TabsTrigger>
            <TabsTrigger value="training" className="text-xs px-3 h-8">Training</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.map(res => (
          <Card key={res.id} className="border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between">
            <CardHeader className="p-4 pb-2 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <Badge
                  className={`text-[10px] uppercase font-bold ${
                    res.fileType === 'PDF'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : res.fileType === 'PPTX'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {res.fileType} • {res.fileSize}
                </Badge>

                <button
                  onClick={() => toggleBookmark(res.id)}
                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Bookmark Resource"
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked.includes(res.id) ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                </button>
              </div>

              <CardTitle className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                {res.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 pt-0 space-y-3 flex-1 flex flex-col justify-between">
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {res.description}
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap gap-1">
                  {res.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>{res.downloadsCount.toLocaleString()} downloads</span>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedResource(res)}
                      className="text-xs h-7 text-indigo-700 hover:bg-indigo-50 font-semibold"
                    >
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(res)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-7 gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive Preparedness Quiz Section */}
      <Card className="border border-indigo-100 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/50 p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" /> Interactive Preparedness Module
            </Badge>
            <h3 className="text-lg font-bold text-slate-900">
              5-Minute Volunteer Safety & Ethics Orientation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Test your knowledge on field safety rules, corporate VTO policies, and beneficiary interaction etiquette to earn your Certified Volunteer Badge.
            </p>
          </div>

          <div className="w-full md:w-auto bg-white p-4 rounded-xl border border-slate-200 space-y-3 min-w-[320px]">
            {quizQuestions.map((q, qIdx) => (
              <div key={qIdx} className="space-y-1.5">
                <p className="text-xs font-bold text-slate-800">
                  {qIdx + 1}. {q.question}
                </p>
                <div className="space-y-1">
                  {q.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => handleAnswerSelect(qIdx, oIdx)}
                      className={`w-full text-left text-[11px] p-2 rounded-lg border transition-colors ${
                        selectedAnswers[qIdx] === oIdx
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold'
                          : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {quizScore !== null ? (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Certified ({quizScore}/2 Correct)
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">Select answers above</span>
              )}

              <Button
                onClick={evaluateQuiz}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-7"
              >
                Submit Quiz
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Document Preview Modal */}
      {selectedResource && (
        <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
          <DialogContent className="max-w-xl p-6">
            <DialogHeader className="space-y-2">
              <Badge className="w-fit bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                {selectedResource.fileType} Document Preview
              </Badge>
              <DialogTitle className="text-lg font-bold text-slate-900">
                {selectedResource.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 space-y-2 font-mono">
                <p className="font-bold text-slate-900">Document Excerpt:</p>
                <p>{selectedResource.description}</p>
                <p className="text-slate-500 italic">
                  {selectedResource.contentSnippet || "This toolkit contains official company templates, field safety protocols, and attendance log sheets."}
                </p>
              </div>

              <div className="flex items-center justify-between text-slate-500 pt-2">
                <span>File Size: {selectedResource.fileSize}</span>
                <span>Category: {selectedResource.category}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={() => setSelectedResource(null)} className="text-xs">
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  handleDownload(selectedResource);
                  setSelectedResource(null);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Download Full Toolkit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
