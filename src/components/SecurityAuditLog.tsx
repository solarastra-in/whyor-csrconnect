import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, ShieldAlert, UserPlus, Building, Settings as SettingsIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/src/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const getIconForType = (type: string) => {
  switch (type) {
    case 'onboarding': return <Building className="h-4 w-4 text-blue-500" />;
    case 'role': return <UserPlus className="h-4 w-4 text-green-500" />;
    case 'config': return <SettingsIcon className="h-4 w-4 text-purple-500" />;
    case 'security': return <ShieldAlert className="h-4 w-4 text-red-500" />;
    default: return <ShieldAlert className="h-4 w-4 text-gray-500" />;
  }
};

export function SecurityAuditLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const q = query(collection(db, 'platform/auditLog/events'), orderBy('timestamp', 'desc'), limit(50));
      const snap = await getDocs(q);
      const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(fetched);
    } catch (e) {
      console.error('Error fetching security audit logs:', e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const actionStr = log.action || log.event || '';
    const entityStr = log.entity || log.details || '';
    const actorStr = log.actor || log.user || '';
    const matchesSearch = actionStr.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          entityStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          actorStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Security Audit Log</CardTitle>
            <CardDescription>Track administrative actions and system configuration changes</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search logs..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="role">Role Changes</SelectItem>
                <SelectItem value="config">Config Changes</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Event</th>
                <th className="px-4 py-3">Actor / IP</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3 rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, i) => (
                  <tr key={log.id} className={`border-b hover:bg-gray-50 ${i === filteredLogs.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getIconForType(log.type)}
                        <span className="font-medium text-gray-900">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-gray-900">{log.actor}</span>
                        <span className="text-xs text-gray-500">{log.ipAddress}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate" title={log.entity}>
                      {log.entity}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={log.status === 'success' ? 'secondary' : 'destructive'} 
                             className={log.status === 'success' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                        {log.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No matching audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
