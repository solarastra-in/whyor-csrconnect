import re
with open('src/pages/Companies.tsx', 'r') as f:
    content = f.read()

imports = """import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';"""

content = re.sub(r'import \{ useState, useEffect \} from \'react\';.*?import \{ Badge \} from \'@/components/ui/badge\';', imports, content, flags=re.DOTALL)


tabs_section = """      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Companies</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          {renderCompanies('active')}
        </TabsContent>
        <TabsContent value="pending">
          {renderCompanies('pending_review')}
        </TabsContent>
      </Tabs>"""

content = re.sub(r'      \{loading \? \(.*?\) \? \(.*?\) : \(.*?<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">.*?</div>\n\s*\)\}', tabs_section, content, flags=re.DOTALL)

with open('src/pages/Companies.tsx', 'w') as f:
    f.write(content)
