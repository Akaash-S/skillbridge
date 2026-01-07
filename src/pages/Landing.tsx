import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useApp } from "@/context/AppContext";
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
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const journeySteps = [
  {
    step: 1,
    icon: Target,
    title: "Add Your Skills",
    description: "Input your current skills and rate your proficiency level from beginner to advanced.",
    features: ["45+ skills database", "3 proficiency levels", "Skill categorization"],
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    step: 2,
    icon: Briefcase,
    title: "Choose Target Role",
    description: "Browse and select from our curated list of in-demand tech positions.",
    features: ["8+ job roles", "Salary insights", "Demand indicators"],
    gradient: "from-violet-500 to-purple-400",
  },
  {
    step: 3,
    icon: BarChart3,
    title: "Analyze Skill Gaps",
    description: "Get an instant readiness score and see exactly what skills you need.",
    features: ["Readiness percentage", "Matched skills", "Gap identification"],
    gradient: "from-amber-500 to-orange-400",
  },
  {
    step: 4,
    icon: BookOpen,
    title: "Follow Your Roadmap",
    description: "Access a personalized learning path with curated resources for each skill.",
    features: ["Curated resources", "Progress tracking", "Time estimates"],
    gradient: "from-emerald-500 to-teal-400",
  },
];

const stats = [
  { value: "45+", label: "Skills Tracked", icon: Target },
  { value: "8+", label: "Job Roles", icon: Briefcase },
  { value: "100+", label: "Learning Resources", icon: BookOpen },
  { value: "85%", label: "Avg Improvement", icon: TrendingUp },
];

const testimonials = [
  {
    quote: "SkillBridge helped me identify exactly what I needed to learn to become a full-stack developer.",
    author: "Sarah K.",
    role: "Frontend → Full Stack",
    avatar: "SK",
  },
  {
    quote: "The personalized roadmap saved me months of figuring out what to study next.",
    author: "Michael R.",
    role: "Junior → Senior Dev",
    avatar: "MR",
  },
  {
    quote: "Finally, a tool that shows me the gap between where I am and where I want to be.",
    author: "Priya M.",
    role: "Data Analyst → ML Engineer",
    avatar: "PM",
  },
];

const features = [
  {
    icon: Lightbulb,
    title: "Smart Analysis",
    description: "AI-powered skill gap detection that understands industry requirements."
  },
  {
    icon: Rocket,
    title: "Accelerated Growth",
    description: "Curated learning paths that get you job-ready faster."
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Visual dashboards to monitor your journey and celebrate wins."
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useApp();
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">SkillBridge</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/login">
              <Button className="shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      <main>
        {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8" />
            <motion.div 
              className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          
          <motion.div 
            style={{ y: heroY, opacity: heroOpacity }}
            className="container mx-auto px-4 relative z-10"
          >
            <motion.div 
              variants={stagger}
              initial="initial"
              animate="animate"
              className="max-w-5xl mx-auto text-center"
            >
              <motion.div 
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 backdrop-blur-sm"
              >
                <Zap className="h-4 w-4" />
                AI-Powered Career Development
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]"
              >
                From{" "}
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Current Skills
                </span>
                <br />
                to{" "}
                <span className="bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
                  Dream Career
                </span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
              >
                Identify your skill gaps, get a personalized learning roadmap, 
                and track your journey to your dream job — all in one place.
              </motion.p>
              
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link to="/login">
                  <Button size="lg" className="text-lg px-10 h-14 group shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all duration-300">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-10 h-14 backdrop-blur-sm" asChild>
                  <a href="#how-it-works">See How It Works</a>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
            >
              <motion.div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Bar */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="py-16 border-y border-border/50 bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 backdrop-blur-sm"
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="text-center group"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose SkillBridge?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to accelerate your career growth
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15, duration: 0.5 }}
                  >
                    <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group">
                      <CardContent className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-6 group-hover:scale-110 transition-transform duration-500">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
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
        <section id="how-it-works" className="py-24 md:py-32 bg-gradient-to-b from-transparent via-muted/30 to-transparent">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Your Journey to Success</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Four simple steps to bridge the gap between your current skills and your dream role
              </p>
            </motion.div>

            <div className="max-w-6xl mx-auto space-y-8">
              {journeySteps.map((step, index) => {
                const Icon = step.icon;
                const isEven = index % 2 === 0;
                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                      <CardContent className="p-0">
                        <div className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                          {/* Content */}
                          <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                            <div className="flex items-center gap-4 mb-6">
                              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}>
                                <Icon className="h-7 w-7 text-white" />
                              </div>
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-sm font-bold text-muted-foreground">{step.step}</span>
                              </div>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold mb-4">{step.title}</h3>
                            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{step.description}</p>
                            <ul className="space-y-3">
                              {step.features.map((feature) => (
                                <li key={feature} className="flex items-center gap-3 text-sm">
                                  <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                                  <span className="font-medium">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {/* Visual */}
                          <div className={`flex-1 bg-gradient-to-br ${step.gradient} p-8 md:p-12 flex items-center justify-center min-h-[280px] relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-black/10" />
                            <div className="relative text-center">
                              <Icon className="h-28 w-28 text-white/30 mx-auto mb-4" />
                              <div className="text-8xl font-bold text-white/20">{step.step}</div>
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
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Success Stories</h2>
              <p className="text-xl text-muted-foreground">
                Join thousands who've transformed their careers
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                >
                  <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="flex gap-1 mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Award key={i} className="h-5 w-5 text-warning fill-warning" />
                        ))}
                      </div>
                      <p className="text-lg text-foreground mb-8 leading-relaxed">"{testimonial.quote}"</p>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <p className="font-semibold">{testimonial.author}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
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
              <Card className="bg-gradient-to-br from-primary via-primary to-primary/90 border-0 overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
                <CardContent className="p-12 md:p-20 text-center text-primary-foreground relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Bridge Your Skill Gap?</h2>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto mb-10 leading-relaxed">
                      Start your personalized learning journey today and take the first step towards your dream career.
                    </p>
                    <Link to="/login">
                      <Button size="lg" variant="secondary" className="text-lg px-10 h-14 shadow-2xl hover:shadow-xl transition-all duration-300">
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">SkillBridge</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 SkillBridge. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
