import re
with open('src/pages/MyImpact.tsx', 'r') as f:
    content = f.read()

imports = """import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Award, Star, TrendingUp, Trophy, Target, ArrowUpRight, Heart, Share2, MessageSquare, Send } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/src/contexts/AuthContext';
import { collection, getDocs, doc, setDoc, addDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';"""

# Add fetch logic for reflections inside the component
old_state = """  const [reflections, setReflections] = useState<any[]>([
    {
      id: 1,
      project: "Beach Cleanup Drive",
      date: "Oct 15, 2023",
      text: "It was incredibly rewarding to see the immediate impact of our work. We collected over 50kg of plastic waste. Connecting with colleagues outside the office context really helped build team spirit.",
      likes: 12
    }
  ]);
  const [newReflection, setNewReflection] = useState("");
  const [selectedProject, setSelectedProject] = useState("Beach Cleanup Drive");

  const handleShareReflection = () => {
    if (!newReflection.trim() || !selectedProject) return;
    
    const newEntry = {
      id: Date.now(),
      project: selectedProject,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      text: newReflection,
      likes: 0
    };
    
    setReflections([newEntry, ...reflections]);
    setNewReflection("");
    toast.success('Reflection shared successfully!');
  };"""

new_state = """  const [reflections, setReflections] = useState<any[]>([]);
  const [newReflection, setNewReflection] = useState("");
  const [selectedProject, setSelectedProject] = useState("Beach Cleanup Drive");
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchReflections();
  }, [user]);

  const fetchReflections = async () => {
    try {
      const q = query(collection(db, `users/${user?.uid}/reflections`), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setReflections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleShareReflection = async () => {
    if (!newReflection.trim() || !selectedProject || !user) return;
    
    try {
      const newEntry = {
        project: selectedProject,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        text: newReflection,
        likes: 0,
        createdAt: new Date().getTime()
      };
      
      const ref = await addDoc(collection(db, `users/${user.uid}/reflections`), newEntry);
      setReflections([{ id: ref.id, ...newEntry }, ...reflections]);
      setNewReflection("");
      toast.success('Reflection shared successfully!');
    } catch(e) {
      console.error(e);
      toast.error('Failed to share reflection');
    }
  };"""

content = re.sub(r'import \{ Card.*?from \'sonner\';', imports, content, flags=re.DOTALL)
content = content.replace(old_state, new_state)

# Fix Tax Receipt logic
old_receipt = """  const handleDownloadTaxReceipt = () => {
    toast.success('Tax receipt downloaded successfully');
  };"""

new_receipt = """  const handleDownloadTaxReceipt = () => {
    // Generate a simple text blob simulating a receipt
    const receiptText = `
TAX RECEIPT - 80G COMPLIANT
--------------------------------
Name: ${user?.displayName || 'Volunteer'}
Email: ${user?.email || 'N/A'}
Date: ${new Date().toLocaleDateString()}

Total Donations This Year: ₹12,500
Eligible for Tax Deduction under Section 80G.

This is a computer-generated receipt.
    `;
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tax_Receipt_${new Date().getFullYear()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Tax receipt downloaded successfully');
  };"""

content = content.replace(old_receipt, new_receipt)

with open('src/pages/MyImpact.tsx', 'w') as f:
    f.write(content)
