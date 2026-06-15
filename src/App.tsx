import React, { useState, useEffect, useRef } from "react";
import { 
  Mail, 
  Phone, 
  Linkedin, 
  Github, 
  ExternalLink, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  Download, 
  Send, 
  Briefcase, 
  GraduationCap, 
  Check, 
  Award, 
  ShieldCheck, 
  X,
  FileText,
  User,
  Star,
  Terminal,
  Layers,
  Code,
  Upload,
  Camera,
  Trash2,
  MessageSquare,
  RefreshCw,
  Eye,
  Sliders,
  MapPin,
  Laptop,
  Cpu,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { 
  PERSONAL_INFO, 
  EDUCATION, 
  SKILLS, 
  PROJECTS, 
  CERTIFICATIONS, 
  ACHIEVEMENTS,
  SkillItem,
  ProjectItem
} from "./portfolioData";

import ResumeViewer from "./components/ResumeViewer";
import ShivamPortrait from "./assets/images/shivam_profile_1781530664599.jpg";

export default function App() {
  const [activeSection, setActiveSection] = useState<string>("home");
  const [activeProjCategory, setActiveProjCategory] = useState<string>("all");
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>("All");
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  // Profile Photo state (persisted via localStorage)
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    // Check if we already have it in local storage
    const saved = localStorage.getItem("shivam_portfolio_avatar");
    if (saved) return saved;
    // Provide a beautiful professional portrait we generated as the premium default
    return ShivamPortrait;
  });
  
  // Custom interactive visual filters applied to portrait
  const [photoFilter, setPhotoFilter] = useState<string>("cyber-glow");

  // Email form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSending, setIsSending] = useState(false);

  // Gemini Twin AI Chat States
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    { role: 'assistant', content: "Hi! I am Shivam Maurya's AI Twin, trained on his real engineering details. Ask me anything about his projects, skills, certifications, or why he is a perfect match for top tech teams!" }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Typing header effect
  const [typedText, setTypedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const titles = [
    "AI Engineer",
    "Data Analyst",
    "Full Stack Developer",
    "CSE Specialist in Data Science",
    "300+ LeetCode Solved"
  ];

  useEffect(() => {
    const currentFullText = titles[textIndex];
    let typingSpeed = isDeleting ? 40 : 80;

    if (!isDeleting && typedText === currentFullText) {
      typingSpeed = 2000; // paused view
      setTimeout(() => setIsDeleting(true), typingSpeed);
      return;
    } else if (isDeleting && typedText === "") {
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % titles.length);
      return;
    }

    const timer = setTimeout(() => {
      setTypedText(
        isDeleting 
          ? currentFullText.substring(0, typedText.length - 1)
          : currentFullText.substring(0, typedText.length + 1)
      );
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, textIndex]);

  // Track scrolling to highlight active menu section in header
  useEffect(() => {
    const sections = ["home", "about", "skills", "projects", "education", "twin", "contact"];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // offset
      for (const section of sections) {
        const el = document.getElementById(`section-${section}`);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToId = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatTyping]);

  // Handle local image file uploads with base64 conversion & storage hook
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("Please upload a valid image file.", "info");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast("To ensure storage speed, upload files smaller than 2MB.", "info");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        localStorage.setItem("shivam_portfolio_avatar", base64String);
        showToast("Success! Your professional photo has been updated across the site.", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset/Remove photo
  const handleRemovePhoto = () => {
    setProfileImage(ShivamPortrait);
    localStorage.removeItem("shivam_portfolio_avatar");
    showToast("Profile image reset to default look.", "info");
  };

  // Handle Chat twin form submit
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsgMsg = inputMessage.trim();
    setInputMessage("");
    
    // Add User message
    const updatedMessages = [...chatMessages, { role: 'user' as const, content: userMsgMsg }];
    setChatMessages(updatedMessages);
    setIsChatTyping(true);

    try {
      const serverPayload = {
        messages: updatedMessages.map(m => ({
          role: m.role,
          content: m.content
        }))
      };

      const resp = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serverPayload)
      });

      if (!resp.ok) {
        throw new Error("Chat engine failed");
      }

      const data = await resp.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (err) {
      console.error("AI twin chat error:", err);
      // Fallback answers in intelligent local mode
      setTimeout(() => {
        let reply = "I am currently syncing with Shivam's database. In the meantime, Shivam is highly experienced in Python, SQL, and building AI tools like 'LifeLine AI Assistant'. You can email him directly at aniheshmaurya456@gmail.com!";
        if (userMsgMsg.toLowerCase().includes("projects") || userMsgMsg.toLowerCase().includes("kaam")) {
          reply = "Shivam has developed two cornerstone systems: 1) 'AI Profile Enhancer Platform' which parses Git/LinkedIn files and scores resume quality, and 2) 'LifeLine Companion AI' focusing on daily cognitive task trackers using machine learning pipelines.";
        } else if (userMsgMsg.toLowerCase().includes("education") || userMsgMsg.toLowerCase().includes("college")) {
          reply = "Shivam Maurya is pursuing B.Tech in Computer Science Engineering (Data Science) at GL Bajaj Institute of Technology and Management, expected graduation 2027. He scored 90.16% in class X and 78.6% in class XII!";
        } else if (userMsgMsg.toLowerCase().includes("skills") || userMsgMsg.toLowerCase().includes("tech")) {
          reply = "His primary technological arsenal rests in: Python compilers, C++ algorithm designs, SQL relational queries, Power BI charts, Pandas/NumPy ML pipelines, and custom responsive web engineering using React.js + Tailwind.";
        }
        setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      }, 700);
    } finally {
      setIsChatTyping(false);
    }
  };

  // Pre-load prompt for AI Chat twin
  const handlePromptClick = (question: string) => {
    setInputMessage(question);
  };

  // Handle Contact Form Submission (Active Send + Mail Client trigger backup)
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict Input validations
    const nameStr = formData.name.trim();
    const emailStr = formData.email.trim();
    const subjectStr = formData.subject.trim() || "Portfolio Inquiry";
    const messageStr = formData.message.trim();

    if (!nameStr || !emailStr || !messageStr) {
      if (showToast) {
        showToast("Please fill in all mandatory fields.", "info");
      }
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailStr)) {
      if (showToast) {
        showToast("Please provide a valid email address.", "info");
      }
      return;
    }

    setIsSending(true);

    try {
      // Primary Route: Submit to FormSubmit.co free endpoint which safely sends an email to Shivam
      const response = await fetch("https://formsubmit.co/ajax/aniheshmaurya456@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: nameStr,
          email: emailStr,
          subject: subjectStr,
          message: messageStr,
          _honey: "", // Honeypot field for spam protection
          _template: "box" // Styling template for email inbox
        })
      });

      if (response.ok) {
        if (showToast) {
          showToast("Message sent successfully! Shivam will get back to you soon.", "success");
        }
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: ""
        });
      } else {
        throw new Error("FormSubmit submission response not ok.");
      }
    } catch (apiError) {
      console.warn("Direct AJAX submit failed, preparing native mailto client fallback...", apiError);
      
      // Fallback: Send to our custom Express proxy route /api/contact
      try {
        const expressResponse = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: nameStr,
            email: emailStr,
            subject: subjectStr,
            message: messageStr
          })
        });
        
        if (expressResponse.ok) {
          if (showToast) {
            showToast("Message forwarded securely to Shivam's backend systems!", "success");
          }
          setFormData({
            name: "",
            email: "",
            subject: "",
            message: ""
          });
          setIsSending(false);
          return;
        }
      } catch (srvErr) {
        console.warn("Backend route unavailable. Launching native mail application...", srvErr);
      }

      // Final Fail-safe Fallback: Native mailto open to bypass popup/network isolated bounds
      const subjectLine = encodeURIComponent(subjectStr);
      const emailBody = encodeURIComponent(
        `Hi Shivam,\n\nMy name is ${nameStr} (${emailStr}).\n\nMessage:\n${messageStr}\n\nBest regards,\n${nameStr}`
      );
      const mailtoUrl = `mailto:aniheshmaurya456@gmail.com?subject=${subjectLine}&body=${emailBody}`;
      
      const link = document.createElement("a");
      link.href = mailtoUrl;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
      }, 300);

      if (showToast) {
        showToast("Email draft prepared! Opening your mail client...", "success");
      }
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } finally {
      setIsSending(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const filteredProjects = PROJECTS.filter((proj) => {
    if (activeProjCategory === "all") return true;
    return proj.category === activeProjCategory;
  });

  const skillCategories = ["All", "Programming", "Data Analytics", "Web Development", "AI & ML", "Database", "Core Concepts"];
  const filteredSkills = SKILLS.filter((s) => {
    if (selectedSkillCategory === "All") return true;
    return s.category === selectedSkillCategory;
  });

  // Color Filter Mapping applied
  const getFilterClass = () => {
    switch (photoFilter) {
      case "cyan-cool":
        return "hue-rotate-180 saturate-[1.3] brightness-105 border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.4)]";
      case "cyber-glow":
        return "contrast-[1.1] brightness-105 saturate-[1.2] border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.35)]";
      case "grayscale":
        return "grayscale contrast-[1.15] border-slate-500/30 shadow-none";
      case "vintage":
        return "sepia saturate-80 contrast-95 border-amber-800/20";
      default:
        return "border-cyan-500/20 shadow-none";
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030208] text-slate-200 selection:bg-cyan-600/50 selection:text-white pb-16 overflow-x-hidden font-sans">
      
      {/* Absolute Decorative Ambient Neon Glow Spheres */}
      <div className="absolute top-[3%] left-[10%] w-[550px] h-[550px] bg-cyan-500/[0.04] rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute top-[25%] right-[5%] w-[600px] h-[600px] bg-blue-600/[0.04] rounded-full blur-[160px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[25%] left-[5%] w-[500px] h-[500px] bg-purple-600/[0.03] rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[5%] right-[10%] w-[550px] h-[550px] bg-cyan-500/[0.04] rounded-full blur-[140px] pointer-events-none z-0"></div>

      {/* Global Toast Notification */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 max-w-sm p-4 rounded-xl bg-[#090714] border border-cyan-500/40 shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
          <p className="text-xs text-slate-150 font-medium font-sans">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="ml-auto text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modern Professional Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-cyan-900/15 bg-[#030208]/85 backdrop-blur-xl no-print">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo Brand exactly like the photo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center font-black text-slate-950 text-base shadow-[0_0_15px_rgba(6,182,212,0.35)] cursor-pointer" onClick={() => scrollToId("home")}>
              SM
            </div>
            <div>
              <span className="font-display font-black text-base text-white tracking-tight block cursor-pointer" onClick={() => scrollToId("home")}>Shivam Maurya</span>
              <span className="text-xs text-cyan-400 font-bold font-mono block leading-none tracking-wider uppercase mt-1">CSE • Data Science Specialization</span>
            </div>
          </div>

          {/* Navigation Links centered, scrolling smoothly */}
          <nav className="hidden md:flex items-center gap-2 bg-slate-950/60 border border-cyan-500/10 px-3 py-2 rounded-full">
            {[
              { id: "home", label: "Home" },
              { id: "about", label: "About" },
              { id: "skills", label: "Skills" },
              { id: "projects", label: "Projects" },
              { id: "education", label: "Education" },
              { id: "twin", label: "AI Twin" },
              { id: "contact", label: "Contact" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToId(tab.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                  activeSection === tab.id
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/10"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Action Hub with Integrated Social Icons */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3 bg-slate-950/80 border border-cyan-500/15 px-3 py-2 rounded-full">
              <a 
                href={PERSONAL_INFO.github} 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 text-slate-400 hover:text-cyan-400 hover:scale-110 transition duration-300"
                title="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href={PERSONAL_INFO.linkedIn} 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 text-slate-400 hover:text-cyan-400 hover:scale-110 transition duration-300"
                title="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="mailto:aniheshmaurya456@gmail.com?subject=Portfolio Inquiry" 
                className="p-2 text-slate-400 hover:text-cyan-400 hover:scale-110 transition duration-300"
                title="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a 
                href={`tel:${PERSONAL_INFO.phone}`} 
                className="p-2 text-slate-400 hover:text-cyan-400 hover:scale-110 transition duration-300"
                title="Call"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>

            <button 
              onClick={() => setIsResumeOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-400/10 hover:bg-cyan-450/20 border border-cyan-500/25 rounded-full text-xs text-cyan-300 transition-all cursor-pointer font-bold tracking-wide"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Resume PDF</span>
            </button>
          </div>
        </div>

        {/* Small screen slider navbar */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-cyan-900/10 bg-[#06040c]">
          {[
            { id: "home", label: "Home" },
            { id: "about", label: "About" },
            { id: "skills", label: "Skills" },
            { id: "projects", label: "Projects" },
            { id: "education", label: "Education" },
            { id: "twin", label: "AI Twin" },
            { id: "contact", label: "Contact" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollToId(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase shrink-0 transition ${
                activeSection === tab.id
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950"
                  : "text-slate-400 bg-[#0e0c15]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Sections */}
      <main className="max-w-7xl mx-auto px-6 pt-6 relative z-10 space-y-24">
        
        {/* SECTION 1: HERO (HOME) - Replicating photo perfectly with premium code */}
        <section id="section-home" className="pt-12 md:pt-24 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column: Text & Hero Intro */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              
              <div className="inline-flex items-center gap-2.5 px-4.5 py-2 bg-cyan-500/15 border border-cyan-500/30 rounded-full w-fit">
                <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
                <span className="text-xs md:text-sm text-cyan-300 uppercase font-mono tracking-widest font-black">CSE Specialist • Data Science Master</span>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-slate-250 font-black tracking-widest text-lg md:text-xl uppercase font-mono">HELLO WORLD, I'M</h2>
                <h1 className="text-6xl md:text-8xl font-sans font-black tracking-tighter leading-none text-white hover:text-cyan-400 transition-colors duration-500">
                  Shivam Maurya
                </h1>
                <div className="h-12 flex items-center">
                  <span className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 uppercase tracking-widest font-mono text-glow-cyan">
                    {typedText || "AI Engineer"}
                  </span>
                </div>
              </div>

              {/* Exact paragraph but larger fonts for high readibility */}
              <p className="text-base md:text-xl text-slate-300 leading-relaxed max-w-2xl text-justify font-sans">
                CSE (Data Science) student crafting AI-powered, data-driven products. I build intelligent systems and beautiful interfaces that solve real-world problems.
              </p>

              {/* User photo matching action CTA row - scaled up */}
              <div className="flex flex-wrap gap-5 pt-4">
                <button
                  onClick={() => scrollToId("projects")}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 hover:from-cyan-400 hover:to-blue-600 text-slate-950 font-black text-sm tracking-widest uppercase rounded-2xl transition duration-300 hover:scale-[1.03] shadow-[0_0_25px_rgba(6,182,212,0.35)] cursor-pointer"
                >
                  <span>View Projects</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsResumeOpen(true)}
                  className="flex items-center gap-3 px-8 py-4 bg-slate-900/80 hover:bg-slate-800 border-2 border-white/10 text-slate-200 font-extrabold text-sm tracking-widest uppercase rounded-2xl transition cursor-pointer hover:text-white"
                >
                  <Download className="w-5 h-5 text-cyan-400" />
                  <span>Download Resume</span>
                </button>
                <a
                  href="mailto:aniheshmaurya456@gmail.com?subject=Portfolio Inquiry"
                  className="flex items-center gap-3 px-8 py-4 bg-slate-900/80 hover:bg-slate-800 border-2 border-white/10 text-slate-200 font-extrabold text-sm tracking-widest uppercase rounded-2xl transition hover:text-white"
                >
                  <Mail className="w-5 h-5 text-cyan-400" />
                  <span>Contact Me</span>
                </a>
              </div>

              {/* Large stats strip exactly as shown on the bottom of device portrait */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-10 border-t border-cyan-950/40">
                {ACHIEVEMENTS.map((stat, i) => (
                  <div key={i} className="p-5.5 bg-slate-900/50 border border-cyan-500/10 rounded-2xl flex flex-col justify-center transition-all duration-300 hover:border-cyan-500/30">
                    <p className="text-4xl md:text-5xl font-black text-cyan-400 tracking-tight text-glow-cyan">
                      {stat.value}{stat.suffix}
                    </p>
                    <p className="text-xs md:text-sm text-slate-350 uppercase font-mono tracking-widest font-black mt-1.5 leading-snug">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Column: High fidelity image frame with floating tags matching the laptop layout */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              
              {/* Surrounding Floating Neon Pills with gently bouncing translations */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute left-[-20px] top-[15%] z-20 px-4 py-2 bg-[#090714]/95 border-2 border-cyan-400/50 rounded-xl text-cyan-300 text-sm font-mono font-black tracking-widest shadow-lg flex items-center gap-2.5"
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>{`{ AI }`}</span>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                className="absolute right-[-20px] top-[30%] z-20 px-4 py-2 bg-[#090714]/95 border-2 border-cyan-400/50 rounded-xl text-emerald-405 text-emerald-300 text-sm font-mono font-black tracking-widest shadow-lg flex items-center gap-2.5"
              >
                <Code className="w-4 h-4 text-emerald-400" />
                <span>Python</span>
              </motion.div>

              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
                className="absolute right-[-10px] bottom-[15%] z-20 px-4 py-2 bg-[#090714]/95 border-2 border-cyan-400/50 rounded-xl text-blue-350 text-sm font-mono font-black tracking-widest shadow-lg flex items-center gap-2.5"
              >
                <Layers className="w-4 h-4 text-blue-400" />
                <span>React.js</span>
              </motion.div>

              {/* Premium image container card matching device layout - scaled up size */}
              <div className="relative p-8 bg-[#080612]/95 border-2 border-cyan-500/25 rounded-[40px] overflow-hidden backdrop-blur-xl w-full max-w-[440px] shadow-[0_0_60px_rgba(6,182,212,0.15)] group">
                <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-400/10 rounded-full blur-[60px]"></div>
                
                {/* Image core frame */}
                <div className="relative aspect-square w-full rounded-3xl overflow-hidden border-2 border-cyan-400/40 bg-slate-950 flex items-center justify-center relative shadow-2xl mb-6">
                  <img
                    src={profileImage || ShivamPortrait}
                    alt="Shivam Maurya Headshot"
                    className={`w-full h-full object-cover select-none transition-all duration-300 ${getFilterClass()}`}
                    referrerPolicy="no-referrer"
                  />

                  {/* High Fidelity Neon Scanning Radar Sweep */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/15 to-transparent w-full h-[30%] top-[-30%] animate-[bounce_5s_infinite_linear] pointer-events-none"></div>

                  {/* Corner cybernetic bracket highlights */}
                  <div className="absolute top-3.5 left-3.5 w-5 h-5 border-t-3 border-l-3 border-cyan-400"></div>
                  <div className="absolute top-3.5 right-3.5 w-5 h-5 border-t-3 border-r-3 border-cyan-400"></div>
                  <div className="absolute bottom-3.5 left-3.5 w-5 h-5 border-b-3 border-l-3 border-cyan-400"></div>
                  <div className="absolute bottom-3.5 right-3.5 w-5 h-5 border-b-3 border-r-3 border-cyan-400"></div>
                </div>

                {/* Cyber Terminal Text Overlay inside portrait frame on bottom left exactly like device */}
                <div className="bg-slate-950/90 p-5 rounded-2xl border-2 border-cyan-500/15 font-mono text-sm leading-relaxed flex flex-col gap-1.5 transition-all duration-300 hover:border-cyan-400">
                  <span className="text-cyan-400 font-bold">$ whoami</span>
                  <span className="text-white font-extrabold text-base">Shivam Maurya</span>
                  <span className="text-slate-400">B.Tech CSE - Data Science</span>
                </div>

                {/* Highly Accessible Interactive Social Grid inside profile card */}
                <div className="my-5 p-3.5 bg-cyan-950/15 border-2 border-cyan-500/15 rounded-2xl flex items-center justify-around">
                  <a 
                    href={PERSONAL_INFO.github} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-3 bg-slate-950 hover:bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-slate-300 hover:text-cyan-400 hover:scale-110 transition duration-300 shadow"
                    title="GitHub"
                  >
                    <Github className="w-6 h-6" />
                  </a>
                  <a 
                    href={PERSONAL_INFO.linkedIn} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-3 bg-slate-950 hover:bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-slate-300 hover:text-cyan-400 hover:scale-110 transition duration-300 shadow"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-6 h-6" />
                  </a>
                  <a 
                    href="mailto:aniheshmaurya456@gmail.com?subject=Portfolio Inquiry" 
                    className="p-3 bg-slate-950 hover:bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-slate-300 hover:text-cyan-400 hover:scale-110 transition duration-300 shadow"
                    title="Email"
                  >
                    <Mail className="w-6 h-6" />
                  </a>
                  <a 
                    href={`tel:${PERSONAL_INFO.phone}`} 
                    className="p-3 bg-slate-950 hover:bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-slate-300 hover:text-cyan-400 hover:scale-110 transition duration-300 shadow"
                    title="Call"
                  >
                    <Phone className="w-6 h-6" />
                  </a>
                </div>

                {/* Filter Controllers within frame toolset */}
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {[
                    { id: "cyber-glow", label: "Glow Mode" },
                    { id: "cyan-cool", label: "Cyber Cyan" },
                    { id: "grayscale", label: "Retro Gray" }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        setPhotoFilter(f.id);
                        showToast(`Cyber filter: ${f.label}`, "info");
                      }}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black font-mono transition cursor-pointer ${
                        photoFilter === f.id
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md"
                          : "bg-slate-950 hover:bg-[#151125] text-slate-400 border border-white/5"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

              </div>
              
            </div>

          </div>
        </section>

        {/* SECTION 2: ABOUT BENTO */}
        <section id="section-about" className="scroll-mt-24 pt-16">
          
          <div className="border-l-4 border-cyan-400 pl-6 mb-12">
            <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-2 font-mono">My Specialty Journey</h3>
            <h2 className="text-4xl md:text-5xl font-black text-white hover:text-cyan-400 transition-colors duration-300">About Me</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            
            {/* Top Giant Intro block */}
            <div className="lg:col-span-8 p-10 bg-[#0a0715] border-2 border-cyan-500/10 rounded-3xl relative overflow-hidden flex flex-col justify-between hover:border-cyan-500/25 transition duration-300">
              <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/5 rounded-full blur-[65px] pointer-events-none"></div>
              
              <div className="space-y-6">
                <h3 className="text-xl md:text-2xl font-black text-cyan-300 font-display">Specialized in Machine Learning & Large relational structures</h3>
                <p className="text-base md:text-lg text-slate-305 text-slate-300 leading-relaxed text-justify">
                  Pursuing a specialized **B.Tech in Computer Science Engineering with a Data Science joint track** at **GL Bajaj Institute of Technology and Management**, expected graduation in **2027**. 
                  My day-to-day focus centers heavily around parsing data pipelines, formulating high-value SQL relational transformations, coding efficient C++ algorithms, and engineering interactive state interfaces like AI Assistant bots.
                </p>
                <p className="text-base md:text-lg text-slate-305 text-slate-300 leading-relaxed text-justify">
                  I couple analytical research (Pandas, NumPy, Matplotlib) with beautiful interactive frontends, producing software that doesn't just calculate findings, but visualizes them aesthetically so businesses can act immediately.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 p-6 bg-slate-950/80 rounded-2xl border-2 border-cyan-950/40">
                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm md:text-base font-black text-white uppercase tracking-wider">300+ LeetCode Solutions</h4>
                    <p className="text-xs md:text-sm text-slate-400 font-mono mt-0.5">Rigorous structural DSA capability</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm md:text-base font-black text-white uppercase tracking-wider">DS Specialty Curriculum</h4>
                    <p className="text-xs md:text-sm text-slate-400 font-mono mt-0.5">Direct training in big data paradigms</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Side fast facts bullet */}
            <div className="lg:col-span-4 p-10 bg-[#0a0715] border-2 border-cyan-500/10 rounded-3xl flex flex-col justify-between hover:border-cyan-500/30 transition duration-300">
              <div className="space-y-8">
                <h3 className="text-sm font-mono font-black tracking-widest uppercase text-cyan-405 text-cyan-400 border-b-2 border-cyan-950/60 pb-3">Technical Vitals</h3>
                
                <div className="space-y-6">
                  <div>
                    <span className="text-xs text-slate-500 font-mono block tracking-widest mb-1 font-bold">INSTITUTION</span>
                    <span className="text-base font-black text-white leading-normal">GL Bajaj Group, Greater Noida</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-mono block tracking-widest mb-1 font-bold">EMAIL REFERENCE</span>
                    <a href="mailto:aniheshmaurya456@gmail.com?subject=Portfolio Inquiry" className="text-base font-black text-cyan-300 hover:text-cyan-400 hover:underline transition-colors block truncate">aniheshmaurya456@gmail.com</a>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-mono block tracking-widest mb-1 font-bold">PHONE INQUIRY</span>
                    <span className="text-base font-black text-white block">+91 9044144059</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-mono block tracking-widest mb-1 font-bold">CURRENT HEADQUARTERS</span>
                    <span className="text-base font-black text-white block">Uttar Pradesh, India</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => scrollToId("contact")}
                className="mt-8 w-full text-center py-4 bg-cyan-500/10 hover:bg-cyan-550/20 border-2 border-cyan-500/35 rounded-2xl text-sm text-cyan-300 font-black tracking-widest uppercase transition cursor-pointer"
              >
                Inquire Collaboration
              </button>
            </div>

          </div>

        </section>

        {/* SECTION 3: SKILLS & COMPETENCY ECOSYSTEM */}
        <section id="section-skills" className="scroll-mt-24 pt-16">
          
          <div className="border-l-4 border-cyan-400 pl-6 mb-12">
            <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-2 font-mono">My Technology Ecosystem</h3>
            <h2 className="text-4xl md:text-5xl font-black text-white hover:text-cyan-400 transition-colors duration-300">Competencies & Professional Credentials</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Box: Graphic Skill competence bars */}
            <div className="lg:col-span-7 bg-[#0a0715] border-2 border-cyan-500/10 rounded-3xl p-10 space-y-8 hover:border-cyan-500/25 transition duration-300">
              
              <div className="flex flex-wrap items-center justify-between gap-5 border-b border-cyan-950/40 pb-5">
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">Expertise Metrics</h3>
                
                {/* Horizontal categorical tags */}
                <div className="flex flex-wrap gap-2">
                  {skillCategories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedSkillCategory(c)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition ${
                        selectedSkillCategory === c
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black shadow-md shadow-cyan-500/10"
                          : "bg-slate-950 text-slate-400 hover:text-white border border-white/5"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill meters grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredSkills.map((s, i) => (
                  <div key={i} className="p-5.5 bg-slate-950/60 rounded-xl border border-cyan-500/5 hover:border-cyan-500/25 transition-all duration-300">
                    <div className="flex justify-between items-baseline mb-3">
                      <span className="text-sm md:text-base font-black text-slate-200 font-mono">{s.name}</span>
                      <span className="text-sm md:text-base text-cyan-400 font-mono font-black">{s.level}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${s.level}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Box: Academic Badging & Certifications */}
            <div className="lg:col-span-5 bg-[#0a0715] border-2 border-cyan-500/10 rounded-3xl p-10 space-y-8 hover:border-cyan-500/25 transition duration-300">
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono border-b border-cyan-950/40 pb-5">
                Academic Badges & Certifications
              </h3>

              <div className="space-y-6">
                {CERTIFICATIONS.map((cert, iv) => (
                  <div key={iv} className="bg-slate-950/70 p-6 rounded-2xl border-2 border-cyan-500/5 flex items-start gap-5 hover:border-cyan-500/25 transition-colors duration-300">
                    <div className="p-4 rounded-xl bg-cyan-400/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                      <ShieldCheck className="w-6 h-6 text-cyan-350" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white font-display leading-snug">{cert.title}</h4>
                      <p className="text-sm text-cyan-300 font-mono mt-2 font-bold">{cert.issuer}</p>
                      <p className="text-xs text-slate-400 font-mono italic mt-1 font-semibold">{cert.year}</p>
                      {cert.credentialUrl && (
                        <a 
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-slate-350 hover:text-white font-black tracking-wider uppercase mt-4 hover:underline"
                        >
                          <span>Verify Credentials</span>
                          <ExternalLink className="w-4 h-4 text-cyan-400" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </section>

        {/* SECTION 4: SHOWCASE PROJECTS */}
        <section id="section-projects" className="scroll-mt-24 pt-16">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-cyan-500/15 pb-8 mb-10">
            <div className="border-l-4 border-cyan-400 pl-6">
              <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-2 font-mono">My System Engineering Works</h3>
              <h2 className="text-4xl md:text-5xl font-black text-white hover:text-cyan-400 transition-colors duration-300">Featured Project Showcases</h2>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border-2 border-cyan-500/10 select-none">
              {[
                { id: "all", label: "All Works" },
                { id: "ai", label: "Intelligent AI" },
                { id: "analytics", label: "Data Analytics" }
              ].map((categoryItem) => (
                <button
                  key={categoryItem.id}
                  onClick={() => {
                    setActiveProjCategory(categoryItem.id);
                    showToast(`Filtered projects by: ${categoryItem.label}`, "info");
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition uppercase cursor-pointer ${
                    activeProjCategory === categoryItem.id 
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {categoryItem.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {filteredProjects.map((p) => (
              <div key={p.id} className="bg-[#0a0715] border-2 border-cyan-950/40 rounded-3xl p-10 flex flex-col justify-between hover:border-cyan-500/35 transition-all duration-300 hover:translate-y-[-4px] shadow-2xl group">
                <div>
                  
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-mono tracking-widest uppercase font-black text-cyan-300 bg-cyan-950/50 border-2 border-cyan-500/20 px-4 py-1.5 rounded-lg">
                      {p.category === 'ai' ? '🤖 Intelligent GenAI' : '📊 Relational Analytics'}
                    </span>
                    {p.githubUrl && (
                      <a 
                        href={p.githubUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-slate-400 hover:text-white bg-slate-950 p-3 rounded-xl border-2 border-white/5 hover:border-cyan-500/25 transition duration-300"
                        title="GitHub Code"
                      >
                        <Github className="w-5 h-5" />
                      </a>
                    )}
                  </div>

                  <h4 className="font-extrabold text-2xl text-white tracking-tight mb-4 font-display group-hover:text-cyan-400 transition-colors">
                    {p.title}
                  </h4>
                  <p className="text-base text-slate-300 leading-relaxed mb-6 text-justify">
                    {p.description}
                  </p>

                  <div className="space-y-3 mb-6 bg-slate-950/60 border-2 border-cyan-500/5 p-5.5 rounded-2xl">
                    <p className="text-xs text-cyan-405 text-cyan-400 font-mono tracking-wider uppercase font-black text-glow-cyan">KEY FEATURES & INNOVATIONS</p>
                    <ul className="text-sm text-slate-200 space-y-3">
                      {p.features.map((featureText, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed font-medium">{featureText}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                <div className="flex flex-wrap gap-2 pt-5 border-t border-cyan-950/40 mt-auto">
                  {p.techStack.map((tech) => (
                    <span key={tech} className="text-xs font-mono px-3.5 py-1.5 bg-slate-950 border-2 border-cyan-500/5 rounded-xl text-cyan-300 font-black">
                      {tech}
                    </span>
                  ))}
                </div>

              </div>
            ))}
          </div>

        </section>

        {/* SECTION 5: CHRONOLOGICAL EDUCATION */}
        <section id="section-education" className="scroll-mt-24 pt-16">
          
          <div className="border-l-4 border-cyan-400 pl-6 mb-12 max-w-4xl mx-auto">
            <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-2 font-mono">My Academic Credentials</h3>
            <h2 className="text-4xl md:text-5xl font-black text-white hover:text-cyan-400 transition-colors duration-300">Educational Timelines</h2>
          </div>

          <div className="relative border-l border-cyan-550/20 pl-8 ml-4 max-w-4xl mx-auto space-y-12 py-6">
            
            {EDUCATION.map((edu, idx) => (
              <div key={idx} className="relative group">
                
                {/* Glowing Node Line Anchor */}
                <div className="absolute left-[-38px] top-1.5 w-5 h-5 rounded-full border-4 border-slate-900 bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)] shrink-0 transition-transform duration-300 group-hover:scale-125 z-10" />

                <div className="bg-[#0a0715] border-2 border-cyan-500/10 rounded-3xl p-10 hover:border-cyan-500/25 transition-all duration-300">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h3 className="text-xl md:text-2xl font-black text-white font-display leading-tight">{edu.institution}</h3>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono bg-cyan-950/40 border-2 border-cyan-500/20 px-3.5 py-1.5 rounded-xl text-cyan-300 font-extrabold uppercase shrink-0">
                        {edu.year}
                      </span>
                      {edu.status && (
                        <span className="text-xs font-mono bg-emerald-950/40 border-2 border-emerald-500/20 px-3.5 py-1.5 rounded-xl text-emerald-400 font-extrabold uppercase shrink-0 font-sans italic">
                          {edu.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="text-sm md:text-base text-cyan-400 font-mono tracking-wider font-black uppercase mb-3 text-glow-cyan">
                    {edu.degree}
                  </h4>

                  {edu.score && (
                    <p className="text-sm text-white font-black bg-[#110e23] w-fit px-4 py-2 border-2 border-cyan-500/15 rounded-xl mb-5">
                      📊 Scholastic Score: <span className="text-cyan-350 font-mono">{edu.score}</span>
                    </p>
                  )}

                  <p className="text-base text-slate-300 leading-relaxed text-justify mt-3">
                    {edu.details}
                  </p>

                </div>

              </div>
            ))}

          </div>

        </section>

        {/* SECTION 6: AI RECRUITER ASSISTANT TWIN CHAT INTERACTIVE */}
        <section id="section-twin" className="scroll-mt-24 pt-16">
          
          <div className="border-l-4 border-cyan-400 pl-6 mb-4">
            <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-2 font-mono">24/7 INTERACTIVE AGENT</h3>
            <h2 className="text-4xl md:text-5xl font-black text-white hover:text-cyan-400 transition-colors duration-300">Shivam's AI Recruiter Twin</h2>
          </div>
          <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-3xl mb-12">
            Interview Shivam's verified twin directly! Trained server-side via <strong>Gemini 3.5 Flash</strong>, the agent can describe his algorithm practices, curriculum indices, and team values instantly.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Col: Setup metrics */}
            <div className="lg:col-span-4 bg-[#0a0715] border-2 border-cyan-500/10 rounded-3xl p-10 flex flex-col justify-between hover:border-cyan-500/25 transition duration-300">
              <div className="space-y-8">
                
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-cyan-400/10 border border-cyan-500/20 text-cyan-400">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-500 font-mono uppercase leading-none">Agent specifications</h4>
                    <span className="text-white text-base font-black block mt-1.5">Twin Console Sync</span>
                  </div>
                </div>

                <div className="p-5.5 bg-slate-950/70 border-2 border-cyan-500/5 rounded-2xl space-y-3">
                  <p className="text-xs text-cyan-400 font-mono uppercase font-black tracking-widest">ONLINE RECRUITER VERIFICATION</p>
                  <p className="text-sm text-slate-300 leading-relaxed text-left">
                    The bot parses real credentials defined in portfolio database. It acts as an active assistant to test capabilities, match criteria, or answer fast FAQs immediately.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-slate-400 font-mono uppercase font-black tracking-widest">SYNCED CORE DOMAINS:</p>
                  <div className="flex flex-wrap gap-2">
                    {["Python Pipeline", "C++ Algorithms", "Pandas Dataframes", "Power BI dashboards", "Relational SQL", "React UI code", "Direct mail trigger"].map((vital) => (
                      <span key={vital} className="text-xs font-mono px-3 py-1.5 bg-slate-950 border-2 border-cyan-500/5 rounded-xl text-cyan-300 font-black">
                        {vital}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              <div className="p-5 bg-cyan-950/15 border-2 border-cyan-500/15 rounded-2xl text-xs text-slate-350 leading-relaxed text-justify mt-8">
                💡 <strong>Prompt recommendation:</strong> Choose one template from prompt suggestions, or write a custom question.
              </div>
            </div>

            {/* Right block: Immersive Chat console */}
            <div className="lg:col-span-8 bg-[#0a0715] border-2 border-cyan-500/10 rounded-3xl p-10 flex flex-col justify-between relative min-h-[520px] hover:border-cyan-500/25 transition duration-300">
              
              {/* Reset control */}
              <div className="flex items-center justify-between border-b border-cyan-950/40 pb-5 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-cyan-500/20 bg-slate-950 flex items-center justify-center relative">
                    <img 
                      src={profileImage || ShivamPortrait} 
                      alt="Shivam AI Portrait" 
                      className={`w-full h-full object-cover select-none ${getFilterClass()}`}
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border border-slate-950"></span>
                  </div>
                  <div>
                    <h3 className="text-glow-cyan text-xs font-mono tracking-widest uppercase text-cyan-405 text-cyan-400 font-black mb-0.5">VETTED ACTIVE INTERACTION AGENT</h3>
                    <h2 className="text-base font-black text-white">Shivam Maurya's AI Agent Twin</h2>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setChatMessages([
                      { role: 'assistant', content: "Twin dialogue has been successfully reset! Ask me any questions about Shivam Maurya's computer science background, ML credentials, or DSA solver counts." }
                    ]);
                  }}
                  className="p-3 bg-slate-950 border-2 border-cyan-500/5 hover:bg-cyan-950/55 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Reset dialog"
                >
                  <RefreshCw className="w-5 h-5 text-cyan-400" />
                </button>
              </div>

              {/* Scrolling messaging zone */}
              <div className="flex-1 min-h-[280px] max-h-[400px] overflow-y-auto bg-slate-950/70 border border-cyan-500/5 rounded-2xl p-6 space-y-5 mb-6">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    <div className={`p-5 rounded-2xl text-sm leading-relaxed text-justify ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black rounded-tr-none shadow-md' 
                        : 'bg-[#12101e] text-slate-200 border-2 border-cyan-500/10 rounded-tl-none font-sans'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {isChatTyping && (
                  <div className="flex items-center gap-1.5 p-4 bg-[#12101e] border-2 border-cyan-500/10 rounded-2xl w-fit">
                    <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce"></span>
                    <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce delay-150"></span>
                    <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce delay-300"></span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* suggested prompts */}
              <div className="mb-6 bg-slate-950/60 p-5 rounded-2xl border-2 border-cyan-500/5">
                <span className="text-xs text-slate-400 font-mono tracking-widest uppercase block mb-3 font-bold">QUICK DISCUSSION TEMPLATES:</span>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    "Why hire Shivam over others?",
                    "Details of AI Profile Enhancer project",
                    "Which certifications does he carry?",
                    "Is Shivam available for engineering roles?"
                  ].map((presetPrompt) => (
                    <button
                      key={presetPrompt}
                      type="button"
                      onClick={() => handlePromptClick(presetPrompt)}
                      className="px-4 py-2 bg-slate-950 hover:bg-cyan-500/10 hover:text-cyan-300 border-2 border-cyan-500/5 hover:border-cyan-500/25 text-xs text-slate-355 text-slate-300 rounded-xl transition cursor-pointer text-left font-semibold"
                    >
                      {presetPrompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* text interaction bar */}
              <form onSubmit={handleSendMessage} className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="Ask a question..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="bg-slate-950 border-2 border-cyan-550/15 rounded-2xl px-6 py-4.5 text-sm text-white focus:outline-none focus:border-cyan-500 flex-1 w-full"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-600 text-slate-950 px-8 py-4.5 rounded-2xl font-black text-sm uppercase tracking-wide cursor-pointer flex items-center justify-center gap-3.5 shadow-lg"
                >
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>

            </div>

          </div>

        </section>

            {/* SECTION 7: DIRECT CONNECTION (CONTACT) */}
        <section id="section-contact" className="scroll-mt-24 pt-16">
          
          <div className="border-l-4 border-cyan-400 pl-6 mb-12">
            <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-2 font-mono">Get in Touch</h3>
            <h2 className="text-4xl md:text-5xl font-black text-white hover:text-cyan-400 transition-colors duration-300">Contact Shivam Maurya</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left direct vitals detail links */}
            <div className="lg:col-span-5 bg-[#0a0715] border-2 border-cyan-500/10 rounded-3xl p-10 space-y-8 hover:border-cyan-500/25 transition duration-300">
              
              <h3 className="text-2xl font-black text-white font-display leading-tight">Let's discuss an internship position or project</h3>
              <p className="text-base text-slate-300 leading-relaxed text-justify font-normal">
                Have an active opening or product architecture requiring data science analytical filters, python pipelines, or dynamic React web modules? Shivam is open to standard engineering internships and code collaborations immediately.
              </p>

              <div className="space-y-5 pt-6 border-t border-cyan-950/40">
                
                <a 
                  href="mailto:aniheshmaurya456@gmail.com?subject=Portfolio Inquiry"
                  className="flex items-center gap-4 p-5 rounded-2xl bg-slate-950/60 border-2 border-cyan-500/5 hover:border-cyan-400/30 transition-all duration-300 group"
                >
                  <div className="p-4 rounded-xl bg-cyan-400/10 border border-cyan-500/20 text-cyan-400 shrink-0 group-hover:bg-cyan-400/20 transition-all">
                    <Mail className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-500 font-mono tracking-widest uppercase leading-snug font-bold">DIRECT INBOX</h4>
                    <p className="text-base font-black text-white hover:text-cyan-400 hover:underline transition-colors truncate">aniheshmaurya456@gmail.com</p>
                  </div>
                </a>

                <a 
                  href={`tel:${PERSONAL_INFO.phone}`}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-slate-950/60 border-2 border-cyan-500/5 hover:border-cyan-400/30 transition-all duration-300 group"
                >
                  <div className="p-4 rounded-xl bg-cyan-400/10 border border-cyan-500/20 text-cyan-455 shrink-0 group-hover:bg-cyan-400/20 transition-all">
                    <Phone className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-500 font-mono tracking-widest uppercase leading-snug font-bold">TELEPHONE DIALOUT</h4>
                    <p className="text-base font-black text-white group-hover:text-cyan-405">{PERSONAL_INFO.phone}</p>
                  </div>
                </a>

                <div 
                  className="flex items-center gap-4 p-5 rounded-2xl bg-slate-950/60 border-2 border-cyan-500/5"
                >
                  <div className="p-4 rounded-xl bg-cyan-400/10 border border-cyan-500/20 text-cyan-455 shrink-0">
                    <MapPin className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-500 font-mono tracking-widest uppercase leading-snug font-bold">LOCATION SCOPE</h4>
                    <p className="text-base font-black text-white font-medium">Gorakhpur / Greater Noida, UP, India</p>
                  </div>
                </div>

              </div>

            </div>

            {/* Right direct mail construct form trigger */}
            <div className="lg:col-span-7 bg-[#0a0715] border-2 border-cyan-500/10 rounded-3xl p-10 hover:border-cyan-500/25 transition duration-300">
              
              <h3 className="text-sm font-mono font-black tracking-widest uppercase text-cyan-400 mb-8 pb-3 border-b border-cyan-950/40">Mailing Generator Widget</h3>
              
              <form onSubmit={handleContactSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono tracking-wider uppercase text-slate-355 block font-black">Your Full Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Hiring Manager"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-950 border-2 border-cyan-500/10 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-cyan-500 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono tracking-wider uppercase text-slate-355 block font-black">Your Email Address *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="e.g. manager@corporatelabs.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-950 border-2 border-cyan-500/10 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-cyan-500 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono tracking-wider uppercase text-slate-355 block font-black">Inquiry Subject</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Backend Internship role / Interview Schedule"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-slate-950 border-2 border-cyan-500/10 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-cyan-500 font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono tracking-wider uppercase text-slate-355 block font-black">Inquiry Message *</label>
                  <textarea 
                    required
                    rows={5}
                    placeholder="Describe requirement details or interview requests..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-slate-950 border-2 border-cyan-500/10 rounded-xl p-5 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-5 bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 text-slate-950 font-black tracking-widest uppercase rounded-2xl transition cursor-pointer flex items-center justify-center gap-3.5 shadow-lg hover:scale-[1.01] text-sm disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  <span>{isSending ? "Sending message..." : "Send Message"}</span>
                </button>

              </form>

            </div>

          </div>

        </section>

      </main>

      {/* Futuristic Ambient footer section */}
      <footer className="mt-32 border-t border-cyan-950/30 py-10 text-center text-sm text-slate-400 max-w-7xl mx-auto px-6 select-none flex flex-col sm:flex-row justify-between items-center gap-6">
        <span className="font-medium">&copy; {new Date().getFullYear()} Shivam Maurya • CSE Data Science Specialist. All technical files verified.</span>
        
        <button 
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            showToast("Zoomed smoothly back to main home", "success");
          }} 
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 border-2 border-cyan-500/10 text-cyan-300 hover:text-white rounded-xl transition text-sm font-black cursor-pointer font-mono shadow-md"
        >
          <span>Top</span>
          <ChevronUp className="w-5 h-5 text-cyan-400 animate-bounce" />
        </button>
      </footer>

      {/* PDF resume print modal viewer portal */}
      {isResumeOpen && (
        <ResumeViewer onClose={() => setIsResumeOpen(false)} profileImage={profileImage} showToast={showToast} />
      )}

    </div>
  );
}
