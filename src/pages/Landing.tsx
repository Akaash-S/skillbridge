import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
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
  Globe,
  Shield,
  Clock,
  Play,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";

const journeySteps = [
  {
    step: 1,
    icon: Target,
    title: "Add Your Skills",
    description: "Input your current skills and rate your proficiency level from beginner to advanced.",
    features: ["45+ skills database", "3 proficiency levels", "Skill categorization"],
    gradient: "from-blue-500 to-cyan-400",
    color: "#3b82f6",
  },
  {
    step: 2,
    icon: Briefcase,
    title: "Choose Target Role",
    description: "Browse and select from our curated list of in-demand tech positions.",
    features: ["8+ job roles", "Salary insights", "Demand indicators"],
    gradient: "from-violet-500 to-purple-400",
    color: "#8b5cf6",
  },
  {
    step: 3,
    icon: BarChart3,
    title: "Analyze Skill Gaps",
    description: "Get an instant readiness score and see exactly what skills you need.",
    features: ["Readiness percentage", "Matched skills", "Gap identification"],
    gradient: "from-amber-500 to-orange-400",
    color: "#f59e0b",
  },
  {
    step: 4,
    icon: BookOpen,
    title: "Follow Your Roadmap",
    description: "Access a personalized learning path with curated resources for each skill.",
    features: ["Curated resources", "Progress tracking", "Time estimates"],
    gradient: "from-emerald-500 to-teal-400",
    color: "#10b981",
  },
];

const stats = [
  { value: "45+", label: "Skills Tracked", icon: Target },
  { value: "8+", label: "Job Roles", icon: Briefcase },
  { value: "100+", label: "Learning Resources", icon: BookOpen },
  { value: "85%", label: "Success Rate", icon: TrendingUp },
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

export const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">SkillBridge</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Zap className="h-4 w-4" />
                AI-Powered Career Development
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                Bridge Your{" "}
                <span className="text-primary">Skill Gap</span>
                <br />
                Unlock Your{" "}
                <span className="text-primary">Dream Career</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                Get personalized learning roadmaps, track your progress, and land your dream job with data-driven insights.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link to="/login">
                  <Button size="lg" className="text-base px-8 h-12">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-base px-8 h-12" asChild>
                  <a href="#how-it-works">
                    <Play className="mr-2 h-4 w-4" />
                    See How It Works
                  </a>
                </Button>
              </div>

              {/* Quick Demo */}
              <div className="relative max-w-3xl mx-auto">
                <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted rounded-xl border shadow-2xl overflow-hidden">
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-muted-foreground">Interactive Demo Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 border-y bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose SkillBridge?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to accelerate your career growth
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="text-center border-0 shadow-lg">
                    <CardContent className="p-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Four simple steps to transform your career
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    step: 1,
                    icon: Target,
                    title: "Add Skills",
                    description: "Input your current skills and proficiency levels"
                  },
                  {
                    step: 2,
                    icon: Briefcase,
                    title: "Choose Role",
                    description: "Select your target job role from our database"
                  },
                  {
                    step: 3,
                    icon: BarChart3,
                    title: "Analyze Gaps",
                    description: "Get instant analysis of your skill gaps"
                  },
                  {
                    step: 4,
                    icon: BookOpen,
                    title: "Follow Roadmap",
                    description: "Learn with personalized learning paths"
                  }
                ].map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.step} className="text-center">
                      <div className="relative mb-6">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Icon className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{step.step}</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Success Stories</h2>
              <p className="text-xl text-muted-foreground">
                Join thousands who've transformed their careers
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{testimonial.author}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <Card className="bg-primary text-primary-foreground border-0 max-w-4xl mx-auto">
              <CardContent className="p-12 md:p-16 text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
                <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                  Join thousands of professionals who've successfully bridged their skill gaps.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/login">
                    <Button size="lg" variant="secondary" className="text-base px-8 h-12">
                      Start Free Today
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="text-base px-8 h-12 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">SkillBridge</span>
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
