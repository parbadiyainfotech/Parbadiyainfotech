import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Facebook, Instagram, Phone as WhatsApp, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { useSettings } from '@/hooks/useSettings';

export function MainLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { settings } = useSettings();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'About Us', path: '/#about' },
    { name: 'Contact Us', path: '/#contact' },
  ];

  const handleNavClick = (path: string) => {
    setIsMobileMenuOpen(false);
    if (path.startsWith('/#')) {
      const id = path.substring(2);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans overflow-x-hidden">
      <header className="bg-white/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-slate-200 transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center h-20 px-4 md:px-10 max-w-7xl mx-auto">
          <Link to="/" className="text-xl md:text-2xl font-bold text-slate-900">
            Parbadiya Infotech
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => handleNavClick(link.path)}
                className={cn(
                  "text-base transition-colors",
                  location.pathname === link.path
                    ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                    : "text-slate-600 hover:text-blue-600"
                )}
              >
                {link.name}
              </Link>
            ))}
            <Link 
              to="/#contact" 
              onClick={() => handleNavClick('/#contact')}
              className="hidden md:inline-flex items-center justify-center bg-blue-600 text-white font-semibold text-sm h-10 px-6 rounded hover:bg-blue-700 transition-colors shadow-sm"
            >
              Request Service
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 flex flex-col gap-4 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => handleNavClick(link.path)}
                className={cn(
                  "text-lg block transition-colors",
                  location.pathname === link.path
                    ? "text-blue-600 font-semibold"
                    : "text-slate-600"
                )}
              >
                {link.name}
              </Link>
            ))}
             <Link 
               to="/#contact" 
               onClick={() => handleNavClick('/#contact')} 
               className="inline-flex w-full items-center justify-center bg-blue-600 text-white font-semibold text-sm h-12 rounded mt-2"
             >
              Request Service
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 w-full border-t border-slate-200 mt-auto">
        <div className="py-12 px-4 md:px-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900 mb-4">
                Parbadiya Infotech
              </div>
              <p className="text-slate-600 text-base max-w-sm">
                 Expert CCTV & IT Solutions. Securing your physical and digital assets with technical precision.
              </p>
            </div>
            <p className="text-slate-500 text-sm mt-8 md:mt-12">
              © 2026 Parbadiya Infotech Services. All rights reserved.
            </p>
          </div>
          
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xs font-mono font-semibold text-slate-900 mb-4 uppercase tracking-wider">Contact Information</h4>
              <ul className="space-y-3 text-base text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-900 min-w-[5rem]">Address:</span>
                  <span>{settings.address}</span>
                </li>
                <li className="flex items-center gap-2">
                   <span className="font-semibold text-slate-900 min-w-[5rem]">Mobile:</span>
                  <span>{settings.phone}</span>
                </li>
                <li className="flex items-center gap-2">
                   <span className="font-semibold text-slate-900 min-w-[5rem]">Email:</span>
                  <span>{settings.email}</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-mono font-semibold text-slate-900 mb-4 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-3 text-base">
                <li><Link to="/" className="text-slate-600 hover:text-blue-600 transition-colors">Home</Link></li>
                <li><Link to="/services" className="text-slate-600 hover:text-blue-600 transition-colors">Services</Link></li>
                <li><Link to="/#contact" onClick={() => handleNavClick('/#contact')} className="text-slate-600 hover:text-blue-600 transition-colors">Contact</Link></li>
                <li className="pt-2 border-t border-slate-200 mt-2">
                  <Link to="/admin/dashboard" className="text-xs font-mono text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Admin Login</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200 py-6">
          <div className="max-w-7xl mx-auto px-4 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-600 transition-colors">
                <Instagram size={20} />
              </a>
              <a href={`https://wa.me/91${settings.phone}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-green-600 transition-colors">
                <WhatsApp size={20} />
              </a>
            </div>
            <p className="text-slate-500 text-sm">
              Designed with precision for Parbadiya Infotech Services.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <motion.a
        href={`https://wa.me/91${settings.phone}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[60] bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-colors flex items-center justify-center group"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={28} />
        <span className="absolute right-full mr-4 bg-white text-slate-900 px-3 py-1.5 rounded-lg text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 whitespace-nowrap pointer-events-none border border-slate-100">
          Instant Inquiry
        </span>
      </motion.a>
    </div>
  );
}
