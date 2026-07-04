import re
with open('src/pages/MyImpact.tsx', 'r') as f:
    content = f.read()

imports = """import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Award, Star, TrendingUp, Trophy, Target, ArrowUpRight, Heart, Share2, MessageSquare, Send, IndianRupee, Medal, MessageSquareQuote } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useAuth } from '@/src/contexts/AuthContext';
import { useVolunteer } from '@/src/contexts/VolunteerContext';
import { collection, getDocs, doc, setDoc, addDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { PersonalCSRGoal } from '@/src/components/PersonalCSRGoal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';"""

content = re.sub(r'^.*?const donationHistory', imports + '\n\nconst donationHistory', content, flags=re.DOTALL)

with open('src/pages/MyImpact.tsx', 'w') as f:
    f.write(content)
