import React, { useState, useEffect } from 'react';
import { User, Shield, Key, Mail, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { 
  updateEmail, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export function AdminProfile() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState(auth.currentUser?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      if (auth.currentUser) {
        const docRef = doc(db, 'admin_profile', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRecoveryEmail(docSnap.data().recoveryEmail || '');
        }
      }
    }
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!auth.currentUser) throw new Error('No user logged in');

      // Re-authenticate if changing email or password
      if (newEmail !== auth.currentUser.email || newPassword) {
        if (!currentPassword) {
          throw new Error('Current password is required to change credentials');
        }
        const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
      }

      // Update Email
      if (newEmail !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, newEmail);
      }

      // Update Password
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await updatePassword(auth.currentUser, newPassword);
      }

      // Update Recovery Email and Profile Metadata
      const adminRef = doc(db, 'admin_profile', auth.currentUser.uid);
      const adminSnap = await getDoc(adminRef);
      
      const updateData = {
        recoveryEmail,
        updatedAt: serverTimestamp()
      };

      if (adminSnap.exists()) {
        await updateDoc(adminRef, updateData);
      } else {
        await setDoc(adminRef, updateData);
      }

      setSuccess('Profile updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'An error occurred during update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <User size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Profile</h1>
          <p className="text-slate-500 font-medium">Manage your secure login credentials and recovery settings</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={20} className="shrink-0" />
          <p className="text-sm font-bold">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-4">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">Login Username (Email)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="email"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">Recovery Email</label>
                  <div className="relative">
                    <RefreshCw className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="email"
                      placeholder="backup-email@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">
                  <Key size={16} className="text-blue-600" />
                  Security Credentials
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">Current Password (Required for changes)</label>
                    <input 
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">New Password (Optional)</label>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">Confirm New Password</label>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : <Shield className="w-5 h-5" />}
                  Save Profile Settings
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-4 font-mono">Security Advice</h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="shrink-0 w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">Use a password with at least 12 characters including symbols.</p>
              </li>
              <li className="flex gap-3">
                <div className="shrink-0 w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">Update your credentials every 90 days for maximum security.</p>
              </li>
              <li className="flex gap-3">
                <div className="shrink-0 w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">Recovery email is used if you lose access to your primary account.</p>
              </li>
            </ul>
          </div>
          
          <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl">
            <h4 className="text-sm font-bold text-blue-900 mb-2">Need Help?</h4>
            <p className="text-sm text-blue-700/80 leading-relaxed">If you face any issues while updating your credentials, contact our technical support team immediately.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
