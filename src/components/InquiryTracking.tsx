import React, { useState } from 'react';
import { Search, Loader2, CheckCircle2, Clock, XCircle, AlertCircle, Calendar, User, Phone, Tag } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { ServiceRequest } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export function InquiryTracking() {
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ServiceRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    if (!navigator.onLine) {
      setError('You appear to be offline. Please check your internet connection and try again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Try tracking by ID first
      const docRef = doc(db, 'inquiries', trackingId.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setResult({ id: docSnap.id, ...docSnap.data() } as ServiceRequest);
      } else {
        // 2. Try tracking by Phone Number
        const q = query(
          collection(db, 'inquiries'), 
          where('phone', '==', trackingId.trim())
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // If multiple found by phone, show the most recent one
          const docs = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as ServiceRequest));
          // Sort by createdAt desc manually if needed, but docs[0] is usually fine for a quick search
          setResult(docs[0]);
        } else {
          setError('No inquiry found with this ID or Mobile Number. Please check and try again.');
        }
      }
    } catch (err: any) {
      console.error('Tracking error:', err);
      if (err.code === 'unavailable' || err.message?.includes('offline')) {
        setError('Could not connect to the server. Please check your internet connection.');
      } else {
        setError('An error occurred while tracking. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'In Progress': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'Completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'Cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-orange-50 border-orange-100 text-orange-700';
      case 'In Progress': return 'bg-blue-50 border-blue-100 text-blue-700';
      case 'Completed': return 'bg-green-50 border-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-50 border-red-100 text-red-700';
      default: return 'bg-slate-50 border-slate-100 text-slate-700';
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Just now';
    const d = date.toDate();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Track Your Inquiry</h3>
          <p className="text-sm text-slate-600">Enter your Mobile Number or Inquiry ID to check the real-time status of your request.</p>
          
          <form onSubmit={handleTrack} className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Mobile Number or Inquiry ID..." 
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !trackingId.trim()}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              <span>Track Status</span>
            </button>
          </form>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 mx-6 mt-6 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </motion.div>
          )}

          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-6 md:p-8"
            >
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Inquiry Details</span>
                    <h4 className="text-xl font-bold text-slate-900">{result.serviceType}</h4>
                    <p className="text-xs text-slate-400 font-mono">ID: {result.id}</p>
                  </div>
                  <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold shadow-sm", getStatusBg(result.status))}>
                    {getStatusIcon(result.status)}
                    {result.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-0.5">Client Name</p>
                      <p className="text-sm font-bold text-slate-900">{result.clientName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                      <Phone className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-0.5">Mobile Number</p>
                      <p className="text-sm font-bold text-slate-900">{result.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                      <Calendar className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-0.5">Submitted On</p>
                      <p className="text-sm font-bold text-slate-900">{formatDate(result.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                      <Tag className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-0.5">Category</p>
                      <p className="text-sm font-bold text-slate-900">{result.serviceType}</p>
                    </div>
                  </div>
                </div>

                {result.status === 'Pending' && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3 mt-4">
                    <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Your inquiry has been received and is currently in the queue. Our technical team will review it and contact you shortly to discuss the next steps.
                    </p>
                  </div>
                )}

                {result.status === 'In Progress' && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3 mt-4">
                    <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Great news! Our team is actively working on your request. We'll update the status here once the task is completed or if we need more information.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {!result && !error && !loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Search className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm">Your tracking results will appear here.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
