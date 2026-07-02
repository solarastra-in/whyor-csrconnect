import re
with open('src/pages/EmployeeDashboard.tsx', 'r') as f:
    content = f.read()

old_hours = """              } else if (id === 'hours') {
                className = 'col-span-1 md:col-span-2 lg:col-span-2';
                content = (
                  <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Volunteer Hours (Last 6 Months)</h2>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volunteerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <Tooltip 
                        cursor={{ fill: '#f3f4f6' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="hours" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
                );"""

new_hours = """              } else if (id === 'hours') {
                className = 'col-span-1 md:col-span-2 lg:col-span-2';
                content = (
                  <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Volunteer Hours</h2>
            </div>
            <Card>
              <CardContent className="pt-6">
                {totalHours === 0 ? (
                  <div className="h-64 w-full flex flex-col items-center justify-center text-center px-4">
                    <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                      <Clock className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No hours logged yet</h3>
                    <p className="text-sm text-gray-500 max-w-sm mb-6">Your impact journey starts here! Join a project, complete your tasks, and log your first volunteer hour to get on the leaderboard.</p>
                    <button onClick={() => navigate('/employee/projects')} className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                      Find a Project
                    </button>
                  </div>
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={volunteerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <Tooltip 
                          cursor={{ fill: '#f3f4f6' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="hours" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
                );"""

content = content.replace(old_hours, new_hours)

with open('src/pages/EmployeeDashboard.tsx', 'w') as f:
    f.write(content)
