import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, GraduationCap, ArrowRight, ExternalLink } from 'lucide-react';
import { useVolunteer } from '@/src/contexts/VolunteerContext';

export function SkillGapAnalyzer() {
  const { userSkills } = useVolunteer();
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Only analyzing when user clicks the button
  const handleAnalyze = () => {
    setAnalyzing(true);
    // Simulate AI processing time
    setTimeout(() => {
      // Logic for suggesting based on current skills
      const missingDigital = !userSkills.some(s => s.toLowerCase().includes('digital') || s.toLowerCase().includes('coding'));
      const missingHealth = !userSkills.some(s => s.toLowerCase().includes('health') || s.toLowerCase().includes('cpr'));

      let newSuggestions = [];

      if (missingDigital) {
        newSuggestions.push({
          id: 1,
          title: 'Digital Literacy Facilitator',
          provider: 'Coursera',
          duration: '4 weeks',
          link: '#',
          reason: 'High demand in local NGO projects for teaching basic digital skills.'
        });
      }

      if (missingHealth) {
        newSuggestions.push({
          id: 2,
          title: 'Basic First Aid & CPR Certification',
          provider: 'Red Cross',
          duration: '1 day',
          link: '#',
          reason: 'Essential for field volunteer roles and community events.'
        });
      }

      newSuggestions.push({
        id: 3,
        title: 'Project Management for NGOs',
        provider: 'LinkedIn Learning',
        duration: '2 weeks',
        link: '#',
        reason: 'Enhance your leadership capacity for organizing CSR drives.'
      });

      // Ensure we have exactly 3 suggestions
      while (newSuggestions.length < 3) {
        newSuggestions.push({
          id: Math.random(),
          title: 'Sustainable Development Goals (SDGs)',
          provider: 'UN SDG Academy',
          duration: '3 weeks',
          link: '#',
          reason: 'Broaden your understanding of global impact targets.'
        });
      }
      
      setSuggestions(newSuggestions.slice(0, 3));
      setAnalyzing(false);
    }, 2500);
  };

  return (
    <Card className="border-indigo-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 bg-indigo-50 rounded-bl-full -z-10 opacity-50"></div>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>AI Skill-Gap Analyzer</CardTitle>
            <CardDescription className="mt-1">
              Discover certifications to unlock high-impact volunteer roles.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 && !analyzing ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-600 mb-4">
              We analyze your current skills and target volunteer roles to suggest the best upskilling paths.
            </p>
            <Button onClick={handleAnalyze} className="bg-indigo-600 hover:bg-indigo-700">
              <Sparkles className="w-4 h-4 mr-2" /> Analyze My Profile
            </Button>
          </div>
        ) : analyzing ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <Sparkles className="w-5 h-5 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-sm text-gray-500 font-medium animate-pulse">Analyzing role requirements & your skills...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-900 text-sm">Recommended Training:</h4>
              <Button variant="ghost" size="sm" onClick={handleAnalyze} className="text-indigo-600 h-8">
                Refresh
              </Button>
            </div>
            
            <div className="grid gap-3">
              {suggestions.map((course) => (
                <div key={course.id} className="p-4 bg-white border border-gray-100 shadow-sm rounded-lg hover:border-indigo-200 transition-colors group">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded h-fit">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 text-sm group-hover:text-indigo-700 transition-colors">
                          {course.title}
                        </h5>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span className="font-medium">{course.provider}</span>
                          <span>•</span>
                          <span>{course.duration}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2 italic border-l-2 border-indigo-200 pl-2">
                          "{course.reason}"
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 group-hover:text-indigo-600 shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
