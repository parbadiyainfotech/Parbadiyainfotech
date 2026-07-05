import { useState, useEffect } from 'react';
import { ClipboardList, Loader2, Phone, Calendar, User, Search, Filter, MessageSquare } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { ServiceRequest } from '@/types';

export function ServiceRequests() {
  const [inquiries, setInquiries] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ServiceRequest[];
      setInquiries(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, newStatus: ServiceRequest['status']) => {
    try {
      const docRef = doc(db, 'inquiries', id);
      await updateDoc(docRef, { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const sendWhatsAppUpdate = (inquiry: ServiceRequest) => {
    const cleanPhone = inquiry.phone.replace(/\D/g, '');
    const message = `Hello ${inquiry.clientName}, your request for ${inquiry.serviceType} is now ${inquiry.status}. - Parbadiya Infotech`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Just now';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = String(hours).padStart(2, '0');
    
    return `${day}-${month}-${year} ${hoursStr}:${minutes} ${ampm}`;
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesStatus = filterStatus === 'All' || inquiry.status === filterStatus;
    const matchesSearch = inquiry.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         inquiry.phone.includes(searchTerm) ||
                         inquiry.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const inquiryDate = inquiry.createdAt?.toDate();
    let matchesDate = true;
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (inquiryDate && inquiryDate < start) matchesDate = false;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (inquiryDate && inquiryDate > end) matchesDate = false;
    }

    return matchesStatus && matchesSearch && matchesDate;
  });

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Service Requests</h1>
          <p className="text-slate-600 mt-1">View and manage all customer inquiries in detail.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by name, phone or service..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">From:</span>
              <input 
                type="date" 
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">To:</span>
              <input 
                type="date" 
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="text-slate-400 w-4 h-4" />
              <select 
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium min-w-[140px]"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {(searchTerm || filterStatus !== 'All' || startDate || endDate) && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('All');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 md:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
           <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
             All Requests
             {loading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
           </h2>
           <span className="text-xs font-mono font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded">
             {filteredInquiries.length} Total
           </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 bg-slate-50/50">
                <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider font-semibold">Client Details</th>
                <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider font-semibold">Service Type</th>
                <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider font-semibold">Status</th>
                <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider font-semibold">Date</th>
                <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInquiries.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-500 font-medium">
                    {searchTerm || filterStatus !== 'All' ? 'No results matching your filters.' : 'No service requests found yet.'}
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <User size={14} className="text-slate-400" />
                          {inquiry.clientName}
                        </span>
                        <span className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                          <Phone size={14} className="text-slate-400" />
                          {inquiry.phone}
                        </span>
                        <button 
                          onClick={() => sendWhatsAppUpdate(inquiry)}
                          className="mt-3 flex items-center gap-2 text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-100 transition-all w-fit"
                        >
                          <MessageSquare size={12} />
                          Send WhatsApp Update
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {inquiry.serviceType}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                       <span className={cn("inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold", getStatusColor(inquiry.status))}>
                         {inquiry.status}
                       </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar size={14} className="text-slate-400" />
                        {formatDate(inquiry.createdAt?.toDate())}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <select 
                        className="text-xs font-bold border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                        value={inquiry.status}
                        onChange={(e) => updateStatus(inquiry.id, e.target.value as any)}
                      >
                        <option value="Pending">Mark Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
