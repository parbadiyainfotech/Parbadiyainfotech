import { motion } from 'motion/react';
import { Globe, Plus, Trash2, Edit2, CheckCircle2, CloudUpload, Loader2, Save, Camera, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ServiceHighlight, Project } from '@/types';

export function ManageServices() {
  const [showNotification, setShowNotification] = useState(false);
  const [services, setServices] = useState<ServiceHighlight[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Services State
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', icon: '', price: '' });
  const [isAdding, setIsAdding] = useState(false);

  // Projects State
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState({ title: '', imageUrl: '', category: 'CCTV' });

  useEffect(() => {
    // Services
    const qServices = query(collection(db, 'services'), orderBy('createdAt', 'desc'));
    const unsubscribeServices = onSnapshot(qServices, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ServiceHighlight[];
      setServices(docs);
      setLoading(false);
    });

    // Projects
    const qProjects = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(docs);
    });

    return () => {
      unsubscribeServices();
      unsubscribeProjects();
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

  // Service Handlers
  const handleAddService = async () => {
    try {
      await addDoc(collection(db, 'services'), {
        ...editForm,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setEditForm({ title: '', description: '', icon: '', price: '' });
      handleSave();
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const handleUpdateService = async (id: string) => {
    try {
      const docRef = doc(db, 'services', id);
      await updateDoc(docRef, editForm);
      setIsEditing(null);
      handleSave();
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteDoc(doc(db, 'services', id));
        handleSave();
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  // Project Handlers
  const handleAddProject = async () => {
    try {
      await addDoc(collection(db, 'projects'), {
        ...projectForm,
        createdAt: serverTimestamp()
      });
      setIsAddingProject(false);
      setProjectForm({ title: '', imageUrl: '', category: 'CCTV' });
      handleSave();
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const handleUpdateProject = async (id: string) => {
    try {
      await updateDoc(doc(db, 'projects', id), projectForm);
      setIsEditingProject(null);
      handleSave();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Delete this project?')) {
      try {
        await deleteDoc(doc(db, 'projects', id));
        handleSave();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const startEdit = (service: ServiceHighlight) => {
    setIsEditing(service.id);
    setEditForm({ 
      title: service.title, 
      description: service.description, 
      icon: service.icon, 
      price: service.price || '' 
    });
  };

  return (
    <div className="flex-1 flex flex-col relative w-full h-full overflow-x-hidden">
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-4 md:px-10 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div>
           <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Manage Services</h1>
           <p className="text-sm text-slate-600 hidden sm:block">Update your service offerings and project gallery.</p>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full bg-slate-50 relative">
        <div className="absolute inset-0 dot-pattern opacity-50 pointer-events-none"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-12 space-y-6">
            {/* Service Highlights */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xl font-bold text-slate-900">Services Catalog</h3>
                  </div>
                  {!isAdding && (
                    <button 
                      onClick={() => { setIsAdding(true); setIsEditing(null); setEditForm({ title: '', description: '', icon: 'Video', price: '' }); }}
                      className="text-blue-600 font-semibold text-sm hover:bg-blue-50 px-3 py-1 rounded transition-colors flex items-center gap-1 border border-transparent hover:border-blue-200"
                    >
                       <Plus className="w-4 h-4" /> Add New Service
                    </button>
                  )}
                </div>

                {(isAdding || isEditing) && (
                  <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-blue-100 space-y-4">
                    <h4 className="font-bold text-slate-900">{isAdding ? 'Add New Service' : 'Edit Service'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">Service Title</label>
                        <input 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                          placeholder="e.g. CCTV Installation"
                          value={editForm.title}
                          onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">Icon Name (Lucide)</label>
                        <input 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                          placeholder="e.g. Video, Monitor, Printer"
                          value={editForm.icon}
                          onChange={e => setEditForm({ ...editForm, icon: e.target.value })}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">Description</label>
                        <textarea 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                          rows={3}
                          placeholder="Brief description of the service..."
                          value={editForm.description}
                          onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">Price (Optional)</label>
                        <input 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                          placeholder="e.g. Starting from ₹999"
                          value={editForm.price}
                          onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={isAdding ? handleAddService : () => handleUpdateService(isEditing!)}
                        className="bg-blue-600 text-white font-bold text-sm px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                      >
                        {isAdding ? 'Save Service' : 'Update Service'}
                      </button>
                      <button 
                        onClick={() => { setIsAdding(false); setIsEditing(null); }}
                        className="bg-slate-200 text-slate-700 font-bold text-sm px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loading ? (
                    <div className="col-span-full py-10 flex flex-col items-center justify-center text-slate-400 gap-2">
                      <Loader2 className="animate-spin" />
                      <p className="text-sm font-medium">Loading services...</p>
                    </div>
                  ) : services.length === 0 ? (
                    <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                       No services found. Add your first service to show it on the website.
                    </div>
                  ) : (
                    services.map((service) => (
                      <div key={service.id} className="border border-slate-200 rounded p-4 relative group hover:border-blue-400 transition-colors bg-white">
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white shadow-sm rounded border border-slate-100">
                          <button 
                            onClick={() => startEdit(service)}
                            className="text-slate-500 hover:text-blue-600 p-1 rounded hover:bg-slate-100"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteService(service.id)}
                            className="text-slate-500 hover:text-red-600 p-1 rounded hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                            {service.icon.charAt(0)}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{service.title}</h4>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-2">{service.description}</p>
                        {service.price && (
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {service.price}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
            </div>

            {/* Projects & Installation Gallery */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xl font-bold text-slate-900">Installation Gallery</h3>
                  </div>
                  {!isAddingProject && (
                    <button 
                      onClick={() => { setIsAddingProject(true); setIsEditingProject(null); setProjectForm({ title: '', imageUrl: '', category: 'CCTV' }); }}
                      className="text-blue-600 font-semibold text-sm hover:bg-blue-50 px-3 py-1 rounded transition-colors flex items-center gap-1 border border-transparent hover:border-blue-200"
                    >
                       <Plus className="w-4 h-4" /> Add Photo
                    </button>
                  )}
                </div>

                {(isAddingProject || isEditingProject) && (
                  <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-blue-100 space-y-4">
                    <h4 className="font-bold text-slate-900">{isAddingProject ? 'Add Project Photo' : 'Edit Photo'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">Project Title</label>
                        <input 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                          placeholder="e.g. Office Security Setup"
                          value={projectForm.title}
                          onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">Category</label>
                        <select 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                          value={projectForm.category}
                          onChange={e => setProjectForm({ ...projectForm, category: e.target.value })}
                        >
                          <option value="CCTV">CCTV Installation</option>
                          <option value="Computer">Computer Service</option>
                          <option value="Biometric">Biometric System</option>
                          <option value="Intercom">Intercom Setup</option>
                          <option value="Printer">Printer Service</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">Project Photo</label>
                        <div className="flex flex-col gap-3">
                          {projectForm.imageUrl && (
                            <div className="relative aspect-video w-48 rounded-lg overflow-hidden border border-slate-200">
                              <img src={projectForm.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                            </div>
                          )}
                          <label className={cn(
                            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                            uploading === 'projects' ? "bg-slate-50 border-blue-300" : "bg-white border-slate-300 hover:bg-slate-50 hover:border-blue-400"
                          )}>
                            <div className="flex flex-col items-center justify-center">
                              {uploading === 'projects' ? (
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                              ) : (
                                <Camera className="w-8 h-8 text-slate-400 mb-2" />
                              )}
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                                {uploading === 'projects' ? 'Uploading...' : 'Tap to Upload Installation Photo'}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1">PNG, JPG or JPEG (Max 5MB)</p>
                            </div>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const url = await uploadImage(file, 'projects');
                                    setProjectForm({ ...projectForm, imageUrl: url });
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
                        onClick={isAddingProject ? handleAddProject : () => handleUpdateProject(isEditingProject!)}
                        className="bg-blue-600 text-white font-bold text-sm px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                      >
                        {isAddingProject ? 'Save Photo' : 'Update Photo'}
                      </button>
                      <button 
                        onClick={() => { setIsAddingProject(false); setIsEditingProject(null); }}
                        className="bg-slate-200 text-slate-700 font-bold text-sm px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {projects.map((project) => (
                    <div key={project.id} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={project.imageUrl} className="w-full h-full object-cover" alt={project.title} />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                        <p className="text-white text-[10px] font-bold mb-2 uppercase tracking-wider">{project.title}</p>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => {
                              setIsEditingProject(project.id);
                              setProjectForm({ title: project.title, imageUrl: project.imageUrl, category: project.category });
                            }}
                            className="bg-white/20 hover:bg-white/40 p-1.5 rounded transition-colors text-white"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProject(project.id)}
                            className="bg-red-500/80 hover:bg-red-500 p-1.5 rounded transition-colors text-white"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
          <span className="text-sm font-bold tracking-tight">Services updated successfully!</span>
        </motion.div>
      )}
    </div>
  );
}
