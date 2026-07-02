import re
with open('src/pages/Companies.tsx', 'r') as f:
    content = f.read()

# Add a mock audit function
audit_func = """  const handleApprove = async (companyId: string) => {
    try {
      await updateDoc(doc(db, 'companies', companyId), { status: 'active' });
      toast.success('Company approved');
      fetchCompanies();
    } catch (e) {
      toast.error('Failed to approve company');
    }
  };

  const handleReject = async (companyId: string) => {
    try {
      await updateDoc(doc(db, 'companies', companyId), { status: 'rejected' });
      toast.success('Company rejected');
      fetchCompanies();
    } catch (e) {
      toast.error('Failed to reject company');
    }
  };"""

if "handleApprove" not in content:
    content = content.replace("  const openEdit = (company: any) => {", audit_func + "\n  const openEdit = (company: any) => {")

# Filter pending vs all
# Find the mapping of companies
if "value=\"all\"" not in content:
    old_tabs = """      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Companies</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">"""
    
    new_tabs = """      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="all">All Companies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Company Name</th>
                    <th className="px-6 py-4">Industry</th>
                    <th className="px-6 py-4">Admins</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {companies.filter((c:any) => c.status === 'pending_review').map((company: any) => (
                    <tr key={company.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{company.name}</td>
                      <td className="px-6 py-4 text-gray-600">{company.industry || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-600">{company.adminEmails?.join(', ')}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" className="text-green-600 border-green-200" onClick={() => handleApprove(company.id)}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => handleReject(company.id)}>
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {companies.filter((c:any) => c.status === 'pending_review').length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No companies pending review
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">"""
    
    content = content.replace(old_tabs, new_tabs)

with open('src/pages/Companies.tsx', 'w') as f:
    f.write(content)
