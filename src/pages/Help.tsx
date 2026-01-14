import { Layout } from "@/components/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Compass,
  Target,
  TrendingUp,
  Map,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Layers,
  BarChart3,
  Route,
  Shield,
  Mail,
  Send,
  MessageSquare,
  Phone,
  Clock,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/services/apiClient";
import { env } from "@/config/env";

const Help = () => {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    type: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Handle contact form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter your message before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!contactForm.type) {
      toast({
        title: "Type Required", 
        description: "Please select the type of inquiry.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Send feedback email using the API client
      const response = await apiClient.post('/email/feedback', {
        type: contactForm.type,
        message: contactForm.message
      });

      if (response) {
        setIsSubmitted(true);
        setContactForm({
          name: user?.name || '',
          email: user?.email || '',
          type: '',
          message: ''
        });
        
        toast({
          title: "Message Sent Successfully! ✅",
          description: "Thank you for contacting us. We'll get back to you within 24-48 hours.",
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast({
        title: "Failed to Send Message",
        description: error.message || "There was an error sending your message. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Test API connection
  const testApiConnection = async () => {
    try {
      const response = await apiClient.publicRequest<{success: boolean, message: string}>('/email/test-connection');
      toast({
        title: "API Connection Test",
        description: `✅ ${response.message}`,
      });
    } catch (error: any) {
      toast({
        title: "API Connection Failed",
        description: `❌ ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const steps = [
    {
      icon: Layers,
      title: "Add Your Skills",
      description: "Tell us what you already know. No experience is too small.",
      link: "/guide/add-skills",
    },
    {
      icon: Target,
      title: "Choose a Career Goal",
      description: "Pick a role you're aiming for. You can always change it later.",
      link: "/guide/career-goal",
    },
    {
      icon: BarChart3,
      title: "Analyze Skill Gaps",
      description: "See exactly what's missing between where you are and where you want to be.",
      link: "/guide/skill-gap",
    },
    {
      icon: Route,
      title: "Follow Your Roadmap",
      description: "Get a personalized learning path built just for you.",
      link: "/guide/roadmap",
    },
    {
      icon: TrendingUp,
      title: "Track Your Growth",
      description: "Watch your readiness improve as you learn new skills.",
      link: "/guide/growth-tracking",
    },
  ];

  const faqs = [
    {
      question: "Can I change my career goal?",
      answer: "Yes! You can update your career goal anytime from your Profile or Career Hub. Your roadmap will automatically adjust to match your new direction.",
    },
    {
      question: "Can I edit my skills?",
      answer: "Absolutely. Head to the Skills page to add new skills, update proficiency levels, or remove skills that no longer apply.",
    },
    {
      question: "Is my data private?",
      answer: "Your data is completely private by default. We never share your personal information. You control what's visible in your Privacy Settings.",
    },
    {
      question: "How often is readiness updated?",
      answer: "Your readiness score updates instantly whenever you add a new skill, complete a milestone, or change your career goal.",
    },
    {
      question: "What if I don't know which career to choose?",
      answer: "That's okay! Visit the Career Hub to explore roles that match your current skills. We'll show you options you might not have considered.",
    },
  ];

  // Animation variants with proper typing
  const sectionVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
        delayChildren: 0.1
      }
    }
  };

  const stepCardVariants = {
    hidden: { 
      opacity: 0, 
      x: prefersReducedMotion ? 0 : -20 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }
    }
  };

  const badgeVariants = {
    hidden: { 
      opacity: 0, 
      scale: prefersReducedMotion ? 1 : 0.8 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.3, 
        ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number]
      }
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Introduction */}
          <section className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Compass className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome to SkillBridge
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your guided career intelligence system. We help you understand where you are, 
              where you want to go, and exactly how to get there.
            </p>
          </section>

          {/* How SkillBridge Works - Animated Section */}
          <motion.section 
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <motion.div 
              className="flex items-center gap-3"
              variants={sectionVariants}
            >
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">How SkillBridge Works</h2>
            </motion.div>
            <motion.div 
              className="grid gap-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  variants={stepCardVariants}
                >
                  <Card 
                    className="border-border/50 bg-card/50 backdrop-blur-sm group transition-all duration-200 hover:bg-card/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 cursor-pointer"
                    onClick={() => navigate(step.link)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        navigate(step.link);
                      }
                    }}
                    aria-label={`Learn more about: ${step.title}`}
                  >
                    <CardContent className="flex items-center gap-4 p-5">
                      <motion.div 
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg shrink-0 group-hover:shadow-md group-hover:shadow-primary/30 transition-shadow duration-200"
                        variants={badgeVariants}
                      >
                        {index + 1}
                      </motion.div>
                      <div className="flex items-center gap-3 flex-1">
                        <motion.div
                          whileHover={prefersReducedMotion ? {} : { rotate: 5, y: -3 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                          <step.icon className="w-5 h-5 text-primary shrink-0" />
                        </motion.div>
                        <div>
                          <h3 className="font-medium">{step.title}</h3>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/50 hidden sm:block transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary/70" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
          {/* How Readiness Score Works */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">How Readiness Score Works</h2>
            </div>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-6">
                <p className="text-muted-foreground">
                  Your readiness score tells you how prepared you are for your target role. It's based on three things:
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <p className="font-medium">Skill Match</p>
                    <p className="text-sm text-muted-foreground">Skills you have vs. skills needed</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <p className="font-medium">Skill Importance</p>
                    <p className="text-sm text-muted-foreground">How critical each skill is</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <p className="font-medium">Completion Status</p>
                    <p className="text-sm text-muted-foreground">Your learning progress</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm">
                    <span className="font-medium">Example:</span>{" "}
                    <span className="text-muted-foreground">
                      You have 4 of 8 required skills → 50% readiness
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* How Skill Gap is Calculated */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">How Skill Gap is Calculated</h2>
            </div>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-6">
                <p className="text-muted-foreground">
                  We compare what you know against what your target role requires:
                </p>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Skills You Have
                    </h4>
                    <div className="space-y-2">
                      {["React", "JavaScript", "HTML/CSS"].map((skill) => (
                        <div key={skill} className="flex items-center gap-2 p-2 rounded bg-green-500/10 text-sm">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Skills to Learn
                    </h4>
                    <div className="space-y-2">
                      {["TypeScript", "Node.js", "Testing"].map((skill) => (
                        <div key={skill} className="flex items-center gap-2 p-2 rounded bg-amber-500/10 text-sm">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* How Roadmaps Are Generated */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Map className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">How Roadmaps Are Generated</h2>
            </div>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-6">
                <p className="text-muted-foreground">
                  Your roadmap is built specifically for you, considering:
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border border-border/50 space-y-2">
                    <Layers className="w-5 h-5 text-primary" />
                    <h4 className="font-medium">Skill Dependencies</h4>
                    <p className="text-sm text-muted-foreground">Learn foundational skills before advanced ones</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border/50 space-y-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h4 className="font-medium">Difficulty Progression</h4>
                    <p className="text-sm text-muted-foreground">Start easy and build complexity gradually</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border/50 space-y-2">
                    <Target className="w-5 h-5 text-primary" />
                    <h4 className="font-medium">Personalized Order</h4>
                    <p className="text-sm text-muted-foreground">Based on your current skills and goal</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  💡 Roadmaps adapt automatically when you update your skills or change your career goal.
                </div>
              </CardContent>
            </Card>
          </section>

          {/* FAQs */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
            </div>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`} className="border-border/50">
                      <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/50">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>

          {/* Contact & Support Section */}
          <section className="space-y-6" data-contact-form>
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Contact & Support</h2>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Get in Touch
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Mail className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Email Support</p>
                        <p className="text-sm text-muted-foreground">support@skillbridge.app</p>
                        <p className="text-xs text-muted-foreground mt-1">We respond within 24-48 hours</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Clock className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Response Time</p>
                        <p className="text-sm text-muted-foreground">Monday - Friday: 9 AM - 6 PM EST</p>
                        <p className="text-xs text-muted-foreground mt-1">Weekend inquiries answered on Monday</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <HelpCircle className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Common Issues</p>
                        <p className="text-sm text-muted-foreground">Check our FAQ section above first</p>
                        <p className="text-xs text-muted-foreground mt-1">Most questions are answered there</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Form */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  {isSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Message Sent Successfully!</h3>
                        <p className="text-sm text-muted-foreground">
                          Thank you for contacting us. Our support team will get back to you within 24-48 hours.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setIsSubmitted(false)}
                        className="gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name">Name</Label>
                        <Input
                          id="contact-name"
                          value={contactForm.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Your full name"
                          className="bg-background"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">Email</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="your.email@example.com"
                          className="bg-background"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contact-type">Type of Inquiry</Label>
                        <Select value={contactForm.type} onValueChange={(value) => handleInputChange('type', value)}>
                          <SelectTrigger id="contact-type" className="bg-background">
                            <SelectValue placeholder="Select inquiry type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Question</SelectItem>
                            <SelectItem value="technical">Technical Support</SelectItem>
                            <SelectItem value="bug">Bug Report</SelectItem>
                            <SelectItem value="feature">Feature Request</SelectItem>
                            <SelectItem value="account">Account Issue</SelectItem>
                            <SelectItem value="feedback">Feedback</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contact-message">Message</Label>
                        <Textarea
                          id="contact-message"
                          value={contactForm.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          placeholder="Please describe your question or issue in detail..."
                          rows={5}
                          className="bg-background resize-none"
                          required
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            Sending Message...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                      
                      <p className="text-xs text-muted-foreground text-center">
                        We typically respond within 24-48 hours during business days.
                      </p>
                      
                      {/* Debug: Test API Connection */}
                      {env.debugMode && (
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={testApiConnection}
                          className="w-full gap-2 mt-2"
                        >
                          🔧 Test API Connection
                        </Button>
                      )}
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Need More Help */}
          <section className="text-center py-8">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-8 space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Still Need Help?</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Don't worry! SkillBridge guides you step by step. If you're still stuck, 
                  use the contact form above to reach our support team.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/guide/add-skills')}
                    className="gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Start Guided Tour
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const contactSection = document.querySelector('[data-contact-form]');
                      contactSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Help;
