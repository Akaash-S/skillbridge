import { WalkthroughLayout } from "@/components/WalkthroughLayout";
import { Route, Layers, TrendingUp, RefreshCw } from "lucide-react";
import roadmapPath from "@/assets/guide/roadmap-path.png";

const RoadmapGuide = () => {
  const steps = [
    {
      icon: Layers,
      title: "Skills Are Ordered by Dependency",
      description:
        "Learn foundational skills first. Your roadmap is structured so each skill builds on what you've already learned.",
    },
    {
      image: roadmapPath,
      title: "Gradual Difficulty Progression",
      description:
        "Start with easier concepts and gradually move to advanced topics. This ensures steady, sustainable progress.",
    },
    {
      icon: Route,
      title: "Follow Your Personalized Path",
      description:
        "Your roadmap is unique to you — based on your current skills, your goal, and the most efficient learning sequence.",
    },
    {
      icon: RefreshCw,
      title: "Roadmaps Adapt Automatically",
      description:
        "When you add new skills or change your career goal, your roadmap updates instantly to reflect the new path forward.",
    },
  ];

  return (
    <WalkthroughLayout
      stepNumber={4}
      totalSteps={5}
      title="Follow Your Roadmap"
      subtitle="Get a personalized learning path built specifically for your career journey."
      icon={Route}
      steps={steps}
      ctaText="View Your Roadmap"
      ctaLink="/roadmap"
      prevLink="/guide/skill-gap"
      nextLink="/guide/growth-tracking"
    />
  );
};

export default RoadmapGuide;
