import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import {
  ArrowRight, Sparkles, Zap, TrendingUp, Users, Shield,
  Brain, Rocket, Target, Code, Database, Globe, Lock,
  CheckCircle2, Star, Play, BarChart3, Briefcase
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";

// --- Constants & Data ---

const salaryData = [
  { name: 'Jan', frontend: 4000, fullstack: 2400 },
  { name: 'Feb', frontend: 3000, fullstack: 1398 },
  { name: 'Mar', frontend: 2000, fullstack: 9800 },
  { name: 'Apr', frontend: 2780, fullstack: 3908 },
  { name: 'May', frontend: 1890, fullstack: 4800 },
  { name: 'Jun', frontend: 2390, fullstack: 3800 },
  { name: 'Jul', frontend: 3490, fullstack: 4300 },
];

const demandData = [
  { name: 'React', value: 95 },
  { name: 'Node.js', value: 85 },
  { name: 'Python', value: 75 },
  { name: 'AWS', value: 70 },
];

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Our advanced algorithms analyze your code and career history to identify precise skill gaps.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Rocket,
    title: "Accelerated Learning",
    description: "Custom-tailored curriculums that get you job-ready 3x faster than traditional methods.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Target,
    title: "Market-Aligned",
    description: "Curriculum updated weekly based on real-time job market data and hiring trends.",
    color: "from-emerald-500 to-green-500",
  },
];

const testimonials = [
  {
    quote: "SkillBridge transformed my career. The data-driven insights showed me exactly what I was missing.",
    author: "Sarah Chen",
    role: "Senior Engineer at Google",
    rating: 5,
  },
  {
    quote: "I stopped wasting time on outdated tutorials. This platform gave me a direct path to promotion.",
    author: "Michael Ross",
    role: "Tech Lead at Netflix",
    rating: 5,
  },
];

// --- Animations ---

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

// --- Components ---

const HeroSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <motion.div
        style={{ y, opacity }}
        className="container relative z-10 px-4 text-center"
      >
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-4xl mx-auto space-y-8"
        >
          <motion.div variants={fadeInUp} className="flex justify-center">
            <Badge variant="outline" className="px-4 py-1.5 text-sm rounded-full border-primary/30 bg-primary/5 backdrop-blur-md">
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              <span>AI-Powered Career Acceleration</span>
            </Badge>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold tracking-tight leading-loose">
            Master the Skills <br />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
              High-Growth Tech Needs
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Stop guessing. Our AI analyzes real-time market data to build your personalized roadmap to a higher salary and better role.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/login">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full backdrop-blur-sm hover:bg-muted/50">
              <Play className="mr-2 w-4 h-4" /> Watch Demo
            </Button>
          </motion.div>

          {/* Floating Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-16 text-left">
            {[
              { label: "Active Learners", value: "50k+", icon: Users },
              { label: "Career Paths", value: "120+", icon: Target },
              { label: "Hiring Partners", value: "500+", icon: Briefcase },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Card className="bg-background/50 backdrop-blur-md border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

const MarketDataSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
              <TrendingUp className="w-3 h-3 mr-2" /> Real-time Insights
            </Badge>
            <h2 className="text-4xl font-bold leading-tight">
              Data-Driven Career <br />
              <span className="text-primary">Decision Making</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Don't follow the hype. Follow the data. We track millions of job postings to tell you exactly which skills pay the most and are in highest demand right now.
            </p>

            <div className="space-y-4 pt-4">
              {[
                { label: "Salary Trends Analysis", icon: CheckCircle2 },
                { label: "Skill Demand Forecasting", icon: CheckCircle2 },
                { label: "Personalized Gap Analysis", icon: CheckCircle2 },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <item.icon className="w-5 h-5 text-green-500" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Charts Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ duration: 1, type: "spring" }}
            className="relative"
          >
            <Card className="bg-background/80 backdrop-blur-xl border-border shadow-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">Fullstack vs Frontend Salary</h3>
                  <p className="text-sm text-muted-foreground">Monthly growth projection (USD)</p>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salaryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorFullstack" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorFrontend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" fontSize={12} stroke="#888888" />
                      <YAxis fontSize={12} stroke="#888888" />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="fullstack"
                        stroke="#8b5cf6"
                        fillOpacity={1}
                        fill="url(#colorFullstack)"
                        strokeWidth={3}
                      />
                      <Area
                        type="monotone"
                        dataKey="frontend"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorFrontend)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Floating Badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 p-4 bg-background rounded-2xl shadow-xl border border-primary/20 max-w-[180px]"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Data</span>
              </div>
              <div className="text-2xl font-bold">+127%</div>
              <div className="text-xs text-muted-foreground">Growth demand for Fullstack roles</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  return (
    <section className="py-24 container mx-auto px-4">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">Why SkillBridge?</h2>
        <p className="text-xl text-muted-foreground">
          We don't just teach code. We engineer careers using data, AI, and industry insights.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="h-full bg-card/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 border-border/50">
              <CardContent className="p-8">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export const SimpleLanding = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">SkillBridge</span>
          </div>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <HeroSection />
        <MarketDataSection />
        <FeaturesSection />

        <section className="py-24 container mx-auto px-4 bg-muted/20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Success Stories</h2>
            <p className="text-xl text-muted-foreground">
              See how others are accelerating their careers.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <Card className="h-full bg-background/60 backdrop-blur-sm border-border/50">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <blockquote className="text-lg font-medium mb-6">"{testimonial.quote}"</blockquote>
                    <div>
                      <div className="font-bold">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <motion.div
            className="container mx-auto px-4 relative z-10 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="max-w-3xl mx-auto bg-gradient-to-br from-background to-background/50 border border-border/50 p-12 rounded-3xl shadow-2xl backdrop-blur-2xl">
              <h2 className="text-4xl font-bold mb-6">Ready to Accelerate?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of developers climbing the career ladder faster with data-driven insights.
              </p>
              <Link to="/login">
                <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/20">
                  Start Your Journey Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main >

      <footer className="py-12 border-t border-border/50 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">SkillBridge</span>
          </div>
          <p className="text-sm">© 2024 SkillBridge. All rights reserved.</p>
        </div>
      </footer>
    </div >
  );
};