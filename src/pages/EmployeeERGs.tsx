import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Megaphone, Calendar, ArrowRight, HandHeart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const ergs = [
  {
    id: 1,
    name: 'Women in Tech (WiT)',
    description: 'Empowering women across the organization through mentorship, networking, and skill-building.',
    members: 1240,
    budgetAllocated: 50000,
    budgetSpent: 22000,
    tags: ['Diversity', 'Mentorship'],
    featuredEvent: 'Annual Leadership Summit',
    joined: true
  },
  {
    id: 2,
    name: 'Green Earth Alliance',
    description: 'Sustainability advocates driving environmental initiatives within the company and our local communities.',
    members: 850,
    budgetAllocated: 30000,
    budgetSpent: 12000,
    tags: ['Sustainability', 'Environment'],
    featuredEvent: 'Local River Clean-up',
    joined: false
  },
  {
    id: 3,
    name: 'Pride Network',
    description: 'Fostering an inclusive environment and advocating for LGBTQ+ rights and visibility.',
    members: 920,
    budgetAllocated: 40000,
    budgetSpent: 35000,
    tags: ['LGBTQ+', 'Inclusion'],
    featuredEvent: 'Pride Month Celebration',
    joined: true
  }
];

export function EmployeeERGs() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Employee Resource Groups (ERGs)</h1>
          <p className="text-gray-500 mt-1">Connect with like-minded colleagues, drive cultural change, and allocate community budgets.</p>
        </div>
        <Button onClick={() => toast.success('Starting new ERG workflow...')} className="bg-blue-600 hover:bg-blue-700">Start a New ERG</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ergs.map((erg) => (
          <Card key={erg.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2">
                  {erg.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">{tag}</Badge>
                  ))}
                </div>
              </div>
              <CardTitle>{erg.name}</CardTitle>
              <CardDescription className="line-clamp-2">{erg.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                {erg.members.toLocaleString()} Members
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Community Budget</span>
                  <span className="font-medium">₹{erg.budgetSpent.toLocaleString()} / ₹{erg.budgetAllocated.toLocaleString()}</span>
                </div>
                <Progress value={(erg.budgetSpent / erg.budgetAllocated) * 100} className="h-2" />
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-4">
                <div className="flex items-center text-sm font-medium text-gray-900 mb-1">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  Upcoming Event
                </div>
                <p className="text-sm text-gray-600">{erg.featuredEvent}</p>
              </div>
            </CardContent>
            <CardFooter>
              {erg.joined ? (
                <div className="w-full flex space-x-2">
                  <Button variant="outline" className="flex-1 text-green-700 border-green-200 bg-green-50 hover:bg-green-100">
                    <HandHeart className="h-4 w-4 mr-2" /> Member
                  </Button>
                  <Button onClick={() => toast.success('Redirecting to ERG Hub...')} variant="default" className="flex-1 bg-blue-600 hover:bg-blue-700">Go to Hub</Button>
                </div>
              ) : (
                <Button onClick={() => toast.success('Request to join ERG sent!')} className="w-full">Join ERG</Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
