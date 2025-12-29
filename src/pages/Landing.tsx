import { Link } from "react-router-dom";
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
  Award
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
    color: "primary",
  },
  {
    step: 2,
    icon: Briefcase,
    title: "Choose Target Role",
    description: "Browse and select from our curated list of in-demand tech positions.",
    features: ["8+ job roles", "Salary insights", "Demand indicators"],
    color: "info",
  },
  {
    step: 3,
    icon: BarChart3,
    title: "Analyze Skill Gaps",
    description: "Get an instant readiness score and see exactly what skills you need.",
    features: ["Readiness percentage", "Matched skills", "Gap identification"],
    color: "warning",
  },
  {
    step: 4,
    icon: BookOpen,
    title: "Follow Your Roadmap",
    description: "Access a personalized learning path with curated resources for each skill.",
    features: ["Curated resources", "Progress tracking", "Time estimates"],
    color: "accent",
  },
];

const stats = [
  { value: "45+", label: "Skills Tracked" },
  { value: "8+", label: "Job Roles" },
  { value: "100+", label: "Learning Resources" },
  { value: "85%", label: "Avg Improvement" },
];

const testimonials = [
  {
    quote: "SkillBridge helped me identify exactly what I needed to learn to become a full-stack developer.",
    author: "Sarah K.",
    role: "Frontend → Full Stack",
  },
  {
    quote: "The personalized roadmap saved me months of figuring out what to study next.",
    author: "Michael R.",
    role: "Junior → Senior Dev",
  },
  {
    quote: "Finally, a tool that shows me the gap between where I am and where I want to be.",
    author: "Priya M.",
    role: "Data Analyst → ML Engineer",
  },
];

export const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">SkillBridge</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
                <Zap className="h-4 w-4" />
                AI-Powered Career Development
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                From <span className="text-primary">Current Skills</span>
                <br />
                to <span className="text-accent">Dream Career</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Identify your skill gaps, get a personalized learning roadmap, and track your journey to your dream job.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login">
                  <Button size="lg" className="text-lg px-8 h-14 group">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-8 h-14" asChild>
                  <a href="#how-it-works">See How It Works</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-8 border-y border-border bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Journey Steps */}
        <section id="how-it-works" className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Your Journey to Success</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Four simple steps to bridge the gap between your current skills and your dream role
              </p>
            </div>

            <div className="max-w-5xl mx-auto space-y-8">
              {journeySteps.map((step, index) => {
                const Icon = step.icon;
                const isEven = index % 2 === 0;
                return (
                  <Card key={step.step} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                        {/* Content */}
                        <div className="flex-1 p-8 md:p-12">
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`h-12 w-12 rounded-2xl bg-${step.color}/10 flex items-center justify-center`}>
                              <Icon className={`h-6 w-6 text-${step.color}`} />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Step {step.step}</span>
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold mb-3">{step.title}</h3>
                          <p className="text-lg text-muted-foreground mb-6">{step.description}</p>
                          <ul className="space-y-2">
                            {step.features.map((feature) => (
                              <li key={feature} className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-accent" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {/* Visual */}
                        <div className={`flex-1 bg-gradient-to-br from-${step.color}/10 to-${step.color}/5 p-8 md:p-12 flex items-center justify-center min-h-[200px]`}>
                          <div className="text-center">
                            <Icon className={`h-24 w-24 text-${step.color}/30 mx-auto mb-4`} />
                            <div className="text-6xl font-bold text-${step.color}/20">{step.step}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Success Stories</h2>
              <p className="text-xl text-muted-foreground">
                Join thousands who've transformed their careers
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-card">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Award key={i} className="h-4 w-4 text-warning fill-warning" />
                      ))}
                    </div>
                    <p className="text-foreground mb-4">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
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
            <Card className="bg-gradient-to-br from-primary to-primary/80 border-0 overflow-hidden">
              <CardContent className="p-12 md:p-20 text-center text-primary-foreground">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Ready to Bridge Your Skill Gap?</h2>
                <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
                  Start your personalized learning journey today and take the first step towards your dream career.
                </p>
                <Link to="/login">
                  <Button size="lg" variant="secondary" className="text-lg px-8 h-14">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
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
