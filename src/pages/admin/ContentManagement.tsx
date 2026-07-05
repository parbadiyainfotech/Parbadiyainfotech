import { motion } from 'motion/react';
import { Layout, User, CheckCircle2, Plus, X, CloudUpload, Loader2, Save, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Brand } from '@/types';

export function ContentManagement() {
  const [showNotification, setShowNotification] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Brands State
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [brandForm, setBrandForm] = useState({ name: '' });

  const [businessInfo, setBusinessInfo] = useState({
    heroHeadline: 'Expert CCTV & IT Solutions',
    heroSubtext: 'Professional surveillance and technology services for your home and business infrastructure.',
    heroImageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=2060&auto=format&fit=crop',
    aboutDescription: '',
    aboutBullets: [] as string[]
  });
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const generateWithAI = async (field: 'heroHeadline' | 'aboutDescription') => {
    const prompt = window.prompt(`Enter keywords or a brief prompt for your ${field === 'heroHeadline' ? 'Headline' : 'About Description'}:`);
    if (!prompt) return;

    setIsGenerating(field);
    try {
      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context: field === 'heroHeadline' ? 'hero-headline' : 'about-description' })
      });
      
      const data = await response.json();
      if (data.text) {
        setBusinessInfo(prev => ({ ...prev, [field]: data.text }));
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error('AI Generation failed:', error);
      alert('Failed to generate text. Please try again.');
    } finally {
      setIsGenerating(null);
    }
  };

  useEffect(() => {
    // Brands
    const qBrands = query(collection(db, 'brands'), orderBy('createdAt', 'desc'));
    const unsubscribeBrands = onSnapshot(qBrands, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Brand[];
      setBrands(docs);
      setLoading(false);
    });

    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'business'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as any;
        setBusinessInfo(prev => ({
          ...prev,
          ...data
        }));
      }
    });

    return () => {
      unsubscribeBrands();
      unsubscribeSettings();
    };
  }, []);

  const handleSave = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const [uploading, setUploading] = useState<string | null>(null);

  const uploadImage = async (file: File, folder: string): Promise<string> => {
    setUploading(folder);
    try {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    } finally {
      setUploading(null);
    }
  };

  // Brand Handlers
  const handleAddBrand = async () => {
    if (!brandForm.name) return;
    try {
      await addDoc(collection(db, 'brands'), {
        ...brandForm,
        createdAt: serverTimestamp()
      });
      setIsAddingBrand(false);
      setBrandForm({ name: '' });
      handleSave();
    } catch (error) {
      console.error('Error adding brand:', error);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (window.confirm('Remove this brand logo?')) {
      try {
        await deleteDoc(doc(db, 'brands', id));
        handleSave();
      } catch (error) {
        console.error('Error deleting brand:', error);
      }
    }
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
        <span className="font-bold text-xs md:text-sm">Save Changes</span>
      </motion.button>

      {/* Header */}
      <header className="h-20 flex items-center justify-between px-4 md:px-10 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div>
           <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Content Management</h1>
           <p className="text-sm text-slate-600 hidden sm:block">Manage your Hero, About Us, and Partner sections.</p>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 p-4 md:p-10 max-w-5xl mx-auto w-full bg-slate-50 relative">
        <div className="absolute inset-0 dot-pattern opacity-50 pointer-events-none"></div>
        <div className="relative z-10 space-y-6">
          
           {/* Hero Section Settings */}
           <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Layout className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900">Hero Section</h3>
              </div>
              <div className="space-y-5">
                 <div>
                   <div className="flex items-center justify-between mb-2">
                     <label className="block text-xs font-mono font-semibold text-slate-600 uppercase">Main Headline</label>
                     <button 
                       onClick={() => generateWithAI('heroHeadline')}
                       disabled={isGenerating !== null}
                       className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider transition-colors disabled:opacity-50"
                     >
                       {isGenerating === 'heroHeadline' ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                       Generate with AI
                     </button>
                   </div>
                   <input 
                     className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all" 
                     type="text" 
                     value={businessInfo.heroHeadline}
                     onChange={e => setBusinessInfo({ ...businessInfo, heroHeadline: e.target.value })}
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-mono font-semibold text-slate-600 mb-2 uppercase">Sub-headline / Description</label>
                   <textarea 
                     className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all resize-none" 
                     rows={3} 
                     value={businessInfo.heroSubtext}
                     onChange={e => setBusinessInfo({ ...businessInfo, heroSubtext: e.target.value })}
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-mono font-semibold text-slate-600 mb-2 uppercase">Hero Banner Image</label>
                   <div className="flex flex-col gap-3">
                      {businessInfo.heroImageUrl && (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group">
                          <img src={businessInfo.heroImageUrl} className="w-full h-full object-cover" alt="Hero Preview" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <p className="text-white text-xs font-bold uppercase tracking-widest">Current Image</p>
                          </div>
                        </div>
                      )}
                      <label className={cn(
                        "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                        uploading === 'hero' ? "bg-slate-50 border-blue-300" : "bg-white border-slate-300 hover:bg-slate-50 hover:border-blue-400"
                      )}>
                        <div className="flex flex-col items-center justify-center py-3">
                          {uploading === 'hero' ? (
                            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mb-1" />
                          ) : (
                            <CloudUpload className="w-6 h-6 text-slate-400 mb-1" />
                          )}
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            {uploading === 'hero' ? 'Uploading...' : 'Click to Upload Hero Image'}
                          </p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const url = await uploadImage(file, 'hero');
                                setBusinessInfo({ ...businessInfo, heroImageUrl: url });
                              } catch (err) {
                                alert('Upload failed. Please try again.');
                              }
                            }
                          }}
                        />
                      </label>
                   </div>
                 </div>
              </div>
           </div>

           {/* About Us Management */}
           <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900">About Us Section</h3>
              </div>
              <div className="space-y-5">
                 <div>
                   <div className="flex items-center justify-between mb-2">
                     <label className="block text-xs font-mono font-semibold text-slate-600 uppercase">About Description</label>
                     <button 
                       onClick={() => generateWithAI('aboutDescription')}
                       disabled={isGenerating !== null}
                       className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider transition-colors disabled:opacity-50"
                     >
                       {isGenerating === 'aboutDescription' ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                       Generate with AI
                     </button>
                   </div>
                   <textarea 
                     className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all resize-none" 
                     rows={6} 
                     placeholder="Enter the main description for the About section..."
                     value={businessInfo.aboutDescription}
                     onChange={e => setBusinessInfo({ ...businessInfo, aboutDescription: e.target.value })}
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-mono font-semibold text-slate-600 mb-2 uppercase">Bullet Points (One per line)</label>
                   <textarea 
                     className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all resize-none" 
                     rows={4} 
                     placeholder="Bullet point 1&#10;Bullet point 2&#10;Bullet point 3"
                     value={(businessInfo.aboutBullets || []).join('\n')}
                     onChange={e => setBusinessInfo({ ...businessInfo, aboutBullets: e.target.value.split('\n').filter(line => line.trim() !== '') })}
                   />
                   <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono">Each new line becomes a bullet point with a check icon.</p>
                 </div>
              </div>
           </div>

           {/* Partner Brands Management */}
           <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900">Partner Brands</h3>
              </div>
              <div className="space-y-4">
                {isAddingBrand ? (
                  <div className="flex gap-2">
                    <input 
                      className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none transition-all" 
                      placeholder="Brand Name"
                      value={brandForm.name}
                      onChange={e => setBrandForm({ name: e.target.value })}
                      autoFocus
                    />
                    <button onClick={handleAddBrand} className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700">
                      <Plus size={16} />
                    </button>
                    <button onClick={() => setIsAddingBrand(false)} className="bg-slate-100 text-slate-500 p-1.5 rounded hover:bg-slate-200">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsAddingBrand(true)}
                    className="w-full border-2 border-dashed border-slate-200 py-3 rounded text-slate-500 text-sm font-medium hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Add Brand Logo
                  </button>
                )}

                <div className="flex flex-wrap gap-2">
                  {brands.map(brand => (
                    <div key={brand.id} className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1 flex items-center gap-2 group">
                      <span className="text-xs font-bold text-slate-700">{brand.name}</span>
                      <button onClick={() => handleDeleteBrand(brand.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
           </div>

           <button 
              onClick={handleSaveBusinessInfo}
              disabled={savingBusiness}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
           >
              {savingBusiness ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} 
              Update Hero & About
           </button>
        </div>
      </div>

      {/* Success Notification */}
      {showNotification && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl border border-white/10"
        >
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle2 size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">Content updated successfully!</span>
        </motion.div>
      )}
    </div>
  );
}
