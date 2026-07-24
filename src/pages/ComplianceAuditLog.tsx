import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Loader2, ShieldCheck, Download, Search, RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ComplianceAuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPermissionError, setHasPermissionError] = useState(false);

  // Filters state
  const [actionFilter, setActionFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setHasPermissionError(false);
    try {
      const q = query(collection(db, 'platform/auditLog/events'), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLogs(data);
    } catch (e: any) {
      console.error('Error fetching audit logs:', e);
      if (e?.code === 'permission-denied' || e?.message?.includes('permission')) {
        setHasPermissionError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Get unique action types for filter dropdown
  const actionTypes: string[] = Array.from(new Set(logs.map(l => l.action).filter(Boolean))) as string[];

  // Filter logic
  const filteredLogs = logs.filter(log => {
    if (actionFilter && log.action !== actionFilter) return false;

    if (userIdFilter) {
      const term = userIdFilter.toLowerCase();
      const performedBy = (log.performedBy || '').toLowerCase();
      if (!performedBy.includes(term)) return false;
    }

    if (startDate) {
      const sDate = new Date(startDate);
      sDate.setHours(0, 0, 0, 0);
      const logTime = new Date(log.timestamp);
      if (logTime < sDate) return false;
    }

    if (endDate) {
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      const logTime = new Date(log.timestamp);
      if (logTime > eDate) return false;
    }

    return true;
  });

  // Calculate chart data for volume of administrative actions over the last 30 days
  const getChartData = () => {
    const chartMap: { [dateStr: string]: number } = {};
    
    // Initialize the last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      chartMap[dateStr] = 0;
    }
    
    // Aggregate log counts by day
    logs.forEach(log => {
      const logDate = new Date(log.timestamp);
      const dateStr = logDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (dateStr in chartMap) {
        chartMap[dateStr]++;
      }
    });
    
    return Object.keys(chartMap).map(date => ({
      date,
      Actions: chartMap[date]
    }));
  };

  const chartData = getChartData();

  const exportCSV = () => {
    const targetLogs = filteredLogs.length > 0 ? filteredLogs : logs;
    if (targetLogs.length === 0) return;
    const headers = ['Timestamp', 'Action', 'Entity ID', 'Performed By'];
    const rows = targetLogs.map(l => [
      new Date(l.timestamp).toISOString(),
      `"${l.action || ''}"`,
      `"${l.charityId || l.companyId || l.entityId || ''}"`,
      `"${l.performedBy || ''}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `compliance_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (hasPermissionError) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <Card className="border-red-200 bg-red-50/50 shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 border border-red-200 flex items-center justify-center mb-2">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-900">Platform Staff Access Required</CardTitle>
            <CardDescription className="text-red-700/90 max-w-md mx-auto mt-1">
              Platform compliance and administrative audit trails are restricted exclusively to authorized Platform Staff and Governance Administrators.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            Compliance Audit Log
          </h1>
          <p className="text-gray-500 mt-1">Track administrative actions, role changes, and configuration updates securely.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchLogs} variant="outline" size="sm" className="flex items-center gap-2 border-gray-200">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <Button onClick={exportCSV} variant="outline" size="sm" className="flex items-center gap-2 bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100">
            <Download className="w-4 h-4" /> Export Trail
          </Button>
        </div>
      </div>

      {/* Chart Section */}
      <Card className="border border-gray-100 shadow-sm bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-900">Activity Volume (Last 30 Days)</CardTitle>
          <CardDescription>Daily breakdown of administrative and compliance-related actions on the platform.</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="#9ca3af" fontSize={11} />
                <YAxis tickLine={false} axisLine={false} stroke="#9ca3af" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                  cursor={{ fill: '#f9fafb' }}
                />
                <Bar dataKey="Actions" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900">System Activity Logs</CardTitle>
          <CardDescription>Secure, immutable log entries of all admin-initiated activity.</CardDescription>        
        </CardHeader>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4 bg-gray-50/70 border-y border-gray-100">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Action Type</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">All Actions</option>
              {actionTypes.map(type => (
                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Performed By</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="User ID or email..."
                value={userIdFilter}
                onChange={(e) => setUserIdFilter(e.target.value)}
                className="w-full h-9 rounded-md border border-gray-200 bg-white pl-8 pr-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">End Date</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
              {(actionFilter || userIdFilter || startDate || endDate) && (
                <Button
                  onClick={() => {
                    setActionFilter('');
                    setUserIdFilter('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead className="w-1/4">Timestamp</TableHead>
                  <TableHead className="w-1/4">Action</TableHead>
                  <TableHead className="w-1/4">Performed By</TableHead>
                  <TableHead className="w-1/4">Entity Affected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        <span className="text-sm text-gray-500">Loading audit trail...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                      No matching audit records found. Try adjusting your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map(log => (
                    <TableRow key={log.id} className="hover:bg-gray-50/30">
                      <TableCell className="font-mono text-sm text-gray-600">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 capitalize">
                          {(log.action || '').replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-700">{log.performedBy}</TableCell>
                      <TableCell className="font-mono text-xs text-gray-500">
                        {log.charityId || log.companyId || log.entityId || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
