with open('src/pages/Charities.tsx', 'r') as f:
    content = f.read()

tabs_old = """      <Tabs defaultValue="charities" className="w-full">
        <TabsList>
          <TabsTrigger value="charities">Charities & NGOs</TabsTrigger>
          <TabsTrigger value="projects">Project Submissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charities" className="space-y-6 mt-0">"""

tabs_new = """      <Tabs defaultValue="pending_charities" className="w-full">
        <TabsList>
          <TabsTrigger value="pending_charities">Pending Review</TabsTrigger>
          <TabsTrigger value="charities">Charities & NGOs</TabsTrigger>
          <TabsTrigger value="projects">Project Submissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending_charities" className="space-y-6 mt-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">NGO Name</th>
                    <th className="px-6 py-4">Focus Area</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {charitiesList.filter(c => c.status === 'pending_verification').map(charity => (
                    <tr key={charity.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-gray-900">{charity.name}</td>
                      <td className="px-6 py-4 text-gray-600">{charity.focus}</td>
                      <td className="px-6 py-4 text-gray-600">{charity.location}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleBulkAction('approve')}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleBulkAction('archive')}>
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {charitiesList.filter(c => c.status === 'pending_verification').length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No charities pending review
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="charities" className="space-y-6 mt-0">"""

if 'value="pending_charities"' not in content:
    content = content.replace(tabs_old, tabs_new)

with open('src/pages/Charities.tsx', 'w') as f:
    f.write(content)
