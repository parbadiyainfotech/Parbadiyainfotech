import React, { useState, useRef } from 'react';
import { Star, Camera, Loader2, CheckCircle2, X } from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { cn } from '@/lib/utils';

export function ReviewForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    clientName: '',
    content: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    try {
      let avatarUrl = '';
      if (avatarFile) {
        const storageRef = ref(storage, `testimonials/${Date.now()}_${avatarFile.name}`);
        const uploadResult = await uploadBytes(storageRef, avatarFile);
        avatarUrl = await getDownloadURL(uploadResult.ref);
      }

      await addDoc(collection(db, 'testimonials'), {
        clientName: formData.clientName,
        content: formData.content,
        rating,
        avatarUrl,
        isHidden: true, // Always hidden for admin approval
        createdAt: serverTimestamp(),
      });

      setIsSuccess(true);
      setFormData({ clientName: '', content: '' });
      setRating(0);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Review Submitted!</h3>
        <p className="text-slate-600 text-sm">
          Thank you for your feedback. Your review has been sent to our team for approval and will appear on the website soon.
        </p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="text-blue-600 font-bold text-sm hover:underline"
        >
          Write another review
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        Write a Review
      </h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col items-center gap-4 mb-2">
          <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Rate Your Experience</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star 
                  size={32} 
                  className={cn(
                    "transition-colors",
                    (hoverRating || rating) >= star ? "text-amber-400 fill-amber-400" : "text-slate-200"
                  )} 
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest ml-1">Your Full Name</label>
            <input 
              required
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g. Akbar Parbadiya"
              value={formData.clientName}
              onChange={e => setFormData({ ...formData, clientName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest ml-1">Photo (Optional)</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-lg text-xs font-bold transition-all border border-slate-200"
              >
                <Camera size={16} />
                {avatarFile ? 'Change Photo' : 'Upload Photo'}
              </button>
              {avatarPreview && (
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-blue-200">
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest ml-1">Your Feedback</label>
          <textarea 
            required
            rows={4}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
            placeholder="Share your experience with our services..."
            value={formData.content}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
          />
        </div>

        <button 
          disabled={isSubmitting}
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </button>
        <p className="text-[10px] text-center text-slate-400 font-mono uppercase tracking-tighter italic">
          Reviews are subject to admin approval before appearing on the site.
        </p>
      </form>
    </div>
  );
}
