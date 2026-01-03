import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Send, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { LucideIcon } from "lucide-react";

interface WalkthroughStep {
  image?: string;
  icon?: LucideIcon;
  title: string;
  description: string;
}

interface WalkthroughLayoutProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  steps: WalkthroughStep[];
  ctaText: string;
  ctaLink: string;
  prevLink?: string;
  nextLink?: string;
}

const guideRoutes = [
  "/guide/add-skills",
  "/guide/career-goal",
  "/guide/skill-gap",
  "/guide/roadmap",
  "/guide/growth-tracking",
];

export const WalkthroughLayout = ({
  stepNumber,
  totalSteps,
  title,
  subtitle,
  icon: Icon,
  steps,
  ctaText,
  ctaLink,
  prevLink,
  nextLink,
}: WalkthroughLayoutProps) => {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Please enter your question",
        description: "The query field cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate sending (would connect to backend in production)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setQuery("");
    
    toast({
      title: "Query Sent!",
      description: "Thanks! We've received your question and will respond soon.",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Back to Help */}
          <Link
            to="/help"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Help & Guide
          </Link>

          {/* Page Header */}
          <motion.header
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">
                {stepNumber}
              </div>
              <div className="flex items-center gap-2">
                <Icon className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-xl">{subtitle}</p>
          </motion.header>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Step {stepNumber} of {totalSteps}
            </span>
            <div className="flex gap-1.5">
              {guideRoutes.map((route, index) => (
                <Link
                  key={route}
                  to={route}
                  className={`w-8 h-1.5 rounded-full transition-colors ${
                    index + 1 === stepNumber
                      ? "bg-primary"
                      : index + 1 < stepNumber
                      ? "bg-primary/50"
                      : "bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Visual Storytelling Section */}
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {steps.map((step, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {/* Image/Icon Section */}
                      <div className="sm:w-2/5 bg-muted/30 flex items-center justify-center p-4 sm:p-6 min-h-[180px]">
                        {step.image ? (
                          <img
                            src={step.image}
                            alt={step.title}
                            className="w-full h-auto max-h-40 object-contain rounded-lg"
                          />
                        ) : step.icon ? (
                          <step.icon className="w-16 h-16 text-primary/60" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">
                              {index + 1}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Text Section */}
                      <div className="sm:w-3/5 p-6 flex flex-col justify-center">
                        <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Try It Now CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6 text-center space-y-4">
                <h3 className="text-xl font-semibold">Ready to try this step?</h3>
                <p className="text-muted-foreground">
                  Put what you've learned into action.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate(ctaLink)}
                  className="gap-2"
                >
                  {ctaText}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step Navigation */}
          <div className="flex items-center justify-between pt-4">
            {prevLink ? (
              <Button variant="outline" onClick={() => navigate(prevLink)} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Previous Step
              </Button>
            ) : (
              <div />
            )}
            {nextLink ? (
              <Button variant="outline" onClick={() => navigate(nextLink)} className="gap-2">
                Next Step
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate("/help")} className="gap-2">
                Back to Guide
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Query Box */}
          <motion.section
            className="pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Have a Question?</h3>
                </div>
                
                {isSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                    <p className="font-medium">Thanks! We've received your question.</p>
                    <p className="text-sm text-muted-foreground">
                      Our team will get back to you soon.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSubmitted(false)}
                    >
                      Ask another question
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitQuery} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Your Email (optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="query">Your Question</Label>
                      <Textarea
                        id="query"
                        placeholder="Have a question about this step? Ask us here..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        rows={4}
                        className="bg-background resize-none"
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="gap-2">
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Query
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </div>
    </Layout>
  );
};

export default WalkthroughLayout;
