import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { 
  ArrowRight, 
  Target, 
  Briefcase, 
  BarChart3, 
  BookOpen, 
  CheckCircle2, 
  Sparkles,
  Users,
  Zap,
  Award,
  TrendingUp,
  Lightbulb,
  Rocket,
  Star,
  Play,
  ChevronRight,
  Globe,
  Shield,
  Clock,
  Brain,
  Code,
  Database,
  Palette,
  Smartphone,
  Cloud,
  Lock,
  MessageSquare,
  Heart,
  Coffee,
  Gamepad2,
  Music,
  Camera,
  Headphones
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const skillIcons = [
  { icon: Code, name: "Frontend", color: "from-blue-500 to-cyan-400" },
  { icon: Database, name: "Backend", color: "from-green-500 to-emerald-400" },
  { icon: Palette, name: "Design", color: "from-purple-500 to-pink-400" },
  { icon: Smartphone, name: "Mobile", color: "from-orange-500 to-red-400" },
  { icon: Cloud, name: "DevOps", color: "from-indigo-500 to-blue-400" },
  { icon: Brain, name: "AI/ML", color: "from-violet-500 to-purple-400" },
  { icon: Lock, name: "Security", color: "from-red-500 to-pink-400" },
  { icon: Globe, name: "Web3", color: "from-yellow-500 to-orange-400" },
];

const journeySteps = [
  {
    step: 1,
    icon: Target,
    title: "Discover Your Skills",
    description: "Take our comprehensive skill assessment and discover your current proficiency across 45+ in-demand technologies.",
    features: ["45+ skills database", "AI-powered assessment", "Instant proficiency scoring", "Industry benchmarking"],
    gradient: "from-blue-500 via-blue-600 to-cyan-500",
    bgPattern: "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15), transparent 50%)",
  },
  {
    step: 2,
    icon: Briefcase,
    title: "Choose Your Dream Role",
    description: "Explore curated career paths with real salary data, growth projections, and market demand insights.",
    features: ["12+ career paths", "Real-time salary data", "Market demand analysis", "Growth projections"],
    gradient: "from-violet-500 via-purple-600 to-indigo-500",
    bgPattern: "radial-gradient(circle at 70% 30%, rgba(139, 92, 246, 0.3), transparent 50%), radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.15), transparent 50%)",
  },
  {
    step: 3,
    icon: BarChart3,
    title: "Analyze Your Gap",
    description: "Get detailed gap analysis with personalized recommendations and a clear roadmap to your target role.",
    features: ["Detailed gap analysis", "Personalized recommendations", "Priority skill ranking", "Time-to-proficiency estimates"],
    gradient: "from-amber-500 via-orange-600 to-red-500",
    bgPattern: "radial-gradient(circle at 40% 60%, rgba(245, 158, 11, 0.3), transparent 50%), radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.15), transparent 50%)",
  },
  {
    step: 4,
    icon: BookOpen,
    title: "Master Your Journey",
    description: "Follow your AI-curated learning path with interactive courses, projects, and real-world challenges.",
    features: ["AI-curated content", "Interactive projects", "Progress tracking", "Community support"],
    gradient: "from-emerald-500 via-green-600 to-teal-500",
    bgPattern: "radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.3), transparent 50%), radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.15), transparent 50%)",
  },
];

const stats = [
  { value: "50K+", label: "Learners Transformed", icon: Users, color: "text-blue-500" },
  { value: "45+", label: "Skills Tracked", icon: Target, color: "text-purple-500" },
  { value: "12+", label: "Career Paths", icon: Briefcase, color: "text-green-500" },
  { value: "95%", label: "Success Rate", icon: TrendingUp, color: "text-orange-500" },
];

const testimonials = [
  {
    quote: "SkillBridge transformed my career in just 6 months. The personalized roadmap was exactly what I needed to transition from frontend to full-stack development.",
    author: "Sarah Chen",
    role: "Frontend → Full Stack Developer",
    company: "Google",
    avatar: "SC",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  },
  {
    quote: "The AI-powered skill gap analysis was incredibly accurate. It identified exactly what I was missing and provided a clear path to my dream job at Microsoft.",
    author: "Michael Rodriguez",
    role: "Junior → Senior Developer",
    company: "Microsoft",
    avatar: "MR",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    quote: "Finally, a platform that understands the real skills needed in the industry. The learning resources are top-notch and always up-to-date.",
    author: "Priya Patel",
    role: "Data Analyst → ML Engineer",
    company: "Netflix",
    avatar: "PP",
    rating: 5,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
  },
];

const features = [
  {
    icon: Brain,
    title: "AI-Powered Intelligence",
    description: "Advanced algorithms analyze your skills and create personalized learning paths that adapt to your progress.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Rocket,
    title: "Accelerated Growth",
    description: "Get job-ready 3x faster with our proven methodology and curated learning resources from industry experts.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Shield,
    title: "Industry Validated",
    description: "Our curriculum is validated by hiring managers from top tech companies and updated monthly.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Join a thriving community of learners, mentors, and industry professionals supporting your journey.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Clock,
    title: "Time Optimized",
    description: "Smart scheduling and micro-learning techniques help you make progress even with a busy schedule.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Award,
    title: "Career Focused",
    description: "Every skill and project is designed to make you more attractive to employers and advance your career.",
    color: "from-yellow-500 to-orange-500",
  },
];

const companies = [
  { name: "Google", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" },
  { name: "Microsoft", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoft/microsoft-original.svg" },
  { name: "Amazon", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg" },
  { name: "Meta", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg" },
  { name: "Netflix", logo: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=100&h=100&fit=crop" },
  { name: "Apple", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg" },
];

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const FloatingSkill = ({ skill, index }: { skill: typeof skillIcons[0], index: number }) => {
  const Icon = skill.icon;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      className={`absolute p-3 rounded-2xl bg-gradient-to-br ${skill.color} shadow-lg backdrop-blur-sm`}
      style={{
        left: `${20 + (index % 3) * 30}%`,
        top: `${20 + Math.floor(index / 3) * 25}%`,
        transform: `rotate(${(index % 2 ? 1 : -1) * (index * 3)}deg)`,
      }}
    >
      <Icon className="h-6 w-6 text-white" />
    </motion.div>
  );
};

export const SimpleLanding = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <motion.div 
          className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ 
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ left: '10%', top: '20%' }}
        />
        <motion.div 
          className="absolute w-80 h-80 bg-accent/10 rounded-full blur-3xl"
          animate={{ 
            x: mousePosition.x * -0.02,
            y: mousePosition.y * -0.02,
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ right: '10%', bottom: '20%' }}
        />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-xl shadow-primary/25">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SkillBridge
              </span>
              <div className="text-xs text-muted-foreground font-medium">AI-Powered Career Growth</div>
            </div>
          </motion.div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How it Works</a>
              <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">Success Stories</a>
            </nav>
            <ThemeToggle />
            <Link to="/login">
              <Button className="shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 group">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      <main>
        {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
          <motion.div 
            style={{ y: heroY, opacity: heroOpacity }}
            className="container mx-auto px-4 relative z-10"
          >
            <motion.div 
              variants={stagger}
              initial="initial"
              animate="animate"
              className="max-w-6xl mx-auto"
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="space-y-8">
                  <motion.div 
                    variants={fadeInUp}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-primary text-sm font-medium backdrop-blur-sm"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Trusted by 50,000+ professionals</span>
                    <Badge variant="secondary" className="ml-2">New</Badge>
                  </motion.div>
                  
                  <motion.h1 
                    variants={fadeInUp}
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
                  >
                    Transform Your
                    <br />
                    <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                      Tech Career
                    </span>
                    <br />
                    with AI
                  </motion.h1>
                  
                  <motion.p 
                    variants={fadeInUp}
                    className="text-xl text-muted-foreground leading-relaxed max-w-2xl"
                  >
                    Discover your skill gaps, get personalized learning paths, and land your dream job 
                    with our AI-powered career development platform trusted by top tech companies.
                  </motion.p>
                  
                  <motion.div 
                    variants={fadeInUp}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <Link to="/login">
                      <Button size="lg" className="text-lg px-8 h-14 group shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all duration-300 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                        Start Your Journey
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="text-lg px-8 h-14 backdrop-blur-sm group" asChild>
                      <a href="#demo" className="flex items-center gap-2">
                        <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        Watch Demo
                      </a>
                    </Button>
                  </motion.div>

                  <motion.div 
                    variants={fadeInUp}
                    className="flex items-center gap-6 pt-4"
                  >
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">4.9/5</span> from 2,000+ reviews
                    </div>
                  </motion.div>
                </div>

                {/* Right Visual */}
                <motion.div 
                  variants={fadeInUp}
                  className="relative h-[600px] hidden lg:block"
                >
                  {/* Main Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute inset-0 bg-gradient-to-br from-card via-card to-card/80 rounded-3xl border border-border/50 shadow-2xl backdrop-blur-xl overflow-hidden"
                  >
                    <div className="p-8 h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">Skill Analysis</div>
                          <div className="text-sm text-muted-foreground">Your personalized report</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4 flex-1">
                        {['React', 'TypeScript', 'Node.js', 'Python'].map((skill, index) => (
                          <motion.div
                            key={skill}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + index * 0.1 }}
                            className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                          >
                            <span className="font-medium">{skill}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${85 - index * 10}%` }}
                                  transition={{ delay: 1 + index * 0.1, duration: 0.8 }}
                                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                />
                              </div>
                              <span className="text-sm font-medium">{85 - index * 10}%</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Floating Skills */}
                  {skillIcons.map((skill, index) => (
                    <FloatingSkill key={skill.name} skill={skill} index={index} />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Companies Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-16 border-y border-border/50 bg-muted/30"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-sm font-medium text-muted-foreground mb-8">
                Trusted by professionals at leading companies
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60 hover:opacity-100 transition-opacity duration-500">
                {companies.map((company) => (
                  <motion.div
                    key={company.name}
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-300"
                  >
                    <img src={company.logo} alt={company.name} className="h-8 w-8" />
                    <span className="font-semibold text-lg">{company.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="py-24"
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="text-center group"
                  >
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                    <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <section id="features" className="py-24 md:py-32 bg-gradient-to-b from-transparent via-muted/20 to-transparent">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <Badge variant="outline" className="mb-4">Features</Badge>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Why Choose{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  SkillBridge?
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Everything you need to accelerate your career growth and land your dream job in tech
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group overflow-hidden">
                      <CardContent className="p-8">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Journey Steps */}
        <section id="how-it-works" className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <Badge variant="outline" className="mb-4">How It Works</Badge>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Your Journey to{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Success
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Four simple steps to bridge the gap between your current skills and your dream role
              </p>
            </motion.div>

            <div className="max-w-7xl mx-auto space-y-12">
              {journeySteps.map((step, index) => {
                const Icon = step.icon;
                const isEven = index % 2 === 0;
                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: isEven ? -100 : 100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group">
                      <CardContent className="p-0">
                        <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                          {/* Content */}
                          <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
                            <div className="flex items-center gap-4 mb-8">
                              <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                                <Icon className="h-8 w-8 text-white" />
                              </div>
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                                <span className="text-lg font-bold text-white">{step.step}</span>
                              </div>
                            </div>
                            <h3 className="text-3xl lg:text-4xl font-bold mb-6 group-hover:text-primary transition-colors">
                              {step.title}
                            </h3>
                            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                              {step.description}
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              {step.features.map((feature) => (
                                <div key={feature} className="flex items-center gap-3">
                                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                  <span className="text-sm font-medium">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* Visual */}
                          <div className={`flex-1 bg-gradient-to-br ${step.gradient} p-8 lg:p-12 flex items-center justify-center min-h-[400px] relative overflow-hidden`}>
                            <div className="absolute inset-0" style={{ background: step.bgPattern }} />
                            <div className="relative text-center">
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 300, damping: 10 }}
                              >
                                <Icon className="h-32 w-32 text-white/30 mx-auto mb-6" />
                              </motion.div>
                              <div className="text-9xl font-bold text-white/10 select-none">
                                {step.step}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 md:py-32 bg-gradient-to-b from-transparent via-muted/20 to-transparent">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <Badge variant="outline" className="mb-4">Success Stories</Badge>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                What Our{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Learners Say
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Join thousands who've transformed their careers with SkillBridge
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 group overflow-hidden">
                    <CardContent className="p-8">
                      <div className="flex gap-1 mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <blockquote className="text-lg text-foreground mb-8 leading-relaxed italic">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={testimonial.image} 
                            alt={testimonial.author}
                            className="h-14 w-14 rounded-full object-cover border-2 border-primary/20"
                          />
                          <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{testimonial.author}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                          <p className="text-sm font-medium text-primary">{testimonial.company}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-primary via-primary to-accent border-0 overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)] opacity-50" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.05),transparent)]" />
                <CardContent className="p-12 md:p-20 text-center text-primary-foreground relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="max-w-4xl mx-auto"
                  >
                    <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
                      Limited Time Offer
                    </Badge>
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                      Ready to Transform Your Career?
                    </h2>
                    <p className="text-xl opacity-90 max-w-3xl mx-auto mb-10 leading-relaxed">
                      Join 50,000+ professionals who've accelerated their careers with SkillBridge. 
                      Start your personalized learning journey today and land your dream job faster.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <Link to="/login">
                        <Button size="lg" variant="secondary" className="text-lg px-10 h-16 shadow-2xl hover:shadow-xl transition-all duration-300 group bg-white text-primary hover:bg-white/90">
                          Start Free Trial
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      <div className="flex items-center gap-2 text-white/80">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>No credit card required</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-8 mt-12 text-white/60">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        <span className="text-sm">30-day money back</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <span className="text-sm">50K+ happy users</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        <span className="text-sm">Industry certified</span>
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">SkillBridge</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                AI-powered career development platform helping professionals bridge their skill gaps and land dream jobs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-border/50">
            <p className="text-muted-foreground text-sm">
              © 2024 SkillBridge. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">4.9/5 from 2,000+ reviews</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};