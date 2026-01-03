import { WalkthroughLayout } from "@/components/WalkthroughLayout";
import { Target, Search, Star, CheckCircle2 } from "lucide-react";
import careerGoalExplore from "@/assets/guide/career-goal-explore.png";
import careerGoalSet from "@/assets/guide/career-goal-set.png";

const CareerGoal = () => {
  const steps = [
    {
      image: careerGoalExplore,
      title: "Explore Available Roles",
      description:
        "Browse through various career paths in the Career Hub. Each role shows required skills, typical responsibilities, and growth potential.",
    },
    {
      icon: Star,
      title: "Find Your Ideal Match",
      description:
        "Look for roles that align with your interests and existing skills. SkillBridge shows you match percentages to help you discover opportunities.",
    },
    {
      image: careerGoalSet,
      title: "Set Your Primary Goal",
      description:
        "Choose the career role you want to work toward. This becomes your target, and all recommendations will be optimized for this path.",
    },
    {
      icon: CheckCircle2,
      title: "Goals Can Change",
      description:
        "Not sure yet? That's okay. You can always update your career goal later. Your roadmap will automatically adapt to any changes.",
    },
  ];

  return (
    <WalkthroughLayout
      stepNumber={2}
      totalSteps={5}
      title="Choose a Career Goal"
      subtitle="Pick a role you're aiming for. This helps SkillBridge personalize your entire learning journey."
      icon={Target}
      steps={steps}
      ctaText="Explore Career Hub"
      ctaLink="/career-hub"
      prevLink="/guide/add-skills"
      nextLink="/guide/skill-gap"
    />
  );
};

export default CareerGoal;
