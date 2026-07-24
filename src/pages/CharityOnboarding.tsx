import { db, storage } from '@/src/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Upload, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { auth } from '@/src/lib/firebase';
import { getAuth } from 'firebase/auth';
import { toast } from 'sonner';

export function CharityOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    website: '',
    promoters: '',
    country: 'India',
    state: '',
    city: '',
    rawDescription: '',
    aiPurpose: '',
  });

  const handleNextStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Organization Name is required';
    if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration Number is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      setStep(2);
    }
  };

  const handleNextStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.rawDescription.trim() && !formData.aiPurpose.trim()) {
      newErrors.purpose = 'Please provide a raw description or generate an AI purpose';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      setStep(3);
    }
  };

  const handleComplete = async () => {
    if (!file) {
      setErrors({ file: 'Please upload the required legal documents' });
      toast.error('Please fix the errors before submitting');
      return;
    }
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      let documentUrl = '';
      if (file) {
        const fileRef = ref(storage, `charity-documents/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        documentUrl = await getDownloadURL(fileRef);
      }
      
      await addDoc(collection(db, 'charities'), {
        name: formData.name,
        focus: formData.rawDescription ? (formData.rawDescription.slice(0, 50) + '...') : 'Community Development',
        location: `${formData.city}, ${formData.state}`,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        website: formData.website,
        summary: formData.aiPurpose || formData.rawDescription,
        status: 'pending_verification',
        promotors: formData.promoters || (user ? user.email : ''),
        submittedBy: user ? user.uid : '',
        adminEmails: user && user.email ? [user.email.toLowerCase()] : [],
        documentUrl,
        createdAt: new Date().getTime(),
        activeProjects: []
      });
      
      localStorage.removeItem('charityOnboardingDraft');
      toast.success('Charity registration submitted for review!');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit registration');
    }
  };

  const handleGeneratePurpose = async () => {
    if (!formData.rawDescription) return;
    
    setIsGenerating(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/ai/draft-purpose', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ description: formData.rawDescription }),
      });

      
      const data = await response.json();
      if (data.draft) {
        setFormData(prev => ({ ...prev, aiPurpose: data.draft }));
      }
    } catch (error) {
      console.error('Failed to generate purpose:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Charity Onboarding</h1>
          <p className="text-gray-500">Register a new CSR entity and validate documentation.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-500'}`}>
              <span className="text-sm font-semibold">1</span>
            </div>
            <span className={`ml-2 text-sm font-medium ${step >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>Details</span>
          </div>
          <div className={`w-8 h-px ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-500'}`}>
              <span className="text-sm font-semibold">2</span>
            </div>
            <span className={`ml-2 text-sm font-medium ${step >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>Purpose</span>
          </div>
          <div className={`w-8 h-px ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-500'}`}>
              <span className="text-sm font-semibold">3</span>
            </div>
            <span className={`ml-2 text-sm font-medium ${step >= 3 ? 'text-gray-900' : 'text-gray-500'}`}>Documents</span>
          </div>
        </div>
      </div>

      <Card>
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the registered details of the charity or NGO.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={e => {
                      setFormData({...formData, name: e.target.value});
                      if (errors.name) setErrors(prev => ({...prev, name: ''}));
                    }}
                    placeholder="e.g. Save The Earth Foundation" 
                    className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg">Registration Number (CSR-1)</Label>
                  <Input 
                    id="reg" 
                    value={formData.registrationNumber}
                    onChange={e => {
                      setFormData({...formData, registrationNumber: e.target.value});
                      if (errors.registrationNumber) setErrors(prev => ({...prev, registrationNumber: ''}));
                    }}
                    placeholder="e.g. CSR1234567" 
                    className={errors.registrationNumber ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.registrationNumber && <p className="text-sm text-red-500">{errors.registrationNumber}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input 
                    id="website" 
                    value={formData.website}
                    onChange={e => setFormData({...formData, website: e.target.value})}
                    placeholder="e.g. https://example.org" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promoters">Promoters / Founders (Optional)</Label>
                  <Input 
                    id="promoters" 
                    value={formData.promoters}
                    onChange={e => setFormData({...formData, promoters: e.target.value})}
                    placeholder="e.g. Jane Doe, John Smith" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={formData.country} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input 
                    id="state" 
                    value={formData.state}
                    onChange={e => {
                      setFormData({...formData, state: e.target.value});
                      if (errors.state) setErrors(prev => ({...prev, state: ''}));
                    }}
                    placeholder="e.g. Maharashtra" 
                    className={errors.state ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    value={formData.city}
                    onChange={e => {
                      setFormData({...formData, city: e.target.value});
                      if (errors.city) setErrors(prev => ({...prev, city: ''}));
                    }}
                    placeholder="e.g. Mumbai" 
                    className={errors.city ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <button 
                onClick={handleNextStep1}
                className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-blue-700 flex items-center"
              >
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </CardFooter>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Project Purpose & AI Assistant</CardTitle>
              <CardDescription>Describe what the charity does. Our AI will help craft a compelling CSR purpose statement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Raw Description (Your own words)</Label>
                <Textarea 
                  rows={4} 
                  placeholder="We plant trees in urban areas to reduce pollution and educate kids about nature..."
                  value={formData.rawDescription}
                  onChange={e => {
                    setFormData({...formData, rawDescription: e.target.value});
                    if (errors.purpose) setErrors(prev => ({...prev, purpose: ''}));
                  }}
                  className={errors.purpose ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
              </div>
              
              <div className="flex justify-center">
                <button 
                  onClick={handleGeneratePurpose}
                  disabled={isGenerating || !formData.rawDescription}
                  className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2 rounded-md font-medium text-sm flex items-center transition-colors disabled:opacity-50"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isGenerating ? 'Generating...' : 'Enhance with AI'}
                </button>
              </div>

              <div className="space-y-2">
                <Label>Enhanced CSR Purpose Statement</Label>
                <Textarea 
                  rows={5} 
                  className={`border-purple-200 focus-visible:ring-purple-500 ${errors.purpose ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  placeholder="AI generated purpose will appear here..."
                  value={formData.aiPurpose}
                  onChange={e => {
                    setFormData({...formData, aiPurpose: e.target.value});
                    if (errors.purpose) setErrors(prev => ({...prev, purpose: ''}));
                  }}
                />
                {errors.purpose && <p className="text-sm text-red-500">{errors.purpose}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <button 
                onClick={() => setStep(1)}
                className="text-gray-600 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-100"
              >
                Back
              </button>
              <button 
                onClick={handleNextStep2}
                className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-blue-700 flex items-center"
              >
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </CardFooter>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>Documentation Validation</CardTitle>
              <CardDescription>Upload necessary legal documents for validation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className={`border-2 border-dashed ${errors.file ? 'border-red-400 bg-red-50' : 'border-gray-200'} rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative`}
              >
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setFile(e.target.files[0]);
                      if (errors.file) setErrors(prev => ({...prev, file: ''}));
                    }
                  }}
                />
                <Upload className={`h-8 w-8 ${errors.file ? 'text-red-400' : 'text-gray-400'} mx-auto mb-3`} />
                <p className={`text-sm font-medium ${errors.file ? 'text-red-900' : 'text-gray-900'}`}>
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className={`text-xs ${errors.file ? 'text-red-500' : 'text-gray-500'} mt-1`}>
                  {errors.file ? errors.file : 'CSR-1 Certificate, 80G, 12A, Trust Deed (PDF up to 10MB)'}
                </p>
              </div>

              <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-md flex items-start">
                <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p>Documents will be automatically processed and verified against the MCA database before the charity is listed on the platform.</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <button 
                onClick={() => setStep(2)}
                className="text-gray-600 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-100"
              >
                Back
              </button>
              <button 
                onClick={handleComplete}
                className="bg-green-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-green-700"
              >
                Submit Registration
              </button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
