import { WalkthroughLayout } from "@/components/WalkthroughLayout";
import { BarChart3, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";

const SkillGap = () => {
  const steps = [
    {
      icon: CheckCircle2,
      title: "See What You Already Have",
      description:
        "Skills you possess that match your target role are highlighted in green. These are your strengths — the foundation you're building on.",
    },
    {
      icon: AlertCircle,
      title: "Identify Missing Skills",
      description:
        "Skills required by your target role that you don't have yet are shown clearly. These are your learning priorities.",
    },
    {
      icon: BarChart3,
      title: "Understand Skill Importance",
      description:
        "Not all skills are equal. We show you which missing skills are most critical for your target role, so you can prioritize effectively.",
    },
    {
      icon: ArrowUpRight,
      title: "Track Your Progress",
      description:
        "As you learn new skills, your gap shrinks and your readiness score improves. Watch your profile transform over time.",
    },
  ];

  return (
    <WalkthroughLayout
      stepNumber={3}
      totalSteps={5}
      title="Analyze Skill Gaps"
      subtitle="See exactly what's missing between where you are now and where you want to be."
      icon={BarChart3}
      steps={steps}
      ctaText="View Gap Analysis"
      ctaLink="/analysis"
      prevLink="/guide/career-goal"
      nextLink="/guide/roadmap"
    />
  );
};

export default SkillGap;
