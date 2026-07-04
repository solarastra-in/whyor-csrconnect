import re
with open('src/pages/Challenges.tsx', 'r') as f:
    content = f.read()

imports = """import { useState, useEffect } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/src/contexts/AuthContext';
import { useVolunteer } from '@/src/contexts/VolunteerContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Star, Target, CheckCircle2, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';"""

# replace everything before `const initialChallenges`
content = re.sub(r'^.*?const initialChallenges', imports + '\n\nconst initialChallenges', content, flags=re.DOTALL)

with open('src/pages/Challenges.tsx', 'w') as f:
    f.write(content)
