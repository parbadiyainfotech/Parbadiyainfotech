import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileEdit, History, ExternalLink, LogOut, Menu, X, Settings, Globe, Quote, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export function AdminLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const q = query(collection(db, 'inquiries'), where('status', '==', 'Pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingCount(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Content Management', path: '/admin/content', icon: FileEdit },
    { name: 'Manage Services', path: '/admin/services', icon: Globe },
    { name: 'Client Testimonials', path: '/admin/testimonials', icon: Quote },
    { name: 'Service Requests', path: '/admin/requests', icon: History, badge: pendingCount },
    { name: 'Business Settings', path: '/admin/settings', icon: Settings },
    { name: 'Profile Settings', path: '/admin/profile', icon: User },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen flex">
      {/* SideNavBar (Desktop) */}
      <aside className="fixed left-0 top-0 h-full w-[280px] border-r border-slate-200 bg-slate-900 text-white flex-col py-6 z-50 hidden md:flex">
        <div className="px-6 mb-8 flex items-center gap-4">
          <Link to="/admin/profile" className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center hover:bg-slate-700 transition-colors">
            <span className="text-lg font-bold">P</span>
          </Link>
          <div>
            <Link to="/admin/profile" className="block text-lg font-bold text-white m-0 leading-tight hover:text-blue-400 transition-colors">Parbadiya Admin</Link>
            <p className="text-xs font-mono text-slate-400 mt-1">Systems Manager</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-4 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-r transition-all duration-200 group",
                  isActive
                    ? "bg-white/10 border-l-4 border-blue-500 text-blue-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <link.icon className={cn("w-5 h-5 transition-opacity", isActive ? "opacity-100" : "opacity-50 group-hover:opacity-100")} />
                  <span className="text-sm font-medium">{link.name}</span>
                </div>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-lg shadow-blue-500/20">
                    {link.badge} new
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-4 pt-4 border-t border-slate-800 flex flex-col gap-2">
          <Link to="/" className="flex items-center gap-3 text-slate-400 hover:bg-white/5 px-4 py-3 transition-colors hover:text-white rounded group">
            <ExternalLink className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="text-sm font-medium">Back to Site</span>
          </Link>
          <button className="w-full text-left flex items-center gap-3 text-slate-400 hover:bg-white/5 px-4 py-3 transition-colors hover:text-white rounded group">
            <LogOut className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4">
        <h1 className="text-xl font-bold text-slate-900">Parbadiya Admin</h1>
        <button 
          className="p-2 text-slate-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-slate-900 text-white pt-16 flex flex-col">
          <nav className="flex-1 flex flex-col gap-2 p-4">
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded transition-colors",
                    isActive ? "bg-white/10 text-blue-400" : "text-slate-400"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="w-5 h-5" />
                    <span className="text-base font-medium">{link.name}</span>
                  </div>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {link.badge} new
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-800">
             <Link to="/" className="flex items-center gap-3 text-slate-400 px-4 py-3">
              <ExternalLink className="w-5 h-5" />
              <span className="text-base">Back to Site</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-[280px] pt-16 md:pt-0 min-h-screen bg-slate-50 flex flex-col overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
