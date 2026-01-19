import React, { useState, useRef, useEffect } from 'react';
import { 
  Printer, 
  Package, 
  Globe, 
  Award, 
  CheckCircle, 
  ArrowRight, 
  MessageSquare, 
  Send, 
  X,
  Menu,
  PenTool,
  MapPin,
  TrendingDown,
  Plane,
  Upload,
  FileVideo,
  Image as ImageIcon,
  Leaf,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { Section, PortfolioItem, Service, ChatMessage } from './types';
import { sendMessageToGemini } from './services/geminiService';

// --- Mock Data ---

const SERVICES: Service[] = [
  {
    id: '1',
    title: 'Personalized Printing',
    description: 'From custom stickers to marketing brochures, we tailor every print to your brand identity.',
    icon: 'printer',
    features: ['High-Quality Digital & Offset', 'Variable Data Printing', 'Custom Stationery']
  },
  {
    id: '2',
    title: 'Rare Craft Packaging',
    description: 'Specialized structural design and unique materials for products that need to stand out.',
    icon: 'package',
    features: ['Rigid & Gift Boxes', 'Embossing & Foil Stamping', 'Complex Structures']
  },
  {
    id: '3',
    title: 'Design & Prototyping',
    description: 'Don\'t have a file? No problem. Our Shanghai design team can create the perfect packaging for you.',
    icon: 'pen',
    features: ['Structural Engineering', '3D Mockups', 'Sample Making']
  }
];

const INITIAL_PORTFOLIO: PortfolioItem[] = [
  {
    id: '1',
    title: 'Handcrafted Tea Set Box',
    category: 'Rare Craft',
    mediaUrl: 'https://picsum.photos/id/225/800/600',
    mediaType: 'image',
    clientLocation: 'Kyoto, Japan'
  },
  {
    id: '2',
    title: 'Luxury Perfume Packaging',
    category: 'Rigid Box',
    mediaUrl: 'https://picsum.photos/id/20/800/600',
    mediaType: 'image',
    clientLocation: 'Paris, France'
  },
  {
    id: '3',
    title: 'Limited Edition Art Prints',
    category: 'Personalized Printing',
    mediaUrl: 'https://picsum.photos/id/24/800/600',
    mediaType: 'image',
    clientLocation: 'New York, USA'
  },
  {
    id: '4',
    title: 'Eco-Friendly Jewelry Box',
    category: 'Sustainable Design',
    mediaUrl: 'https://picsum.photos/id/119/800/600',
    mediaType: 'image',
    clientLocation: 'Berlin, Germany'
  }
];

// --- Components ---

const Navbar = ({ activeSection, scrollToSection }: { 
  activeSection: Section, 
  scrollToSection: (s: Section) => void
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => scrollToSection(Section.HOME)}>
            <div className="w-10 h-10 bg-accent text-white flex items-center justify-center rounded-lg mr-2 font-serif font-bold text-2xl shadow-lg shadow-accent/30">
              O
            </div>
            <span className="font-serif font-bold text-xl tracking-tight text-primary">OUYI</span>
          </div>
          
          <div className="hidden md:flex space-x-8 items-center">
            {[Section.SERVICES, Section.PORTFOLIO, Section.ABOUT].map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`text-sm font-medium transition-colors hover:text-accent uppercase tracking-wide ${
                  activeSection === section ? 'text-accent' : 'text-gray-600'
                }`}
              >
                {section}
              </button>
            ))}
            <button 
              onClick={() => scrollToSection(Section.CONTACT)}
              className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-slate-700 transition-colors shadow-lg shadow-primary/20"
            >
              Contact Us
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {[Section.SERVICES, Section.PORTFOLIO, Section.ABOUT, Section.CONTACT].map((section) => (
              <button
                key={section}
                onClick={() => {
                  scrollToSection(section);
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-accent hover:bg-gray-50 uppercase"
              >
                {section}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const ChatWidget = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 'welcome', 
      role: 'model', 
      text: 'Ni hao! I am Ouyi AI. Whether you are a small business or a large enterprise, I can help you with packaging solutions from Shanghai. How can I help you today?' 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const history = messages.map(m => ({ role: m.role, text: m.text }));
    const responseText = await sendMessageToGemini(history, userMsg.text);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  if (!isOpen) return (
    <button 
      onClick={onClose} 
      className="fixed bottom-6 right-6 z-40 bg-accent text-white p-4 rounded-full shadow-2xl hover:bg-rose-700 transition-all hover:scale-105 flex items-center gap-2 group"
    >
      <MessageSquare size={24} />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-medium">
        Chat with Ouyi
      </span>
    </button>
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden h-[600px] max-h-[80vh] animate-fade-in-up">
      <div className="bg-primary p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <div className="bg-green-400 w-2 h-2 rounded-full animate-pulse"></div>
          <div>
            <h3 className="font-bold text-sm">Ouyi Assistant</h3>
            <p className="text-xs text-gray-300">Live from Shanghai</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 no-scrollbar">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-accent text-white rounded-tr-sm' 
                  : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about price, quantity, or design..."
            className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-accent focus:outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="bg-primary text-white p-3 rounded-full hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Upload Portal Component ---
const UploadPortal = ({ isOpen, onClose, onUpload }: { isOpen: boolean, onClose: () => void, onUpload: (item: PortfolioItem) => void }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video'>('image');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setFileType(selectedFile.type.startsWith('video') ? 'video' : 'image');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !location || !preview) return;

    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      title,
      category,
      mediaUrl: preview, // Using Blob URL for demo
      mediaType: fileType,
      clientLocation: location
    };

    onUpload(newItem);
    onClose();
    // Reset form
    setTitle('');
    setCategory('');
    setLocation('');
    setFile(null);
    setPreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="bg-primary text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-accent p-2 rounded-lg">
               <Upload size={20} className="text-white" />
             </div>
             <div>
               <h3 className="text-xl font-bold">Showcase Upload Portal</h3>
               <p className="text-xs text-slate-300">Add new items to the website portfolio</p>
             </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-accent hover:bg-slate-50 transition-colors relative cursor-pointer group">
              <input 
                type="file" 
                onChange={handleFileChange} 
                accept="image/*,video/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {!preview ? (
                <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-accent transition-colors">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                    <ImageIcon size={32} />
                  </div>
                  <p className="font-medium">Drag & drop or click to upload</p>
                  <p className="text-xs">Supports Images (JPG, PNG) and Videos (MP4)</p>
                </div>
              ) : (
                <div className="relative w-full h-48 bg-black/5 rounded-lg overflow-hidden flex items-center justify-center">
                  {fileType === 'video' ? (
                    <video src={preview} controls className="h-full w-auto max-w-full" />
                  ) : (
                    <img src={preview} alt="Preview" className="h-full w-auto max-w-full object-contain" />
                  )}
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 z-20"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Project Title</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none bg-slate-50" placeholder="e.g. Silk Robe Box" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <input required value={category} onChange={e => setCategory(e.target.value)} type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none bg-slate-50" placeholder="e.g. Rigid Box" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Client Location</label>
              <input required value={location} onChange={e => setLocation(e.target.value)} type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none bg-slate-50" placeholder="e.g. London, UK" />
            </div>

            <button type="submit" className="w-full bg-accent text-white font-bold py-4 rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-accent/20 flex items-center justify-center gap-2">
              <Plus size={20} /> Publish to Showcase
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


export default function App() {
  const [activeSection, setActiveSection] = useState<Section>(Section.HOME);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(INITIAL_PORTFOLIO);

  const sectionRefs = {
    [Section.HOME]: useRef<HTMLDivElement>(null),
    [Section.SERVICES]: useRef<HTMLDivElement>(null),
    [Section.PORTFOLIO]: useRef<HTMLDivElement>(null),
    [Section.ABOUT]: useRef<HTMLDivElement>(null),
    [Section.CONTACT]: useRef<HTMLDivElement>(null),
  };

  const scrollToSection = (section: Section) => {
    sectionRefs[section].current?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(section);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      Object.entries(sectionRefs).forEach(([key, ref]) => {
        if (ref.current && 
            ref.current.offsetTop <= scrollPosition && 
            (ref.current.offsetTop + ref.current.offsetHeight) > scrollPosition) {
          setActiveSection(key as Section);
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNewUpload = (item: PortfolioItem) => {
    setPortfolioItems(prev => [item, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-accent selection:text-white">
      <Navbar 
        activeSection={activeSection} 
        scrollToSection={scrollToSection} 
      />

      {/* HOME / HERO */}
      <section ref={sectionRefs[Section.HOME]} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-primary overflow-hidden">
            <div className="absolute inset-0 opacity-30 bg-[url('https://picsum.photos/id/250/2000/1200')] bg-cover bg-center mix-blend-overlay"></div>
            <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-l from-slate-800/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-3/5 text-white">
            <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-accent/30 text-accent">
              <MapPin size={16} />
              <span className="text-sm font-bold tracking-wide uppercase text-white">Factory in Shanghai, Serving the World</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-6">
              Rare Craft Packaging & <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-300">Personalized Printing</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl leading-relaxed">
              Ouyi brings your unique vision to life. From small business starter kits to massive enterprise runs, we deliver Shanghai's finest craftsmanship directly to your door.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => scrollToSection(Section.PORTFOLIO)}
                className="bg-accent text-white px-8 py-4 rounded-full font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
              >
                View Product Showcase <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => setIsChatOpen(true)}
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={20} />
                Consult Ouyi Design
              </button>
            </div>
            
            {/* Pricing Tagline */}
            <div className="mt-8 flex items-center gap-3 text-sm text-gray-400 bg-black/20 p-4 rounded-xl w-fit backdrop-blur-sm">
               <TrendingDown size={18} className="text-green-400" />
               <p>Pricing Policy: <span className="text-white font-semibold">Buy More, Save More.</span> (Small runs accepted at premium rates)</p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section ref={sectionRefs[Section.SERVICES]} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-accent font-bold tracking-widest uppercase mb-3 text-sm">What We Do</h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6">Custom Design & Manufacturing</h3>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              We specialize in "Rare Craft" — unique packaging solutions that you won't find in standard catalogs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SERVICES.map((service) => (
              <div key={service.id} className="group p-8 rounded-3xl bg-slate-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-rose-100 text-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {service.icon === 'printer' && <Printer size={28} />}
                  {service.icon === 'package' && <Package size={28} />}
                  {service.icon === 'pen' && <PenTool size={28} />}
                </div>
                <h4 className="text-2xl font-bold text-primary mb-4">{service.title}</h4>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-3">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-500">
                      <CheckCircle size={16} className="text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT OUYI */}
      <section ref={sectionRefs[Section.ABOUT]} className="py-24 bg-primary text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2 space-y-8 relative z-10">
              <h2 className="text-4xl md:text-5xl font-serif font-bold">Introduction to Ouyi</h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                Founded in Shanghai, Ouyi is a premier printing and packaging factory dedicated to personalized solutions. We don't just print; we engineer experiences.
              </p>
              
              {/* Certifications Badge Area */}
              <div className="flex flex-wrap gap-4 mt-2">
                 <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-lg border border-white/20 flex items-center gap-3">
                   <ShieldCheck className="text-accent" size={24} />
                   <div>
                     <span className="block font-bold text-white text-sm">ISO 9001</span>
                     <span className="text-xs text-gray-300">Certified Quality</span>
                   </div>
                 </div>
                 <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-lg border border-white/20 flex items-center gap-3">
                   <Leaf className="text-green-400" size={24} />
                   <div>
                     <span className="block font-bold text-white text-sm">FSC Certified</span>
                     <span className="text-xs text-gray-300">Eco-Friendly</span>
                   </div>
                 </div>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <h4 className="text-xl font-bold mb-4 text-accent flex items-center gap-2">
                  <TrendingDown size={24}/> Our Pricing Philosophy
                </h4>
                <p className="text-sm text-gray-300 mb-4">
                  We are open to small businesses and startups! However, please note that printing is a volume industry.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-lg text-center">
                    <span className="block text-xs uppercase tracking-wide text-gray-400">Small Quantity</span>
                    <span className="block font-bold text-lg text-white">Higher Unit Cost</span>
                  </div>
                  <div className="bg-accent/20 p-4 rounded-lg text-center border border-accent/30">
                    <span className="block text-xs uppercase tracking-wide text-gray-300">Large Quantity</span>
                    <span className="block font-bold text-lg text-white">Lowest Unit Cost</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4">
                   <Plane className="text-accent mt-1" size={20} />
                   <div>
                     <h5 className="font-bold">Global Visits Welcome</h5>
                     <p className="text-gray-400 text-sm">We believe in transparency. You are warmly invited to visit our factory in Shanghai to see our production line, discuss designs, and meet the team.</p>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 relative">
               <div className="grid grid-cols-2 gap-4">
                  <img src="https://picsum.photos/id/201/400/500" alt="Shanghai Factory" className="rounded-2xl shadow-2xl opacity-90 translate-y-8" />
                  <img src="https://picsum.photos/id/402/400/500" alt="Design Studio" className="rounded-2xl shadow-2xl opacity-90" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT SHOWCASE */}
      <section ref={sectionRefs[Section.PORTFOLIO]} className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-accent font-bold tracking-widest uppercase mb-3 text-sm">Product Showcase</h2>
              <h3 className="text-4xl font-serif font-bold text-primary">Made by Ouyi</h3>
            </div>
            <div className="flex gap-4">
                <button 
                  onClick={() => setIsUploadOpen(true)}
                  className="flex items-center gap-2 text-sm font-bold bg-white border border-gray-200 px-4 py-2 rounded-full hover:border-accent hover:text-accent transition-all shadow-sm"
                >
                  <Upload size={16} /> Upload Work (Admin)
                </button>
                <button className="hidden md:flex items-center text-primary font-bold hover:text-accent transition-colors">
                  Request Samples <ArrowRight size={20} className="ml-2" />
                </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {portfolioItems.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer bg-slate-200">
                {item.mediaType === 'video' ? (
                  <>
                    <video 
                      src={item.mediaUrl} 
                      muted 
                      loop 
                      playsInline
                      className="w-full h-full object-cover"
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => e.currentTarget.pause()}
                    />
                    <div className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white backdrop-blur-sm z-10">
                       <FileVideo size={20} />
                    </div>
                  </>
                ) : (
                   <img 
                    src={item.mediaUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
               
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8 pointer-events-none">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-accent text-sm font-bold tracking-wide uppercase">{item.category}</span>
                    <h4 className="text-2xl font-bold text-white mb-2">{item.title}</h4>
                    <div className="flex items-center text-gray-300 text-sm">
                      <Globe size={14} className="mr-2" /> Shipped to {item.clientLocation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT / CTA */}
      <section ref={sectionRefs[Section.CONTACT]} className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="md:w-1/2 p-12 md:p-16 text-white flex flex-col justify-between relative overflow-hidden">
               {/* Decorative Element */}
               <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
               
               <div>
                <h3 className="text-3xl md:text-4xl font-serif font-bold mb-6">Start Your Project</h3>
                <p className="text-gray-300 mb-8 text-lg">
                  Looking for special design or rare craft packaging? Ouyi is your go-to partner in Shanghai.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-gray-300">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                      <MapPin size={24} className="text-accent" />
                    </div>
                    <div>
                      <span className="block font-bold text-white">Visit Our Factory</span>
                      <span className="text-sm">No. 888 Industry Road, Shanghai, China</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-gray-300">
                     <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                      <PenTool size={24} className="text-accent" />
                    </div>
                    <div>
                      <span className="block font-bold text-white">Design Services</span>
                      <span className="text-sm">We can help you design from scratch.</span>
                    </div>
                  </div>
                </div>
               </div>

               <div className="mt-12">
                 <p className="text-sm text-gray-400 mb-2">Need a quick estimate?</p>
                 <button 
                  onClick={() => setIsChatOpen(true)}
                  className="text-accent font-bold hover:text-white transition-colors flex items-center gap-2"
                 >
                   Ask Ouyi AI Consultant <ArrowRight size={16} />
                 </button>
               </div>
            </div>

            <div className="md:w-1/2 bg-gray-50 p-12 md:p-16">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none bg-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Company</label>
                    <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none bg-white transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                  <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Product Requirements</label>
                  <textarea rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none bg-white transition-all" placeholder="Tell us about the product, quantity, and if you need design help..."></textarea>
                  <p className="text-xs text-gray-500 mt-2">Reminder: Larger quantities result in better pricing.</p>
                </div>
                <button type="button" className="w-full bg-primary text-white font-bold py-4 rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
                  Send Inquiry to Shanghai
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <span className="font-serif font-bold text-2xl text-white block mb-4">OUYI</span>
              <p className="text-sm leading-relaxed">
                Your premier partner in Shanghai for personalized printing and rare craft packaging.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Products</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-accent cursor-pointer">Rigid Boxes</li>
                <li className="hover:text-accent cursor-pointer">Gift Packaging</li>
                <li className="hover:text-accent cursor-pointer">Stickers & Labels</li>
                <li className="hover:text-accent cursor-pointer">Marketing Materials</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-accent cursor-pointer">Structural Design</li>
                <li className="hover:text-accent cursor-pointer">Prototyping</li>
                <li className="hover:text-accent cursor-pointer">Factory Visits</li>
                <li className="hover:text-accent cursor-pointer">International Logistics</li>
              </ul>
            </div>
            <div>
               <h4 className="text-white font-bold mb-4">Contact</h4>
               <p className="text-sm">No. 888 Industry Road,<br/>Shanghai, China</p>
               <p className="text-sm mt-2">contact@ouyiprint.com</p>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
            <p>&copy; 2024 Ouyi Printing. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Upload Portal Modal */}
      <UploadPortal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUpload={handleNewUpload} />

      {/* Floating Chat Button / Widget */}
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(!isChatOpen)} />
    </div>
  );
}