import { motion } from 'motion/react';
import { Quote, Plus, Trash2, Edit2, CheckCircle2, Loader2, Save, Star, User, Eye, EyeOff, X, CloudUpload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Testimonial } from '@/types';

export function TestimonialsManagement() {
  const [showNotification, setShowNotification] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Testimonials State
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false);
  const [isEditingTestimonial, setIsEditingTestimonial] = useState<string | null>(null);
  const [testimonialForm, setTestimonialForm] = useState({ clientName: '', role: '', content: '', rating: 5, avatarUrl: '' });

  useEffect(() => {
    // Testimonials
    const qTestimonials = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
    const unsubscribeTestimonials = onSnapshot(qTestimonials, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Testimonial[];
      setTestimonials(docs);
      setLoading(false);
    });

    return () => unsubscribeTestimonials();
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

  // Testimonial Handlers
  const handleAddTestimonial = async () => {
    try {
      await addDoc(collection(db, 'testimonials'), {
        ...testimonialForm,
        createdAt: serverTimestamp()
      });
      setIsAddingTestimonial(false);
      setTestimonialForm({ clientName: '', role: '', content: '', rating: 5, avatarUrl: '' });
      handleSave();
    } catch (error) {
      console.error('Error adding testimonial:', error);
    }
  };

  const handleUpdateTestimonial = async (id: string) => {
    try {
      await updateDoc(doc(db, 'testimonials', id), testimonialForm);
      setIsEditingTestimonial(null);
      handleSave();
    } catch (error) {
      console.error('Error updating testimonial:', error);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (window.confirm('Delete this testimonial?')) {
      try {
        await deleteDoc(doc(db, 'testimonials', id));
        handleSave();
      } catch (error) {
        console.error('Error deleting testimonial:', error);
      }
    }
  };

  const handleToggleHideTestimonial = async (id: string, currentHidden: boolean) => {
    try {
      await updateDoc(doc(db, 'testimonials', id), { isHidden: !currentHidden });
      handleSave();
    } catch (error) {
      console.error('Error toggling testimonial visibility:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative w-full h-full overflow-x-hidden">
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-4 md:px-10 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div>
           <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Client Testimonials</h1>
           <p className="text-sm text-slate-600 hidden sm:block">Manage and approve customer reviews.</p>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 p-4 md:p-10 max-w-5xl mx-auto w-full bg-slate-50 relative">
        <div className="absolute inset-0 dot-pattern opacity-50 pointer-events-none"></div>
        <div className="relative z-10 space-y-6">
          
            {/* Testimonials Management */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6 shadow-sm mb-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Quote className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xl font-bold text-slate-900">Reviews & Feedback</h3>
                  </div>
                  {!isAddingTestimonial && (
                    <button 
                      onClick={() => { setIsAddingTestimonial(true); setIsEditingTestimonial(null); setTestimonialForm({ clientName: '', role: '', content: '', rating: 5, avatarUrl: '' }); }}
                      className="text-blue-600 font-semibold text-sm hover:bg-blue-50 px-3 py-1 rounded transition-colors flex items-center gap-1 border border-transparent hover:border-blue-200"
                    >
                       <Plus className="w-4 h-4" /> Add Manual Review
                    </button>
                  )}
                </div>

                {(isAddingTestimonial || isEditingTestimonial) && (
                  <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-blue-100 space-y-4">
                    <h4 className="font-bold text-slate-900">{isAddingTestimonial ? 'Add Testimonial' : 'Edit Testimonial'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">Client Name</label>
                        <input 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                          placeholder="e.g. Akbar Parbadiya"
                          value={testimonialForm.clientName}
                          onChange={e => setTestimonialForm({ ...testimonialForm, clientName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">Rating (1-5)</label>
                        <div className="flex items-center gap-2 mt-2">
                           {[1,2,3,4,5].map(num => (
                             <button 
                               key={num} 
                               onClick={() => setTestimonialForm({ ...testimonialForm, rating: num })}
                               className="transition-transform active:scale-90"
                             >
                               <Star size={20} className={cn(num <= testimonialForm.rating ? "text-amber-400 fill-amber-400" : "text-slate-300")} />
                             </button>
                           ))}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">Review Content</label>
                        <textarea 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                          rows={3}
                          placeholder="What did the client say?"
                          value={testimonialForm.content}
                          onChange={e => setTestimonialForm({ ...testimonialForm, content: e.target.value })}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">Client Photo URL (Optional)</label>
                        <div className="flex gap-3 items-center">
                          <input 
                            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="https://..."
                            value={testimonialForm.avatarUrl}
                            onChange={e => setTestimonialForm({ ...testimonialForm, avatarUrl: e.target.value })}
                          />
                          <label className="bg-slate-100 hover:bg-slate-200 p-2 rounded cursor-pointer transition-colors">
                            <CloudUpload size={20} className="text-slate-600" />
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const url = await uploadImage(file, 'testimonials');
                                    setTestimonialForm({ ...testimonialForm, avatarUrl: url });
                                  } catch (err) {
                                    alert('Upload failed');
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={isAddingTestimonial ? handleAddTestimonial : () => handleUpdateTestimonial(isEditingTestimonial!)}
                        className="bg-blue-600 text-white font-bold text-sm px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                      >
                        {isAddingTestimonial ? 'Save Review' : 'Update Review'}
                      </button>
                      <button 
                        onClick={() => { setIsAddingTestimonial(false); setIsEditingTestimonial(null); }}
                        className="bg-slate-200 text-slate-700 font-bold text-sm px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {loading ? (
                    <div className="py-10 flex flex-col items-center justify-center text-slate-400 gap-2">
                      <Loader2 className="animate-spin" />
                      <p className="text-sm font-medium">Loading testimonials...</p>
                    </div>
                  ) : testimonials.length === 0 ? (
                    <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                       No testimonials found.
                    </div>
                  ) : (
                    testimonials.map((t) => (
                      <div key={t.id} className={cn(
                        "p-4 rounded-lg border relative group transition-all",
                        t.isHidden ? "bg-slate-50 border-slate-200 opacity-60" : "bg-white border-slate-200 shadow-sm hover:shadow-md"
                      )}>
                        <div className="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                             onClick={() => handleToggleHideTestimonial(t.id, !!t.isHidden)}
                             className={cn(
                               "p-1.5 rounded transition-colors",
                               t.isHidden ? "text-slate-400 hover:bg-slate-100" : "text-blue-600 hover:bg-blue-50"
                             )}
                             title={t.isHidden ? "Unhide Review" : "Hide Review"}
                           >
                             {t.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                           </button>
                           <button 
                             onClick={() => {
                               setIsEditingTestimonial(t.id);
                               setTestimonialForm({ clientName: t.clientName, role: t.role || '', content: t.content, rating: t.rating, avatarUrl: t.avatarUrl || '' });
                               setIsAddingTestimonial(false);
                               window.scrollTo({ top: 0, behavior: 'smooth' });
                             }}
                             className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"
                             title="Edit Review"
                           >
                             <Edit2 className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => handleDeleteTestimonial(t.id)} 
                             className="text-red-600 hover:bg-red-50 p-1.5 rounded"
                             title="Delete Review"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} className={cn(i < t.rating ? "text-amber-400 fill-amber-400" : "text-slate-200")} />
                            ))}
                          </div>
                          {t.isHidden && (
                            <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">Hidden / Pending</span>
                          )}
                        </div>
                        <p className="text-slate-700 text-sm italic mb-4 leading-relaxed pr-12">"{t.content}"</p>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-blue-700 font-bold text-xs overflow-hidden border border-slate-200">
                            {t.avatarUrl ? (
                              <img src={t.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                            ) : (
                              <User size={14} />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{t.clientName}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">{t.role || 'Verified Customer'}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
            </div>
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
          <span className="text-sm font-bold tracking-tight">Testimonials updated!</span>
        </motion.div>
      )}
    </div>
  );
}
