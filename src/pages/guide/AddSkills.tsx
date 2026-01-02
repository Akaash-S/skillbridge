import { WalkthroughLayout } from "@/components/WalkthroughLayout";
import { Layers, CheckSquare, Sliders, Save } from "lucide-react";

const AddSkills = () => {
  const steps = [
    {
      icon: Layers,
      title: "Browse the Skill Library",
      description:
        "Start by exploring our comprehensive skill library. Search for skills you already have or browse by category to find relevant ones for your field.",
    },
    {
      icon: CheckSquare,
      title: "Select Your Known Skills",
      description:
        "Click on each skill you possess. Don't worry about being perfect — you can always add or remove skills later as you learn more.",
    },
    {
      icon: Sliders,
      title: "Set Your Proficiency Level",
      description:
        "For each skill, choose your comfort level: Beginner, Intermediate, or Advanced. Be honest — this helps us create accurate recommendations.",
    },
    {
      icon: Save,
      title: "Save Your Skills",
      description:
        "Once you've added your skills, they become the foundation for everything else in SkillBridge — from gap analysis to personalized roadmaps.",
    },
  ];

  return (
    <WalkthroughLayout
      stepNumber={1}
      totalSteps={5}
      title="Add Your Skills"
      subtitle="This step helps SkillBridge understand where you're starting from. No experience is too small — every skill counts."
      icon={Layers}
      steps={steps}
      ctaText="Go to Skills Page"
      ctaLink="/skills"
      nextLink="/guide/career-goal"
    />
  );
};

export default AddSkills;
