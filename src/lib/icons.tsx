import { 
  Video, Monitor, Printer, Fingerprint, PhoneForwarded, 
  ShieldCheck, Server, Cpu, Database, Network, 
  Settings, Wrench, HardDrive, Wifi, Smartphone, 
  MessageSquare, Layout, Globe, Lock, Shield
} from 'lucide-react';

const icons: Record<string, any> = {
  Video,
  Monitor,
  Printer,
  Fingerprint,
  PhoneForwarded,
  ShieldCheck,
  Server,
  Cpu,
  Database,
  Network,
  Settings,
  Wrench,
  HardDrive,
  Wifi,
  Smartphone,
  MessageSquare,
  Layout,
  Globe,
  Lock,
  Shield
};

export function getIcon(name: string, className?: string) {
  const Icon = icons[name] || Settings;
  return <Icon className={className} />;
}
