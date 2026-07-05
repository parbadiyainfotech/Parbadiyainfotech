import { motion } from 'motion/react';
import { Store, Loader2, Save, MapPin, Phone, Mail, MessageSquare as WhatsApp, Instagram, Facebook } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';

export function BusinessSettings() {
  const [showNotification, setShowNotification] = useState(false);
  const [businessInfo, setBusinessInfo] = useState({
    phone: '8849183347',
    email: 'parbadiyainfotech@gmail.com',
    address: 'Karnala para, Post ghodiyal, Taluka Vadgam, District Banaskantha, Pin 385421',
    mapsUrl: 'https://maps.app.goo.gl/...',
    whatsapp: '',
    instagramUrl: '',
    facebookUrl: '',
  });
  const [savingBusiness, setSavingBusiness] = useState(false);

  useEffect(() => {
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'business'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setBusinessInfo(prev => ({
          ...prev,
          ...data
        }));
      }
    });

    return () => unsubscribeSettings();
  }, []);

  const handleSave = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleSaveBusinessInfo = async () => {
    setSavingBusiness(true);
    try {
      await updateDoc(doc(db, 'settings', 'business'), {
        ...businessInfo,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      if (error.code === 'not-found') {
        await setDoc(doc(db, 'settings', 'business'), {
          ...businessInfo,
          updatedAt: serverTimestamp()
        });
      } else {
        console.error('Error saving business info:', error);
      }
    } finally {
      setSavingBusiness(false);
      handleSave();
    }
  };

  return (
    <div className="flex-1 flex flex-col relative w-full h-full overflow-x-hidden">
      {/* Floating Save Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSaveBusinessInfo}
        disabled={savingBusiness}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[60] bg-blue-600 text-white px-5 py-3 md:px-6 md:py-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 md:gap-3 group border border-blue-500/50"
      >
        {savingBusiness ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        <span className="font-bold text-xs md:text-sm">Save Settings</span>
      </motion.button>

      {/* Header */}
      <header className="h-20 flex items-center justify-between px-4 md:px-10 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div>
           <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Business Settings</h1>
           <p className="text-sm text-slate-600 hidden sm:block">Update your contact details and social links.</p>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 p-4 md:p-10 max-w-4xl mx-auto w-full bg-slate-50 relative">
        <div className="absolute inset-0 dot-pattern opacity-50 pointer-events-none"></div>
        <div className="relative z-10 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Store className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-bold text-slate-900">Business Details</h3>
            </div>
            <div className="space-y-5">
               <div>
                 <label className="block text-xs font-mono font-semibold text-slate-600 mb-2 uppercase">Shop Name</label>
                 <input 
                   className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-500 cursor-not-allowed" 
                   type="text" 
                   value="Parbadiya Infotech" 
                   disabled
                 />
                 <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono">Company name is fixed</p>
               </div>
               <div>
                 <label className="block text-xs font-mono font-semibold text-slate-600 mb-2 uppercase">Address</label>
                 <textarea 
                   className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all resize-none" 
                   rows={3} 
                   value={businessInfo.address}
                   onChange={e => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                 />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-mono font-semibold text-slate-600 mb-2 uppercase">Mobile</label>
                   <input 
                     className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all" 
                     type="tel" 
                     value={businessInfo.phone}
                     onChange={e => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-mono font-semibold text-slate-600 mb-2 uppercase">Email</label>
                   <input 
                     className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all" 
                     type="email" 
                     value={businessInfo.email}
                     onChange={e => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                   />
                 </div>
               </div>
               <div>
                 <label className="block text-xs font-mono font-semibold text-slate-600 mb-2 uppercase">Google Maps URL</label>
                 <input 
                   className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all" 
                   type="url" 
                   value={businessInfo.mapsUrl}
                   onChange={e => setBusinessInfo({ ...businessInfo, mapsUrl: e.target.value })}
                 />
               </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-bold text-slate-900">Social Media Links</h3>
            </div>
            <div className="space-y-5">
               <div>
                  <label className="block text-xs font-mono font-semibold text-slate-600 mb-2 uppercase flex items-center gap-2">
                    <WhatsApp size={14} className="text-green-500" /> WhatsApp Number
                  </label>
                  <input 
                    className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all" 
                    type="tel" 
                    placeholder="e.g. 918849183347"
                    value={businessInfo.whatsapp}
                    onChange={e => setBusinessInfo({ ...businessInfo, whatsapp: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-600 mb-2 uppercase flex items-center gap-2">
                    <Instagram size={14} className="text-pink-500" /> Instagram Profile URL
                  </label>
                  <input 
                    className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all" 
                    type="url" 
                    placeholder="https://instagram.com/yourprofile"
                    value={businessInfo.instagramUrl}
                    onChange={e => setBusinessInfo({ ...businessInfo, instagramUrl: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-600 mb-2 uppercase flex items-center gap-2">
                    <Facebook size={14} className="text-blue-600" /> Facebook Page URL
                  </label>
                  <input 
                    className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all" 
                    type="url" 
                    placeholder="https://facebook.com/yourpage"
                    value={businessInfo.facebookUrl}
                    onChange={e => setBusinessInfo({ ...businessInfo, facebookUrl: e.target.value })}
                  />
                </div>
            </div>
          </div>

          <button 
             onClick={handleSaveBusinessInfo}
             disabled={savingBusiness}
             className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
             {savingBusiness ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} 
             Update All Settings
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {showNotification && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl border border-white/10"
        >
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle2 size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">Changes saved successfully!</span>
        </motion.div>
      )}
    </div>
  );
}

// Re-using icon for notification
import { CheckCircle2, Globe } from 'lucide-react';
