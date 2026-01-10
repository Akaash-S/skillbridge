import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "@/context/AppDataContext";
import { educationLevels, experienceLevels, careerInterests } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, User, GraduationCap, Briefcase, Heart, Sparkles, CheckCircle2, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { id: 1, title: "Personal Info", icon: User, description: "Let's get to know you" },
  { id: 2, title: "Education", icon: GraduationCap, description: "Your academic background" },
  { id: 3, title: "Experience", icon: Briefcase, description: "Your professional journey" },
  { id: 4, title: "Interests", icon: Heart, description: "What excites you" },
];

export const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    education: "",
    experience: "",
    interests: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { completeOnboarding } = useAppData();
  const navigate = useNavigate();

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1 && !formData.name.trim()) {
      newErrors.name = "Please enter your name";
    }
    if (currentStep === 2 && !formData.education) {
      newErrors.education = "Please select your education level";
    }
    if (currentStep === 3 && !formData.experience) {
      newErrors.experience = "Please select your experience level";
    }
    if (currentStep === 4 && formData.interests.length === 0) {
      newErrors.interests = "Please select at least one interest";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        setIsSubmitting(true);
        setErrors({});
        
        // Complete onboarding and save to backend
        await completeOnboarding({
          name: formData.name,
          education: formData.education,
          experience: formData.experience,
          interests: formData.interests,
        });
        
        // Navigate to skills page
        navigate("/skills");
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
        setErrors({ general: 'Failed to save profile. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
    setErrors((prev) => ({ ...prev, interests: "" }));
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">SkillBridge</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-muted">
        <motion.div 
          className="h-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl flex flex-col">
        {/* Steps Indicator */}
        <div className="hidden md:flex items-center justify-center mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <motion.div 
                  className="flex flex-col items-center relative"
                  initial={false}
                  animate={{ scale: isActive ? 1 : 0.95, opacity: isActive || isCompleted ? 1 : 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg",
                      isActive && "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-primary/30",
                      isCompleted && "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground shadow-accent/30",
                      !isActive && !isCompleted && "bg-muted text-muted-foreground shadow-none"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm mt-3 font-medium transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                </motion.div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-16 lg:w-24 h-0.5 mx-4 transition-colors duration-300",
                      isCompleted ? "bg-accent" : "bg-muted"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Step Indicator */}
        <div className="md:hidden flex items-center gap-2 mb-8">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "flex-1 h-2 rounded-full transition-colors duration-300",
                step.id <= currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Form Card */}
        <div className="flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-xl"
            >
              <Card className="border-border/50 shadow-2xl shadow-primary/5">
                <CardHeader className="text-center pb-2">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className={cn(
                      "h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg",
                      "bg-gradient-to-br from-primary to-primary/80 shadow-primary/25"
                    )}
                  >
                    {steps[currentStep - 1] && (() => {
                      const StepIcon = steps[currentStep - 1].icon;
                      return <StepIcon className="h-8 w-8 text-primary-foreground" />;
                    })()}
                  </motion.div>
                  <CardTitle className="text-2xl md:text-3xl font-bold">
                    {currentStep === 1 && "What's your name?"}
                    {currentStep === 2 && "What's your education level?"}
                    {currentStep === 3 && "How much experience do you have?"}
                    {currentStep === 4 && "What are you interested in?"}
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    {currentStep === 1 && "Let's personalize your experience."}
                    {currentStep === 2 && "This helps us tailor recommendations."}
                    {currentStep === 3 && "Understanding your background helps us better."}
                    {currentStep === 4 && "Select all areas that excite you."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  {/* Step 1: Name */}
                  {currentStep === 1 && (
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-base">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          setErrors({ ...errors, name: "" });
                        }}
                        className={cn(
                          "h-14 text-base",
                          errors.name ? "border-destructive" : ""
                        )}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name}</p>
                      )}
                    </div>
                  )}

                  {/* Step 2: Education */}
                  {currentStep === 2 && (
                    <div className="space-y-3">
                      <Label className="text-base">Education Level</Label>
                      <Select
                        value={formData.education}
                        onValueChange={(value) => {
                          setFormData({ ...formData, education: value });
                          setErrors({ ...errors, education: "" });
                        }}
                      >
                        <SelectTrigger className={cn(
                          "h-14 text-base",
                          errors.education ? "border-destructive" : ""
                        )}>
                          <SelectValue placeholder="Select your education level" />
                        </SelectTrigger>
                        <SelectContent>
                          {educationLevels.map((level) => (
                            <SelectItem key={level} value={level} className="text-base py-3">
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.education && (
                        <p className="text-sm text-destructive">{errors.education}</p>
                      )}
                    </div>
                  )}

                  {/* Step 3: Experience */}
                  {currentStep === 3 && (
                    <div className="space-y-3">
                      <Label className="text-base">Experience Level</Label>
                      <Select
                        value={formData.experience}
                        onValueChange={(value) => {
                          setFormData({ ...formData, experience: value });
                          setErrors({ ...errors, experience: "" });
                        }}
                      >
                        <SelectTrigger className={cn(
                          "h-14 text-base",
                          errors.experience ? "border-destructive" : ""
                        )}>
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          {experienceLevels.map((level) => (
                            <SelectItem key={level} value={level} className="text-base py-3">
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.experience && (
                        <p className="text-sm text-destructive">{errors.experience}</p>
                      )}
                    </div>
                  )}

                  {/* Step 4: Interests */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-3">
                        {careerInterests.map((interest, index) => (
                          <motion.button
                            key={interest}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.03, duration: 0.2 }}
                            onClick={() => toggleInterest(interest)}
                            className={cn(
                              "px-5 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                              formData.interests.includes(interest)
                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                                : "bg-background border-border hover:border-primary/50 hover:bg-primary/5"
                            )}
                          >
                            {interest}
                          </motion.button>
                        ))}
                      </div>
                      {errors.interests && (
                        <p className="text-sm text-destructive">{errors.interests}</p>
                      )}
                    </div>
                  )}

                  {/* General Error Display */}
                  {errors.general && (
                    <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                      {errors.general}
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between gap-4 pt-6">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1}
                      className="h-12 px-6"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={handleNext} className="h-12 px-8 group shadow-lg shadow-primary/25" disabled={isSubmitting}>
                      {currentStep === 4 ? (
                        <>
                          {isSubmitting ? 'Completing...' : 'Complete Setup'}
                          <Rocket className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
