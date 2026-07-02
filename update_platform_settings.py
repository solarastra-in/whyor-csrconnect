import re
with open('src/pages/PlatformSettings.tsx', 'r') as f:
    content = f.read()

tabs_list_old = """        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="smtp">SMTP & Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
        </TabsList>"""

tabs_list_new = """        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="smtp">SMTP & Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
        </TabsList>"""

users_tab = """        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User & Role Management</CardTitle>
              <CardDescription>Search for users across the platform, view their current roles, and manage access.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <Input placeholder="Search users by email..." className="max-w-md" />
                <Button>Invite User</Button>
              </div>
              <div className="border rounded-md">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">User Email</th>
                      <th className="px-4 py-3 font-medium">Platform Role</th>
                      <th className="px-4 py-3 font-medium">Company Context</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-4 py-3 font-medium">solarastra.in@gmail.com</td>
                      <td className="px-4 py-3"><Badge>Platform Admin</Badge></td>
                      <td className="px-4 py-3 text-gray-500">Global</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => toast('Cannot edit your own super-admin role')}>Edit</Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">acme.admin@example.com</td>
                      <td className="px-4 py-3"><Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">Company Admin</Badge></td>
                      <td className="px-4 py-3 text-gray-500">Acme Corp</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => toast('Revoke access dialog would open here')}>Revoke</Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">employee@acme.com</td>
                      <td className="px-4 py-3"><Badge variant="outline" className="text-gray-700 bg-gray-50 border-gray-200">Employee</Badge></td>
                      <td className="px-4 py-3 text-gray-500">Acme Corp</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => toast('Edit access dialog would open here')}>Edit</Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>"""

if 'value="users"' not in content:
    content = content.replace(tabs_list_old, tabs_list_new)
    content = content.replace('<TabsContent value="smtp" className="space-y-6">', users_tab + '\n        <TabsContent value="smtp" className="space-y-6">')

with open('src/pages/PlatformSettings.tsx', 'w') as f:
    f.write(content)
