import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, Edit2, Check, IndianRupee, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function PersonalCSRGoal({ currentHours = 0, currentDonations = 0 }) {
  const [isEditing, setIsEditing] = useState(false);
  const [hoursGoal, setHoursGoal] = useState(50);
  const [donationsGoal, setDonationsGoal] = useState(50000);
  
  const [tempHoursGoal, setTempHoursGoal] = useState(hoursGoal);
  const [tempDonationsGoal, setTempDonationsGoal] = useState(donationsGoal);

  const hoursProgress = Math.min((currentHours / hoursGoal) * 100, 100);
  const donationsProgress = Math.min((currentDonations / donationsGoal) * 100, 100);

  const handleSave = () => {
    setHoursGoal(tempHoursGoal);
    setDonationsGoal(tempDonationsGoal);
    setIsEditing(false);
  };

  return (
    <Card className="border-indigo-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 bg-indigo-50 rounded-bl-full -z-10 opacity-50"></div>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2 text-indigo-900">
            <Target className="h-5 w-5 text-indigo-500" />
            My Annual CSR Goals
          </CardTitle>
          {!isEditing ? (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-indigo-600">
              <Edit2 className="w-4 h-4 mr-1.5" /> Edit Goals
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleSave} className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100">
              <Check className="w-4 h-4 mr-1.5" /> Save
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Hours Goal */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-100 text-purple-600 rounded">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="font-semibold text-gray-700">Volunteer Hours</span>
              </div>
              <div className="text-right">
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <Input 
                      type="number" 
                      value={tempHoursGoal} 
                      onChange={(e) => setTempHoursGoal(Number(e.target.value))}
                      className="w-20 h-8 text-right"
                    />
                    <span className="text-sm text-gray-500">hrs</span>
                  </div>
                ) : (
                  <div className="font-bold text-lg text-gray-900">
                    {currentHours} <span className="text-sm text-gray-500 font-medium">/ {hoursGoal} hrs</span>
                  </div>
                )}
              </div>
            </div>
            <Progress value={hoursProgress} className="h-2.5 bg-purple-100 [&>div]:bg-purple-600" />
            <p className="text-xs text-gray-500 text-right">
              {hoursProgress >= 100 ? "Goal reached! 🎉" : `${hoursGoal - currentHours} hrs remaining to reach your goal.`}
            </p>
          </div>

          {/* Donations Goal */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <span className="font-semibold text-gray-700">Donations</span>
              </div>
              <div className="text-right">
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500">₹</span>
                    <Input 
                      type="number" 
                      value={tempDonationsGoal} 
                      onChange={(e) => setTempDonationsGoal(Number(e.target.value))}
                      className="w-24 h-8 text-right"
                    />
                  </div>
                ) : (
                  <div className="font-bold text-lg text-gray-900">
                    ₹{currentDonations.toLocaleString()} <span className="text-sm text-gray-500 font-medium">/ ₹{donationsGoal.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
            <Progress value={donationsProgress} className="h-2.5 bg-blue-100 [&>div]:bg-blue-600" />
            <p className="text-xs text-gray-500 text-right">
              {donationsProgress >= 100 ? "Goal reached! 🎉" : `₹${(donationsGoal - currentDonations).toLocaleString()} remaining to reach your goal.`}
            </p>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
