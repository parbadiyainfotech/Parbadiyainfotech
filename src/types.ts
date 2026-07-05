export interface ServiceRequest {
  id: string;
  clientName: string;
  phone: string;
  serviceType: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  createdAt: any;
}

export interface ServiceHighlight {
  id: string;
  title: string;
  description: string;
  icon: string;
  price?: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  role?: string;
  content: string;
  rating: number;
  avatarUrl?: string;
  isHidden?: boolean;
  createdAt: any;
}

export interface Project {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  createdAt: any;
}

export interface Brand {
  id: string;
  name: string;
  createdAt: any;
}
