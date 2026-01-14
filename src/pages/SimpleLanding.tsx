import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  ArrowRight, Sparkles, TrendingUp, Users, 
  Brain, Rocket, Target, CheckCircle2, Star, Play, 
  Briefcase, BookOpen, BarChart3, Zap, Trophy,
  MapPin, Clock, Shield, Globe
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";

// --- Constants & Data ---

const skillProgressData = [
  { name: 'Week 1', progress: 15, readiness: 25 },
  { name: 'Week 2', progress: 35, readiness: 45 },
  { name: 'Week 3', progress: 55, readiness: 65 },
  { name: 'Week 4', progress: 75, readiness: 80 },
  { name: 'Week 5', progress: 90, readiness: 92 },
  { name: 'Week 6', progress: 100, readiness: 95 },
];

const roleDistributionData = [
  { name: 'Frontend Developer', value: 35, color: '#3b82f6' },
  { name: 'Full Stack Developer', value: 28, color: '#8b5cf6' },
  { name: 'Backend Developer', value: 20, color: '#10b981' },
  { name: 'Data Scientist', value: 12, color: '#f59e0b' },
  { name: 'DevOps Engineer', value: 5, color: '#ef4444' },
];

const features = [
  {
    icon: Brain,
    title: "AI-Powered Skill Analysis",
    description: "Our intelligent system analyzes your current skills and compares them with market demands to create personalized learning paths.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Target,
    title: "Role-Specific Roadmaps",
    description: "Get customized learning roadmaps tailored to your target role with step-by-step guidance and progress tracking.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: BarChart3,
    title: "Real-Time Progress Tracking",
    description: "Monitor your learning progress with detailed analytics, readiness scores, and milestone celebrations.",
    color: "from-emerald-500 to-green-500",
  },
  {
    icon: Rocket,
    title: "Career Acceleration",
    description: "Fast-track your career growth with industry-aligned skills and direct pathways to high-demand tech roles.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: BookOpen,
    title: "Curated Learning Resources",
    description: "Access hand-picked courses, tutorials, and resources from top platforms like Udemy, Coursera, and freeCodeCamp.",
    color: "from-teal-500 to-blue-500",
  },
  {
    icon: Trophy,
    title: "Achievement System",
    description: "Stay motivated with learning streaks, skill badges, and completion certificates to showcase your progress.",
    color: "from-yellow-500 to-orange-500",
  },
];

const testimonials = [
  {
    quote: "SkillBridge showed me exactly which skills I was missing for my dream job. I got promoted within 3 months!",
    author: "Akaash S, Sanjay R",
    role: "Students @ MSEC",
    rating: 5,
  },
  {
    quote: "The personalized roadmap was a game-changer. No more random tutorials - just focused learning that actually matters.",
    author: "Raj Priyan S K, Lokesh Y",
    role: "Students @ MSEC",
    rating: 5,
  },
];

const stats = [
  { label: "Active Learners", value: "4", icon: Users, description: "Developers improving their skills" },
  { label: "Career Paths", value: "8", icon: MapPin, description: "Tech roles and specializations" },
  { label: "Success Rate", value: "85%", icon: Trophy, description: "Users achieving their career goals" },
  { label: "Avg. Time to Goal", value: "12 weeks", icon: Clock, description: "From start to job readiness" },
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
              <span>Career Accelerator</span>
            </Badge>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold tracking-tight leading-loose">
            Bridge the Gap to <br />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
              Your Dream Tech Role
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover your skill gaps, get personalized learning roadmaps, and track your progress toward landing your ideal tech job with AI-powered career guidance.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/login">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            {/* <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full backdrop-blur-sm hover:bg-muted/50">
              <Play className="mr-2 w-4 h-4" /> See How It Works
            </Button> */}
          </motion.div>

          {/* Floating Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-16 text-left">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Card className="bg-background/50 backdrop-blur-md border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div className="text-xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                    <div className="text-xs text-muted-foreground/70">{stat.description}</div>
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

const ProgressTrackingSection = () => {
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
              <BarChart3 className="w-3 h-3 mr-2" /> Progress Analytics
            </Badge>
            <h2 className="text-4xl font-bold leading-tight">
              Track Your Journey to <br />
              <span className="text-primary">Career Success</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Watch your skills grow and readiness score improve with detailed progress tracking. Our analytics show you exactly how close you are to landing your dream job.
            </p>

            <div className="space-y-4 pt-4">
              {[
                { label: "Skill Gap Analysis", icon: CheckCircle2, description: "Identify exactly what you need to learn" },
                { label: "Readiness Score", icon: CheckCircle2, description: "See your job-readiness percentage in real-time" },
                { label: "Learning Streaks", icon: CheckCircle2, description: "Stay motivated with daily learning goals" },
                { label: "Milestone Tracking", icon: CheckCircle2, description: "Celebrate achievements along the way" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <item.icon className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <span className="font-medium">{item.label}</span>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Progress Chart Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ duration: 1, type: "spring" }}
            className="relative"
          >
            <Card className="bg-background/80 backdrop-blur-xl border-border shadow-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">Learning Progress & Job Readiness</h3>
                  <p className="text-sm text-muted-foreground">Weekly improvement tracking</p>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={skillProgressData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" fontSize={12} stroke="#888888" />
                      <YAxis fontSize={12} stroke="#888888" />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value, name) => [`${value}%`, name === 'progress' ? 'Skills Completed' : 'Job Readiness']}
                      />
                      <Area
                        type="monotone"
                        dataKey="progress"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorProgress)"
                        strokeWidth={3}
                      />
                      <Area
                        type="monotone"
                        dataKey="readiness"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorReadiness)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Floating Achievement Badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 p-4 bg-background rounded-2xl shadow-xl border border-green-500/20 max-w-[180px]"
            >
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Achievement</span>
              </div>
              <div className="text-lg font-bold text-green-600">85% Ready!</div>
              {/* <div className="text-xs text-muted-foreground">Frontend Developer Role</div> */}
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
        <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything You Need to Succeed</h2>
        <p className="text-xl text-muted-foreground">
          From skill analysis to career roadmaps, we provide comprehensive tools to accelerate your tech career growth.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

const RoleDistributionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-muted/20">
      <div className="container px-4 mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Chart Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ duration: 1, type: "spring" }}
            className="relative order-2 lg:order-1"
          >
            <Card className="bg-background/80 backdrop-blur-xl border-border shadow-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">Popular Career Paths</h3>
                  <p className="text-sm text-muted-foreground">Distribution of learners by target role</p>
                </div>
                <div className="h-[300px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {roleDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`${value}%`, 'Learners']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {roleDistributionData.map((role, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                      <span className="text-muted-foreground truncate">{role.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Floating Info Badge */}
            {/* <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 p-4 bg-background rounded-2xl shadow-xl border border-blue-500/20 max-w-[180px]"
            >
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Trending</span>
              </div>
              <div className="text-lg font-bold text-blue-600">Frontend</div>
              <div className="text-xs text-muted-foreground">Most popular career path</div>
            </motion.div> */}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="space-y-6 order-1 lg:order-2"
          >
            <Badge variant="secondary" className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20">
              <Target className="w-3 h-3 mr-2" /> Career Paths
            </Badge>
            <h2 className="text-4xl font-bold leading-tight">
              Choose Your <br />
              <span className="text-primary">Tech Career Path</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Whether you're interested in frontend, backend, full-stack, or data science, we have tailored roadmaps for every major tech role with industry-specific skill requirements.
            </p>

            <div className="space-y-4 pt-4">
              {[
                { label: "9 Career Paths", icon: CheckCircle2, description: "From web development to AI/ML" },
                { label: "Role-Specific Skills", icon: CheckCircle2, description: "Curated skill sets for each position" },
                { label: "Industry Standards", icon: CheckCircle2, description: "Based on real job requirements" },
                { label: "Flexible Learning", icon: CheckCircle2, description: "Switch paths anytime as you grow" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <item.icon className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <span className="font-medium">{item.label}</span>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export const SimpleLanding = () => {
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
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <HeroSection />
        <ProgressTrackingSection />
        <FeaturesSection />
        <RoleDistributionSection />

        {/* Success Stories Section */}
        <section className="py-24 container mx-auto px-4 bg-muted/20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Success Stories</h2>
            <p className="text-xl text-muted-foreground">
              Real developers, real results. See how SkillBridge helped them achieve their career goals.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <Card className="h-full bg-background/60 backdrop-blur-sm border-border/50 hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <blockquote className="text-lg font-medium mb-6 leading-relaxed">"{testimonial.quote}"</blockquote>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{testimonial.author.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-bold">{testimonial.author}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">How SkillBridge Works</h2>
            <p className="text-xl text-muted-foreground">
              Get started in minutes and see results in weeks with our proven 4-step process.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                title: "Choose Your Role",
                description: "Select your target tech role from our comprehensive list of career paths.",
                icon: Target,
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: "2", 
                title: "Analyze Your Skills",
                description: "Our AI analyzes your current skills and identifies gaps for your target role.",
                icon: Brain,
                color: "from-purple-500 to-pink-500"
              },
              {
                step: "3",
                title: "Follow Your Roadmap", 
                description: "Get a personalized learning roadmap with curated resources and milestones.",
                icon: MapPin,
                color: "from-green-500 to-emerald-500"
              },
              {
                step: "4",
                title: "Track Progress",
                description: "Monitor your improvement with detailed analytics and readiness scores.",
                icon: BarChart3,
                color: "from-orange-500 to-red-500"
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
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
              {/* <div className="flex items-center justify-center gap-2 mb-6">
                <Shield className="w-6 h-6 text-green-500" />
                <span className="text-sm font-medium text-green-600">Free to start • No credit card required</span>
              </div> */}
              <h2 className="text-4xl font-bold mb-6">Ready to Bridge Your Skill Gap?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of developers who are accelerating their careers with personalized learning paths and AI-powered insights.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/login">
                  <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/20">
                    Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4" />
                  <span>Get your first analysis in under 5 minutes</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="py-12 border-t border-border/50 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-bold text-foreground">SkillBridge</span>
              <span className="text-sm text-muted-foreground">• Bridge the gap to your dream tech role</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>© 2024 SkillBridge. All rights reserved.</span>
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <span>Made for developers worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};