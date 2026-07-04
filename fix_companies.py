import re
with open('src/pages/Companies.tsx', 'r') as f:
    content = f.read()

# Add a function for updating company status
if 'handleUpdateStatus' not in content:
    update_func = """  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'companies', id), { status: newStatus });
      toast.success('Company status updated!');
      fetchCompanies();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };"""
    content = content.replace("const handleEditSubmit = async () => {", update_func + "\n\n  const handleEditSubmit = async () => {")

# Replace the grid render
start_str = "      {loading ? ("
end_str = "        </div>\n      )\n    </div>\n  );\n}"
idx_start = content.find(start_str)
if idx_start != -1:
    new_render = """      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Companies</TabsTrigger>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          </TabsList>
          
          {['active', 'pending_review'].map(statusGroup => (
            <TabsContent key={statusGroup} value={statusGroup === 'active' ? 'active' : 'pending'}>
              {companies.filter(c => (statusGroup === 'active' ? (c.status === 'active' || !c.status) : c.status === statusGroup)).length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                  <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No {statusGroup === 'active' ? 'active' : 'pending'} companies</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companies.filter(c => (statusGroup === 'active' ? (c.status === 'active' || !c.status) : c.status === statusGroup)).map((company) => (
                    <Card key={company.id}>
                      <CardHeader className="pb-4 relative">
                        <div className="flex justify-between items-start">
                          <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600" onClick={() => openEditDialog(company)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Badge variant="secondary" className={company.status === 'pending_review' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}>
                              {company.status === 'pending_review' ? 'Pending' : 'Active'}
                            </Badge>
                          </div>
                        </div>
                        <CardTitle className="text-xl mt-4">{company.name}</CardTitle>
                        <CardDescription>
                          Admins: {company.adminEmails.length} | Domains: {company.allowedDomains.join(', ')}
                          {company.employeeStrength ? ` | Employees: ${company.employeeStrength}` : ''}
                        </CardDescription>
                      </CardHeader>
                      
                      {company.status === 'pending_review' && (
                        <div className="px-6 pb-6 flex gap-2 mt-2 border-t border-gray-100 pt-4">
                          <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => handleUpdateStatus(company.id!, 'active')}>Approve</Button>
                          <Button className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 border-red-200" variant="outline" onClick={() => handleUpdateStatus(company.id!, 'rejected')}>Reject</Button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}"""
    content = content[:idx_start] + new_render

with open('src/pages/Companies.tsx', 'w') as f:
    f.write(content)
