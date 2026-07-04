import re

with open('src/pages/Charities.tsx', 'r') as f:
    c = f.read()
c = c.replace("import { Plus, Search, Filter, MapPin, ExternalLink, ArrowRight, CheckCircle, XCircle, Edit2, Archive, Tag, CheckSquare } from 'lucide-react';", "import { Plus, Search, Filter, MapPin, ExternalLink, ArrowRight, CheckCircle, XCircle, Edit2, Archive, Tag, CheckSquare, Building2 } from 'lucide-react';")
with open('src/pages/Charities.tsx', 'w') as f:
    f.write(c)

with open('src/pages/DiscoverProjects.tsx', 'r') as f:
    c = f.read()
c = c.replace("import { Search, MapPin, Heart, Filter, Check, Clock, Star, Calendar as CalendarIcon, Grid, CalendarDays, FileText, Download, FileDown, Upload, Eye, EyeOff } from 'lucide-react';", "import { Search, MapPin, Heart, Filter, Check, Clock, Star, Calendar as CalendarIcon, Grid, CalendarDays, FileText, Download, FileDown, Upload, Eye, EyeOff, CreditCard } from 'lucide-react';")
with open('src/pages/DiscoverProjects.tsx', 'w') as f:
    f.write(c)
