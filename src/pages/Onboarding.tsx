import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { educationLevels, experienceLevels, careerInterests } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, User, GraduationCap, Briefcase, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Education", icon: GraduationCap },
  { id: 3, title: "Experience", icon: Briefcase },
  { id: 4, title: "Interests", icon: Heart },
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
  
  const { setUserProfile } = useApp();
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

  const handleNext = () => {
    if (!validateStep()) return;
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      setUserProfile({
        ...formData,
        email: "user@example.com",
        avatar: "",
        notifications: true,
        weeklyGoal: 10,
      });
      navigate("/skills");
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <span className="font-semibold text-lg">SkillBridge</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                      isActive && "bg-primary text-primary-foreground",
                      isCompleted && "bg-accent text-accent-foreground",
                      !isActive && !isCompleted && "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs mt-2 text-muted-foreground hidden sm:block">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2",
                      isCompleted ? "bg-accent" : "bg-muted"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl">
              {currentStep === 1 && "What's your name?"}
              {currentStep === 2 && "What's your education level?"}
              {currentStep === 3 && "How much experience do you have?"}
              {currentStep === 4 && "What are you interested in?"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Let's personalize your experience."}
              {currentStep === 2 && "This helps us tailor recommendations."}
              {currentStep === 3 && "Understanding your background helps us better."}
              {currentStep === 4 && "Select all areas that interest you."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Name */}
            {currentStep === 1 && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setErrors({ ...errors, name: "" });
                  }}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>
            )}

            {/* Step 2: Education */}
            {currentStep === 2 && (
              <div className="space-y-2">
                <Label>Education Level</Label>
                <Select
                  value={formData.education}
                  onValueChange={(value) => {
                    setFormData({ ...formData, education: value });
                    setErrors({ ...errors, education: "" });
                  }}
                >
                  <SelectTrigger className={errors.education ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select your education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level} value={level}>
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
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select
                  value={formData.experience}
                  onValueChange={(value) => {
                    setFormData({ ...formData, experience: value });
                    setErrors({ ...errors, experience: "" });
                  }}
                >
                  <SelectTrigger className={errors.experience ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
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
                <div className="flex flex-wrap gap-2">
                  {careerInterests.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={cn(
                        "px-4 py-2 rounded-full border text-sm font-medium transition-all",
                        formData.interests.includes(interest)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:border-primary hover:text-primary"
                      )}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
                {errors.interests && (
                  <p className="text-sm text-destructive">{errors.interests}</p>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              <Button onClick={handleNext} className="group">
                {currentStep === 4 ? "Complete Setup" : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
