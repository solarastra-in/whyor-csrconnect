import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2, UploadCloud, Lock, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  category: string;
}

const mockDocuments: Document[] = [
  { id: '1', name: 'Annual_Impact_Report_2025.pdf', type: 'PDF', size: '2.4 MB', uploadDate: '2026-06-15', category: 'Impact Reports' },
  { id: '2', name: 'Volunteer_Safety_Guidelines.pdf', type: 'PDF', size: '850 KB', uploadDate: '2026-05-20', category: 'Guidelines' },
  { id: '3', name: 'Project_Alpha_Brief.pdf', type: 'PDF', size: '1.2 MB', uploadDate: '2026-07-01', category: 'Project Briefs' },
];

export function DocumentRepository({ isAdmin = false, projectId }: { isAdmin?: boolean, projectId?: string }) {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpload = () => {
    // Mock upload
    const newDoc: Document = {
      id: Math.random().toString(36).substr(2, 9),
      name: `New_Document_${Math.floor(Math.random() * 100)}.pdf`,
      type: 'PDF',
      size: '1.5 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      category: 'Project Briefs',
    };
    setDocuments([newDoc, ...documents]);
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-4 border-b border-gray-100 flex flex-row items-center justify-between bg-gray-50/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-md">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-lg">Secure Document Repository</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Guidelines, briefs, and impact reports</p>
          </div>
        </div>
        {isAdmin && (
          <Button onClick={handleUpload} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <UploadCloud className="w-4 h-4 mr-2" /> Upload File
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search documents..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-gray-50 border-gray-200" 
            />
          </div>
        </div>
        <div className="divide-y divide-gray-100 bg-white">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 text-red-600 rounded">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">{doc.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span className="font-medium bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{doc.category}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>{doc.uploadDate}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 text-gray-500 hover:text-blue-600">
                  <Download className="w-4 h-4 mr-1.5" /> Download
                </Button>
                {isAdmin && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(doc.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {filteredDocs.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">
              No documents found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
