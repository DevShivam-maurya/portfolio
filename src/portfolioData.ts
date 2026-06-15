export interface EducationItem {
  institution: string;
  degree: string;
  score?: string;
  year: string;
  status?: string;
  details?: string;
}

export interface SkillItem {
  name: string;
  level: number; // 0-100 for interactive charts
  category: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  features: string[];
  techStack: string[];
  category: 'ai' | 'analytics' | 'web';
  githubUrl?: string;
  liveUrl?: string;
}

export interface CertificationItem {
  title: string;
  issuer: string;
  year: string;
  credentialUrl?: string;
}

export interface AchievementItem {
  label: string;
  value: number;
  suffix: string;
  icon: string;
}

export const PERSONAL_INFO = {
  name: "Shivam Maurya",
  email: "aniheshmaurya456@gmail.com",
  phone: "+91 9044144059",
  linkedIn: "https://linkedin.com/in/shivam-maurya-b5468932b",
  linkedInLabel: "linkedin.com/in/shivam-maurya-b5468932b",
  github: "https://github.com/DevShivam-maurya",
  githubLabel: "github.com/DevShivam-maurya",
  tagline: "AI Engineer • Data Analyst • Full Stack Developer",
  avatarSeed: "Shivam",
  bio: [
    "Computer Science Engineering (Data Science) student passionate about Artificial Intelligence, Data Analytics, and Full Stack Development.",
    "Skilled in Python, SQL, React.js, and modern analytics tools with hands-on experience building AI-powered and web-based solutions.",
    "Focused on solving real-world problems through technology, continuous learning, and practical implementation of data-driven systems."
  ]
};

export const EDUCATION: EducationItem[] = [
  {
    institution: "GL Bajaj Institute of Technology and Management",
    degree: "B.Tech in Computer Science Engineering (Data Science)",
    status: "Pursuing",
    year: "2023 - 2027",
    details: "Focusing on core machine learning concepts, statistical analytics, neural networks, databases, and advanced algorithms."
  },
  {
    institution: "Academic Global School, Gorakhpur",
    degree: "Class XII (Senior Secondary School)",
    score: "78.6%",
    year: "2023",
    details: "Science stream with Physics, Chemistry, and Mathematics."
  },
  {
    institution: "Saraswati Vidya Mandir, Gorakhpur",
    degree: "Class X (Secondary School)",
    score: "90.16%",
    year: "2021",
    details: "General science and foundational mathematics with high distinction."
  }
];

export const SKILLS: SkillItem[] = [
  // Programming
  { name: "C++", level: 85, category: "Programming" },
  { name: "Python", level: 90, category: "Programming" },

  // Data Analytics
  { name: "SQL", level: 88, category: "Data Analytics" },
  { name: "Power BI", level: 82, category: "Data Analytics" },
  { name: "Tableau", level: 80, category: "Data Analytics" },
  { name: "Excel", level: 85, category: "Data Analytics" },
  { name: "NumPy", level: 88, category: "Data Analytics" },
  { name: "Pandas", level: 90, category: "Data Analytics" },
  { name: "Matplotlib", level: 85, category: "Data Analytics" },

  // Web Development
  { name: "HTML/CSS", level: 90, category: "Web Development" },
  { name: "JavaScript", level: 88, category: "Web Development" },
  { name: "React.js", level: 88, category: "Web Development" },

  // Database
  { name: "MongoDB", level: 82, category: "Database" },

  // AI & ML
  { name: "Generative AI", level: 92, category: "AI & ML" },
  { name: "Prompt Engineering", level: 95, category: "AI & ML" },
  { name: "AI Tools", level: 90, category: "AI & ML" },

  // Core Concepts
  { name: "Data Structures & Algorithms", level: 85, category: "Core Concepts" },
  { name: "Problem Solving", level: 90, category: "Core Concepts" },
  { name: "UI/UX Basics", level: 80, category: "Core Concepts" }
];

export const PROJECTS: ProjectItem[] = [
  {
    id: "ai-profile-enhancer",
    title: "AI Profile Enhancer System",
    description: "An intelligent, AI-powered developer evaluation platform that crawls and analyzes public profiles (GitHub, LinkedIn, Instagram, portfolios) to extract scores, recommend brand updates, and match skill gaps.",
    features: [
      "Dynamic Resume & Profile Scoring System with granular metric report card.",
      "Automated Skill Gap Detection matching profiles against current job trends.",
      "Aesthetic Analytics Dashboard with custom visualizations.",
      "AI-driven branding suggestions to elevate online presence for product-based roles."
    ],
    techStack: ["React.js", "Python", "MongoDB", "AI APIs", "Framer Motion", "TailwindCSS"],
    category: "ai",
    githubUrl: "https://github.com/DevShivam-maurya",
    liveUrl: "#"
  },
  {
    id: "lifeline-ai-assistant",
    title: "LifeLine AI Assistant",
    description: "An advanced, human-aligned conversational AI companion facilitating continuous career development, daily task scheduling, milestone tracking, and dynamic problem-solving assistance.",
    features: [
      "Custom structural Career Roadmap Generator tailored with skill timeline milestones.",
      "Productivity dashboard with embedded task planning and goal priority tracking.",
      "Daily decision assistance engine with smart heuristic advice algorithms.",
      "Highly interactive glassmorphic chat widget for instant guidance."
    ],
    techStack: ["React.js", "Python", "Vite", "Gemini Pro API", "CSS Modules"],
    category: "ai",
    githubUrl: "https://github.com/DevShivam-maurya",
    liveUrl: "#"
  }
];

export const CERTIFICATIONS: CertificationItem[] = [
  {
    title: "Data Analyst Certification",
    issuer: "Authorized Academy",
    year: "2024",
    credentialUrl: "https://github.com/DevShivam-maurya"
  },
  {
    title: "Palo Alto Networks Cybersecurity Certification",
    issuer: "Palo Alto Networks",
    year: "2023",
    credentialUrl: "https://github.com/DevShivam-maurya"
  }
];

export const ACHIEVEMENTS: AchievementItem[] = [
  { label: "AI Projects Built", value: 5, suffix: "+", icon: "Cpu" },
  { label: "Technologies Mastered", value: 15, suffix: "+", icon: "Terminal" },
  { label: "Coding Practice Score", value: 300, suffix: "+", icon: "Award" },
  { label: "Professional Certs", value: 4, suffix: "+", icon: "ShieldCheck" }
];
