export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  clientLocation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export enum Section {
  HOME = 'home',
  SERVICES = 'services',
  PORTFOLIO = 'portfolio',
  ABOUT = 'about',
  CONTACT = 'contact'
}