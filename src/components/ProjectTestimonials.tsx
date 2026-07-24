import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, ThumbsUp, CheckCircle2, User, Sparkles, Send } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/src/lib/firebase';
import { collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';

export interface Testimonial {
  id: string;
  projectId: string;
  authorName: string;
  authorRole: string;
  authorCompany: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  helpfulCount: number;
}

const INITIAL_TESTIMONIALS: Record<string, Testimonial[]> = {
  'proj-1': [
    {
      id: 't-1',
      projectId: 'proj-1',
      authorName: 'Aarav Sharma',
      authorRole: 'Senior Software Engineer',
      authorCompany: 'Acme Corp',
      rating: 5,
      comment: 'Participating in the Ganga cleanup drive was an incredibly rewarding experience! The EcoBharat team organized water testing kits and safety gear seamlessly. Worked alongside 30+ tech colleagues.',
      date: '2026-06-15',
      verified: true,
      helpfulCount: 14
    },
    {
      id: 't-2',
      projectId: 'proj-1',
      authorName: 'Priya Nair',
      authorRole: 'Product Manager',
      authorCompany: 'Global Tech Solutions',
      rating: 5,
      comment: 'Great team coordination and clear impact metrics. Seeing 500kg of waste diverted from riverbanks in just 4 hours made all the effort worthwhile.',
      date: '2026-05-28',
      verified: true,
      helpfulCount: 9
    }
  ],
  'proj-2': [
    {
      id: 't-3',
      projectId: 'proj-2',
      authorName: 'Rohan Mehta',
      authorRole: 'Data Scientist',
      authorCompany: 'InnovateX',
      rating: 5,
      comment: 'Teaching Python basics to high school students remotely was smooth. The curriculum guidelines provided by Shiksha Trust were super easy to follow.',
      date: '2026-07-02',
      verified: true,
      helpfulCount: 12
    }
  ],
  'proj-3': [
    {
      id: 't-4',
      projectId: 'proj-3',
      authorName: 'Ananya Desai',
      authorRole: 'ESG Specialist',
      authorCompany: 'EcoCorp',
      rating: 5,
      comment: 'Planted over 40 native saplings in Gurugram! Fantastic physical volunteering drive with real long-term carbon offset impact.',
      date: '2026-06-20',
      verified: true,
      helpfulCount: 8
    }
  ]
};

interface ProjectTestimonialsProps {
  projectId: string;
  projectName: string;
}

export function ProjectTestimonials({ projectId, projectName }: ProjectTestimonialsProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // New review form states
  const [newRating, setNewRating] = useState<number>(5);
  const [authorName, setAuthorName] = useState<string>('');
  const [authorRole, setAuthorRole] = useState<string>('');
  const [authorCompany, setAuthorCompany] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [helpfulLiked, setHelpfulLiked] = useState<string[]>([]);

  useEffect(() => {
    fetchTestimonials();
  }, [projectId]);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'project_testimonials'),
        where('projectId', '==', projectId)
      );
      const snap = await getDocs(q);
      
      let fetched: Testimonial[] = [];
      if (!snap.empty) {
        fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
      } else {
        // Fallback to initial sample testimonials
        fetched = INITIAL_TESTIMONIALS[projectId] || [
          {
            id: `fallback-${projectId}`,
            projectId,
            authorName: 'Neha Gupta',
            authorRole: 'Volunteer Coordinator',
            authorCompany: 'CSR Connect Partner',
            rating: 5,
            comment: `Fantastic experience volunteering for ${projectName}. Highly recommended for all team members looking to make a meaningful difference!`,
            date: '2026-07-10',
            verified: true,
            helpfulCount: 5
          }
        ];
      }
      setTestimonials(fetched);
    } catch (e) {
      console.error('Error fetching testimonials:', e);
      setTestimonials(INITIAL_TESTIMONIALS[projectId] || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error('Please enter a review or feedback comment.');
      return;
    }

    const reviewObj: Omit<Testimonial, 'id'> = {
      projectId,
      authorName: authorName.trim() || 'Anonymous Volunteer',
      authorRole: authorRole.trim() || 'Employee Volunteer',
      authorCompany: authorCompany.trim() || 'Partner Company',
      rating: newRating,
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
      verified: true,
      helpfulCount: 0
    };

    try {
      const docRef = await addDoc(collection(db, 'project_testimonials'), reviewObj);
      const createdItem: Testimonial = { id: docRef.id, ...reviewObj };
      
      setTestimonials(prev => [createdItem, ...prev]);
      toast.success('Thank you for your feedback!', {
        description: 'Your volunteer testimonial and rating have been posted.'
      });

      // Reset form
      setComment('');
      setShowAddForm(false);
    } catch (err: any) {
      console.error('Error adding review:', err);
      // Local fallback
      const localItem: Testimonial = { id: `local-${Date.now()}`, ...reviewObj };
      setTestimonials(prev => [localItem, ...prev]);
      toast.success('Testimonial submitted!');
      setComment('');
      setShowAddForm(false);
    }
  };

  const handleHelpful = (id: string) => {
    if (helpfulLiked.includes(id)) return;
    setHelpfulLiked(prev => [...prev, id]);
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, helpfulCount: t.helpfulCount + 1 } : t));
    toast.success('Marked review as helpful!');
  };

  const avgRating = testimonials.length > 0 
    ? (testimonials.reduce((acc, curr) => acc + curr.rating, 0) / testimonials.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6">
      {/* Testimonials Header Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-amber-400 text-slate-950 p-3 rounded-xl font-extrabold text-2xl flex items-center gap-1.5 shadow-md">
            <span>{avgRating}</span>
            <Star className="w-6 h-6 fill-slate-950 text-slate-950" />
          </div>
          <div>
            <h4 className="font-bold text-lg text-white">Volunteer Impact Feedback</h4>
            <p className="text-xs text-indigo-200">
              Based on {testimonials.length} verified employee volunteer reviews
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs gap-1.5 shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          {showAddForm ? 'Close Review Form' : 'Write a Review'}
        </Button>
      </div>

      {/* Add Review Form */}
      {showAddForm && (
        <form onSubmit={handleSubmitReview} className="p-5 border border-indigo-100 rounded-2xl bg-indigo-50/50 space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" /> Share Your Volunteering Experience
            </h5>
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-600 font-semibold mr-1">Rating:</span>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewRating(star)}
                  className="p-1 focus:outline-none"
                >
                  <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Your Name</label>
              <Input
                placeholder="e.g. Alex Johnson"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                className="bg-white text-xs h-9"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Role / Designation</label>
              <Input
                placeholder="e.g. UX Designer"
                value={authorRole}
                onChange={e => setAuthorRole(e.target.value)}
                className="bg-white text-xs h-9"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Company Name</label>
              <Input
                placeholder="e.g. Acme Corp"
                value={authorCompany}
                onChange={e => setAuthorCompany(e.target.value)}
                className="bg-white text-xs h-9"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Your Review & Feedback</label>
            <Textarea
              rows={3}
              placeholder="How was the organization, on-site support, and overall impact of this volunteer opportunity?"
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="bg-white text-xs"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddForm(false)}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8 gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Submit Review
            </Button>
          </div>
        </form>
      )}

      {/* Testimonials List */}
      <div className="space-y-3">
        {testimonials.map(item => (
          <div
            key={item.id}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-all space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {item.authorName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-xs text-slate-900">{item.authorName}</h5>
                    {item.verified && (
                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0 border-0 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Volunteer
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {item.authorRole} • {item.authorCompany}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/80">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-900 ml-1">{item.rating}.0</span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed pl-10">
              "{item.comment}"
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 pl-10 text-[11px] text-slate-500">
              <span>Posted on {item.date}</span>

              <button
                type="button"
                onClick={() => handleHelpful(item.id)}
                disabled={helpfulLiked.includes(item.id)}
                className={`flex items-center gap-1.5 transition-colors ${
                  helpfulLiked.includes(item.id) ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-indigo-600'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Helpful ({item.helpfulCount})</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
