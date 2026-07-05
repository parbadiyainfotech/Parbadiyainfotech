import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export interface BusinessSettings {
  phone: string;
  email: string;
  address: string;
  mapsUrl: string;
  heroHeadline?: string;
  heroSubtext?: string;
  heroImageUrl?: string;
  whatsapp?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  aboutDescription?: string;
  aboutBullets?: string[];
}

const defaultSettings: BusinessSettings = {
  phone: '8849183347',
  email: 'parbadiyainfotech@gmail.com',
  address: 'Karnala para, Post ghodiyal, Taluka Vadgam, District Banaskantha, Pin 385421',
  mapsUrl: 'https://maps.app.goo.gl/...',
  heroHeadline: 'Expert CCTV & IT Solutions',
  heroSubtext: 'Professional surveillance and technology services for your home and business infrastructure.',
  heroImageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=2060&auto=format&fit=crop',
  whatsapp: '',
  instagramUrl: '',
  facebookUrl: '',
  aboutDescription: 'Based in Gujarat, Parbadiya Infotech Services provides expert CCTV installation, computer repair, and professional IT solutions across Palanpur and the Banas Kantha region. We are dedicated to delivering reliable, high-quality, and affordable technology services to secure and empower your home and business.',
  aboutBullets: [
    'CCTV & Security Setup: Precision installation of top-brand surveillance systems.',
    'IT & Hardware Solutions: Expert computer sales, laptop repair, and network configurations.',
    'Trusted Local Service: Fast on-site technical support across Palanpur and nearby areas.'
  ]
};

export function useSettings() {
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'business'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as BusinessSettings);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { settings, loading };
}
