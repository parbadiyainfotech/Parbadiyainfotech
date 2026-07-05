import { ShieldCheck, CheckCircle2, Video, Monitor, Printer, MapPin, Phone, Mail, ArrowRight, Fingerprint, PhoneForwarded, Facebook, Instagram, MessageSquare as WhatsApp, Clock, Award, Tag, ShieldCheck as Verified, Loader2, Star, Quote, Camera, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { ServiceHighlight, Testimonial, Project, Brand } from '@/types';
import { getIcon } from '@/lib/icons';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';

import { InquiryForm } from '@/components/InquiryForm';
import { InquiryTracking } from '@/components/InquiryTracking';
import { ReviewForm } from '@/components/ReviewForm';

export function Home() {
  const [services, setServices] = useState<ServiceHighlight[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.hash]);

  useEffect(() => {
    // Services
    const qServices = query(collection(db, 'services'), orderBy('createdAt', 'desc'), limit(6));
    const unsubscribeServices = onSnapshot(qServices, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ServiceHighlight[];
      setServices(docs);
      setLoading(false);
    });

    // Testimonials
    const qTestimonials = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
    const unsubscribeTestimonials = onSnapshot(qTestimonials, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Testimonial[];
      // Filter out hidden testimonials and limit to 3
      setTestimonials(docs.filter(t => !t.isHidden).slice(0, 3));
    });

    // Projects
    const qProjects = query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(8));
    const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(docs);
    });

    // Brands
    const qBrands = query(collection(db, 'brands'), orderBy('createdAt', 'desc'));
    const unsubscribeBrands = onSnapshot(qBrands, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Brand[];
      setBrands(docs);
    });

    return () => {
      unsubscribeServices();
      unsubscribeTestimonials();
      unsubscribeProjects();
      unsubscribeBrands();
    };
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-4 md:px-10 overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-slate-200 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-slate-200 px-3 py-1 rounded-full border border-slate-300">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-mono font-medium text-slate-600 uppercase tracking-widest">SECURE IT INFRASTRUCTURE</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
              {settings.heroHeadline?.split('&')[0]} & <br />
              <span className="text-blue-600">{settings.heroHeadline?.split('&')[1] || 'Solutions'}</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-lg">
              {settings.heroSubtext}
            </p>
            <div className="flex gap-4 pt-4">
              <a href="#contact" className="bg-blue-600 text-white font-semibold text-sm px-8 py-4 rounded hover:bg-blue-700 transition-colors shadow-md">
                Get a Quote
              </a>
              <a href="#services" className="border border-slate-300 text-slate-900 font-semibold text-sm px-8 py-4 rounded hover:bg-slate-100 transition-colors">
                View Services
              </a>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden border border-slate-200 shadow-sm group mt-8 md:mt-0"
          >
            <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
            <img 
              className="w-full h-full object-cover" 
              src={settings.heroImageUrl} 
              alt="IT Infrastructure" 
            />
          </motion.div>
        </div>
      </section>

      {/* 2. Track Status Section */}
      <section className="py-12 px-4 md:px-10 bg-white relative z-20 -mt-10">
        <InquiryTracking />
      </section>

      {/* 3. About Section */}
      <section className="py-20 px-4 md:px-10 bg-white" id="about">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 relative h-[300px] rounded-xl overflow-hidden border border-slate-200">
            <img 
              className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 transition-all duration-500" 
              src="https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=2070&auto=format&fit=crop" 
              alt="Technician repairing motherboard" 
            />
          </div>
          <div className="md:col-start-7 md:col-span-6 space-y-6">
            <h2 className="text-3xl font-bold text-slate-900">About Parbadiya Infotech Services</h2>
            <div className="w-12 h-1 bg-blue-600 rounded-full"></div>
            <div className="space-y-4">
              {settings.aboutDescription ? (
                settings.aboutDescription.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-base text-slate-600">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-base text-slate-600 italic">
                  Loading about information...
                </p>
              )}
            </div>
            {settings.aboutBullets && settings.aboutBullets.length > 0 && (
              <ul className="space-y-3 pt-2">
                {settings.aboutBullets.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-base text-slate-900">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* 4. Why Choose Us Section (Dark Blue Block) */}
      <section className="py-24 px-4 md:px-10 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs font-mono text-blue-400 uppercase tracking-widest font-semibold">Our Values</span>
            <h2 className="text-4xl font-bold text-white tracking-tight">Why Choose Parbadiya Infotech?</h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                title: '24/7 Technical Support', 
                desc: 'Round-the-clock assistance for all your critical IT and security systems.',
                icon: Clock 
              },
              { 
                title: 'Certified Technicians', 
                desc: 'Our team consists of highly skilled professionals with years of field experience.',
                icon: Award 
              },
              { 
                title: 'Affordable Pricing', 
                desc: 'Transparent costs and competitive rates without compromising on service quality.',
                icon: Tag 
              },
              { 
                title: 'Genuine Products', 
                desc: 'We only deal in high-quality, authentic hardware from world-trusted brands.',
                icon: Verified 
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors duration-300">
                  <item.icon className="w-6 h-6 text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Bar (Small section between Why Choose Us and Services) */}
      {brands.length > 0 && (
        <section className="py-12 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 md:px-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="shrink-0">
                <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-[0.2em]">Brands We Trust</h2>
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-8 md:gap-12 items-center">
                {brands.map((brand, index) => (
                  <motion.div 
                    key={brand.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-center grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                  >
                    <span className="text-base md:text-xl font-bold text-slate-900 tracking-tighter text-center">
                      {brand.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Professional Services Section */}
      <section className="py-20 px-4 md:px-10 bg-slate-50 relative border-b border-slate-200" id="services">
        <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs font-mono text-blue-600 uppercase tracking-widest font-semibold">Our Expertise</span>
            <h2 className="text-3xl font-bold text-slate-900">Professional Services</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="font-medium">Loading our services...</p>
              </div>
            ) : services.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                <p>Services will be updated soon. Stay tuned!</p>
              </div>
            ) : (
              services.map((service, index) => (
                <motion.div 
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white border border-slate-200 rounded-xl p-8 hover:shadow-xl transition-all duration-300 group flex flex-col h-full cursor-pointer hover:border-blue-500 relative"
                >
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
                    <div className="text-slate-700 group-hover:text-blue-600 transition-colors">
                      {getIcon(service.icon, "w-7 h-7")}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                  <p className="text-slate-600 flex-grow mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
                    <a href="/services" className="font-bold text-sm text-blue-600 flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                      Details <ArrowRight className="w-4 h-4" />
                    </a>
                    {service.price && (
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                        {service.price}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 6. Recent Projects & Client Reviews */}
      <div className="flex flex-col">
        {/* Projects Gallery */}
        {projects.length > 0 && (
          <section className="py-24 px-4 md:px-10 bg-white overflow-hidden border-b border-slate-100">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                <div className="space-y-4 max-w-2xl">
                  <span className="text-xs font-mono text-blue-600 uppercase tracking-[0.3em] font-bold">Installation Gallery</span>
                  <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Recent Projects</h2>
                  <p className="text-lg text-slate-600">Visual proof of our commitment to precision and technical excellence across various installation types.</p>
                </div>
                <div className="flex gap-2">
                  <Camera className="text-slate-200 w-12 h-12" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-lg"
                  >
                    <img 
                      src={project.imageUrl} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      alt={project.title} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                      <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest mb-1">{project.category}</span>
                      <h3 className="text-white font-bold text-lg">{project.title}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials Section */}
        <section className="py-24 px-4 md:px-10 bg-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16 space-y-4">
              <span className="text-xs font-mono text-blue-600 uppercase tracking-[0.3em] font-bold">Client Success</span>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">What Our Clients Say</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Trusted by business owners and residential clients across the region for over a decade.</p>
            </div>

            {testimonials.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative group hover:shadow-xl transition-all duration-300"
                  >
                    <Quote className="absolute top-6 right-8 text-blue-100 w-12 h-12 -z-0" />
                    <div className="flex items-center gap-1 mb-6 relative z-10">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={cn(i < testimonial.rating ? "text-amber-400 fill-amber-400" : "text-slate-200")} />
                      ))}
                    </div>
                    <p className="text-slate-700 text-lg leading-relaxed mb-8 relative z-10">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden border border-slate-200">
                        {testimonial.avatarUrl ? (
                          <img src={testimonial.avatarUrl} className="w-full h-full object-cover" alt={testimonial.clientName} />
                        ) : (
                          testimonial.clientName.charAt(0)
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{testimonial.clientName}</h4>
                        {testimonial.role && <p className="text-xs text-slate-500 uppercase font-mono tracking-widest">{testimonial.role}</p>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Review Submission Form */}
            <div className={cn("max-w-3xl mx-auto", testimonials.length > 0 ? "mt-20" : "mt-10")}>
              <div className="text-center mb-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Share Your Experience</h3>
                <p className="text-slate-600 text-sm">Have we served you recently? We'd love to hear your feedback.</p>
              </div>
              <ReviewForm />
            </div>
          </div>
        </section>
      </div>

      {/* 7. Connect With Us Section */}
      <section className="py-20 px-4 md:px-10 bg-white" id="contact">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-6 md:p-12 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Connect With Us</h2>
              <p className="text-base text-slate-600 mb-8">Reach out for inquiries, support, or to schedule a professional consultation.</p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-200 rounded-lg shrink-0">
                    <MapPin className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-semibold text-slate-600 uppercase mb-1">Office Location</h4>
                    <p className="text-base text-slate-900">{settings.address}</p>
                    {settings.mapsUrl && (
                      <a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:underline mt-2 inline-block">
                        View on Google Maps
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-200 rounded-lg shrink-0">
                    <Phone className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-semibold text-slate-600 uppercase mb-1">Direct Line</h4>
                    <p className="text-base text-slate-900">Mobile: {settings.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-200 rounded-lg shrink-0">
                    <Mail className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-semibold text-slate-600 uppercase mb-1">Digital Support</h4>
                    <p className="text-base text-slate-900">Email: {settings.email}</p>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-6">
                  {settings.facebookUrl && (
                    <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-blue-600 hover:border-blue-600 transition-all shadow-sm">
                      <Facebook size={20} />
                    </a>
                  )}
                  {settings.instagramUrl && (
                    <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-pink-600 hover:border-pink-600 transition-all shadow-sm">
                      <Instagram size={20} />
                    </a>
                  )}
                  {settings.whatsapp && (
                    <a href={`https://wa.me/${settings.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-green-600 hover:border-green-600 transition-all shadow-sm">
                      <WhatsApp size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-8 md:p-12 bg-white">
               <InquiryForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
