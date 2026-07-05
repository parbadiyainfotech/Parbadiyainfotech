import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ServiceHighlight } from '@/types';
import { getIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { useSettings } from '@/hooks/useSettings';

export function Services() {
  const [services, setServices] = useState<ServiceHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    const q = query(collection(db, 'services'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ServiceHighlight[];
      setServices(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Header */}
      <section className="pt-32 pb-16 px-4 md:px-10 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 max-w-2xl"
          >
            <span className="text-xs font-mono text-blue-400 uppercase tracking-[0.3em] font-bold">Solutions Catalog</span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Our Professional Services</h1>
            <p className="text-lg text-slate-400">Comprehensive IT and security infrastructure management tailored for scale and reliability.</p>
          </motion.div>
        </div>
      </section>

      {/* Main Services List */}
      <section className="py-20 px-4 md:px-10 bg-white">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <p className="font-bold text-lg">Loading solutions catalog...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-slate-900 mb-2">No services listed yet</h3>
              <p>Please check back later as we update our professional offerings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-16">
              {services.map((service, index) => (
                <motion.div 
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={cn(
                    "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center",
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  )}
                >
                  <div className={cn("space-y-8", index % 2 === 1 ? "lg:order-2" : "lg:order-1")}>
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                      {getIcon(service.icon, "w-8 h-8")}
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{service.title}</h2>
                        {service.price && (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                            {service.price}
                          </span>
                        )}
                      </div>
                      <p className="text-lg text-slate-600 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                          <span className="text-sm font-bold text-slate-700">Genuine Hardware</span>
                       </div>
                       <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                          <span className="text-sm font-bold text-slate-700">Professional Setup</span>
                       </div>
                    </div>

                    <a href="/#contact" className="inline-flex bg-blue-600 text-white font-bold text-sm px-8 py-4 rounded-lg hover:bg-blue-700 transition-all items-center gap-2 group shadow-lg shadow-blue-500/20 w-fit">
                      Inquire About This Service <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>

                  <div className={cn("relative h-[400px] rounded-3xl overflow-hidden shadow-2xl group", index % 2 === 1 ? "lg:order-1" : "lg:order-2")}>
                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-all duration-700 z-10"></div>
                    <img 
                      src={`https://images.unsplash.com/photo-${index % 3 === 0 ? '1557597774-9d273605dfa9' : index % 3 === 1 ? '1558494949-ef010cbdcc48' : '1593583845845-7d67ede93328'}?q=80&w=1000&auto=format&fit=crop`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                      alt={service.title} 
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-10 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-10 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Need a Custom Infrastructure Solution?</h2>
          <p className="text-lg text-slate-400">Our engineers can design a custom security or IT setup tailored to your specific organizational requirements.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/#contact" className="w-full sm:w-auto bg-blue-600 text-white font-bold px-10 py-4 rounded-lg hover:bg-blue-700 transition-colors shadow-xl shadow-blue-500/20">
              Get Started Now
            </a>
            <a href={`tel:${settings.phone}`} className="w-full sm:w-auto bg-white/10 text-white font-bold px-10 py-4 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm">
              Call Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
