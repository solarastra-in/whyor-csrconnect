import re

# Fix Charities.tsx Building2 import
with open('src/pages/Charities.tsx', 'r') as f:
    c = f.read()
if 'Building2' not in c[:1000]:
    c = c.replace("import { Search, MapPin, Filter, Tag, CheckCircle, Archive, Plus, ExternalLink } from 'lucide-react';", "import { Search, MapPin, Filter, Tag, CheckCircle, Archive, Plus, ExternalLink, Building2 } from 'lucide-react';")
with open('src/pages/Charities.tsx', 'w') as f:
    f.write(c)

# Fix DiscoverProjects.tsx CreditCard import
with open('src/pages/DiscoverProjects.tsx', 'r') as f:
    c = f.read()
if 'CreditCard' not in c[:1000]:
    c = c.replace("import { Search, MapPin, Building2, Tag, Check, Calendar, ChevronRight } from 'lucide-react';", "import { Search, MapPin, Building2, Tag, Check, Calendar, ChevronRight, CreditCard } from 'lucide-react';")
with open('src/pages/DiscoverProjects.tsx', 'w') as f:
    f.write(c)

