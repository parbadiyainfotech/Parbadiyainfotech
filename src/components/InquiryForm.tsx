import { useState, FormEvent } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CheckCircle2, Loader2, Send } from 'lucide-react';

export function InquiryForm() {
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    serviceType: 'CCTV Installation'
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const services = [
    'CCTV Installation',
    'Computer Repair',
    'Biometric Systems',
    'Intercom Solutions',
    'Printer Maintenance',
    'Other'
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      await addDoc(collection(db, 'inquiries'), {
        ...formData,
        status: 'Pending',
        createdAt: serverTimestamp()
      });
      setStatus('success');
      setFormData({ clientName: '', phone: '', serviceType: 'CCTV Installation' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-xl font-bold text-slate-900 mb-6">Service Inquiry</h3>
      
      {status === 'success' ? (
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>
          <h4 className="text-lg font-bold text-slate-900">Request Submitted!</h4>
          <p className="text-slate-600 text-sm">We'll get back to you shortly.</p>
          <button 
            onClick={() => setStatus('idle')}
            className="text-blue-600 font-semibold text-sm hover:underline"
          >
            Send another request
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="clientName" className="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">Full Name</label>
            <input
              type="text"
              id="clientName"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
              placeholder="Enter your name"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">Phone Number</label>
            <input
              type="tel"
              id="phone"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
              placeholder="+91 00000 00000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="serviceType" className="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">Service Required</label>
            <select
              id="serviceType"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 appearance-none"
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
            >
              {services.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full py-4 bg-blue-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                Request Service
              </>
            )}
          </button>

          {status === 'error' && (
            <p className="text-red-500 text-xs text-center">Failed to send. Please try again later.</p>
          )}
        </form>
      )}
    </div>
  );
}
