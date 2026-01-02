import { WalkthroughLayout } from "@/components/WalkthroughLayout";
import { TrendingUp, Activity, Award, Target } from "lucide-react";

const GrowthTracking = () => {
  const steps = [
    {
      icon: Activity,
      title: "Monitor Your Readiness Score",
      description:
        "Your readiness score shows how prepared you are for your target role. Watch it grow as you complete your learning milestones.",
    },
    {
      icon: TrendingUp,
      title: "Track Skill Progress Over Time",
      description:
        "View your learning history to see how far you've come. Every new skill you add contributes to your overall growth.",
    },
    {
      icon: Award,
      title: "Celebrate Milestones",
      description:
        "SkillBridge highlights key achievements along your journey — completing skill clusters, reaching readiness thresholds, and more.",
    },
    {
      icon: Target,
      title: "Stay on Track",
      description:
        "Use your dashboard to see what's next on your roadmap and keep making progress toward your career goal.",
    },
  ];

  return (
    <WalkthroughLayout
      stepNumber={5}
      totalSteps={5}
      title="Track Your Growth"
      subtitle="Watch your readiness improve as you learn new skills and move closer to your career goal."
      icon={TrendingUp}
      steps={steps}
      ctaText="Go to Dashboard"
      ctaLink="/dashboard"
      prevLink="/guide/roadmap"
    />
  );
};

export default GrowthTracking;
