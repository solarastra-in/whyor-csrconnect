import re
with open('src/pages/Charities.tsx', 'r') as f:
    content = f.read()

bad_table = """                <Table>
                  <TableHeader>
                    <TableRow>
                      <th className="w-12 px-6 py-4">
                        <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" onChange={(e) => handleSelectAll(e.target.checked)} />
                      </th>
                      <th className="px-6 py-4 font-medium text-left">Organization Details</th>
                      <th className="px-6 py-4 font-medium">Focus Area</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCharities.map((charity) => (
                      <TableRow key={charity.id} className="hover:bg-gray-50/50">
                        <TableCell className="px-6">
                          <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={selectedCharities.includes(charity.id)}
                            onChange={(e) => handleSelectCharity(charity.id, e.target.checked)} />
                        </TableCell>
                        <TableCell className="px-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{charity.name}</p>
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" /> {charity.location}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 text-center text-gray-600">
                          {charity.focus}
                        </TableCell>
                        <TableCell className="px-6 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${charity.status === 'approved' ? 'bg-green-50 text-green-700 hover:bg-green-100' :
                              charity.status === 'archived' ? 'bg-gray-100 text-gray-700 hover:bg-gray-100' :
                                'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                            }`}>
                            {charity.status ? charity.status.charAt(0).toUpperCase() + charity.status.slice(1) : 'Pending'}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => { setEditingCharity(charity); setEditModalOpen(true); }} className="text-gray-600">Edit</Button>
                          {charity.status === 'pending_verification' && (
                              <Button variant="default" size="sm" onClick={() => handleUpdateStatus(charity.id, 'approved')} className="bg-indigo-600">Approve</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>"""

good_table = """                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="w-12 px-6 py-4">
                        <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" onChange={(e) => handleSelectAll(e.target.checked)} />
                      </th>
                      <th className="px-6 py-4 font-medium text-left">Organization Details</th>
                      <th className="px-6 py-4 font-medium">Focus Area</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {charitiesList.map((charity) => (
                      <tr key={charity.id} className="border-b hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={selectedCharityIds.includes(charity.id)}
                            onChange={(e) => handleSelectCharity(charity.id, e.target.checked)} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{charity.name}</p>
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" /> {charity.location}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {charity.focus}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${charity.status === 'approved' ? 'bg-green-50 text-green-700' :
                              charity.status === 'archived' ? 'bg-gray-100 text-gray-700' :
                                'bg-yellow-50 text-yellow-700'
                            }`}>
                            {charity.status ? charity.status.charAt(0).toUpperCase() + charity.status.slice(1) : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => { setEditingCharity(charity); setEditCharityOpen(true); }} className="text-gray-600">Edit</Button>
                          {charity.status === 'pending_verification' && (
                              <Button variant="default" size="sm" onClick={() => handleUpdateStatus(charity.id, 'approved')} className="bg-indigo-600">Approve</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>"""

content = content.replace(bad_table, good_table)

with open('src/pages/Charities.tsx', 'w') as f:
    f.write(content)
