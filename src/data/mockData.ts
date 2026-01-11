export type ProficiencyLevel = "beginner" | "intermediate" | "advanced";

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface UserSkill extends Skill {
  proficiency: ProficiencyLevel;
}

export interface JobRole {
  id: string;
  title: string;
  description: string;
  requiredSkills: { skillId: string; minProficiency: ProficiencyLevel }[];
  category: string;
  avgSalary: string;
  demand: "high" | "medium" | "low";
}

export interface LearningResource {
  id: string;
  title: string;
  url: string;
  type: "course" | "tutorial" | "documentation" | "video";
  duration: string;
  provider: string;
  difficulty?: ProficiencyLevel;
  rating?: number; // 0-5 stars
  completionRate?: number; // 0-100%
  effectiveness?: number; // 0-100% based on user outcomes
}

export interface RoadmapItem {
  id: string;
  skillId: string;
  skillName: string;
  resources: LearningResource[];
  difficulty: ProficiencyLevel;
  estimatedTime: string;
  completed: boolean;
  prerequisites?: string[]; // Skill IDs that should be completed first
  learningOutcomes?: string[]; // What you'll learn
  practicalProjects?: string[]; // Suggested projects
  assessmentCriteria?: string[]; // How to validate mastery
}

// Enhanced analytics interfaces
export interface LearningSession {
  id: string;
  userId: string;
  skillId: string;
  resourceId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // minutes
  completed: boolean;
  notes?: string;
  effectiveness?: number; // 1-5 rating
}

export interface SkillProgression {
  skillId: string;
  initialLevel: ProficiencyLevel;
  currentLevel: ProficiencyLevel;
  confidence: number; // 0-100
  progressionHistory: Array<{
    timestamp: Date;
    level: ProficiencyLevel;
    confidence: number;
    source: 'roadmap_completion' | 'self_assessment' | 'project_completion';
    notes?: string;
  }>;
  practicalProjects: number;
  assessmentScore?: number;
  timeToMastery?: number; // hours
}

export interface LearningInsight {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  action?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface LearningAnalytics {
  progressPercent: number;
  learningVelocity: number; // skills per week
  weeksElapsed: number;
  estimatedWeeksRemaining: number;
  estimatedCompletionDate: Date;
  completionLikelihood: number; // 0-100%
  isOnTrack: boolean;
  recommendedPace: number; // skills per week
  insights: LearningInsight[];
  totalTimeSpent: number; // hours
  averageSessionDuration: number; // minutes
  currentStreak: number; // days
  longestStreak: number; // days
}

export interface ResourceEffectiveness {
  resourceId: string;
  completionRate: number; // 0-100%
  averageRating: number; // 0-5
  timeToComplete: number; // hours
  skillImprovementRate: number; // 0-100%
  userFeedback: Array<{
    rating: number;
    comment?: string;
    timestamp: Date;
  }>;
}

export const skillsDatabase: Skill[] = [
  // Programming Languages
  { id: "js", name: "JavaScript", category: "Programming Languages" },
  { id: "ts", name: "TypeScript", category: "Programming Languages" },
  { id: "python", name: "Python", category: "Programming Languages" },
  { id: "java", name: "Java", category: "Programming Languages" },
  { id: "go", name: "Go", category: "Programming Languages" },
  { id: "rust", name: "Rust", category: "Programming Languages" },
  { id: "csharp", name: "C#", category: "Programming Languages" },
  { id: "cpp", name: "C++", category: "Programming Languages" },
  
  // Frontend
  { id: "react", name: "React", category: "Frontend" },
  { id: "vue", name: "Vue.js", category: "Frontend" },
  { id: "angular", name: "Angular", category: "Frontend" },
  { id: "nextjs", name: "Next.js", category: "Frontend" },
  { id: "tailwind", name: "Tailwind CSS", category: "Frontend" },
  { id: "html", name: "HTML5", category: "Frontend" },
  { id: "css", name: "CSS3", category: "Frontend" },
  
  // Backend
  { id: "nodejs", name: "Node.js", category: "Backend" },
  { id: "express", name: "Express.js", category: "Backend" },
  { id: "django", name: "Django", category: "Backend" },
  { id: "flask", name: "Flask", category: "Backend" },
  { id: "springboot", name: "Spring Boot", category: "Backend" },
  { id: "graphql", name: "GraphQL", category: "Backend" },
  { id: "rest", name: "REST APIs", category: "Backend" },
  
  // Database
  { id: "postgresql", name: "PostgreSQL", category: "Database" },
  { id: "mongodb", name: "MongoDB", category: "Database" },
  { id: "mysql", name: "MySQL", category: "Database" },
  { id: "redis", name: "Redis", category: "Database" },
  { id: "sql", name: "SQL", category: "Database" },
  
  // DevOps & Cloud
  { id: "docker", name: "Docker", category: "DevOps & Cloud" },
  { id: "kubernetes", name: "Kubernetes", category: "DevOps & Cloud" },
  { id: "aws", name: "AWS", category: "DevOps & Cloud" },
  { id: "gcp", name: "Google Cloud", category: "DevOps & Cloud" },
  { id: "azure", name: "Azure", category: "DevOps & Cloud" },
  { id: "cicd", name: "CI/CD", category: "DevOps & Cloud" },
  { id: "terraform", name: "Terraform", category: "DevOps & Cloud" },
  
  // Data Science & ML
  { id: "ml", name: "Machine Learning", category: "Data Science" },
  { id: "tensorflow", name: "TensorFlow", category: "Data Science" },
  { id: "pytorch", name: "PyTorch", category: "Data Science" },
  { id: "pandas", name: "Pandas", category: "Data Science" },
  { id: "numpy", name: "NumPy", category: "Data Science" },
  { id: "dataviz", name: "Data Visualization", category: "Data Science" },
  
  // Soft Skills
  { id: "communication", name: "Communication", category: "Soft Skills" },
  { id: "leadership", name: "Leadership", category: "Soft Skills" },
  { id: "problemsolving", name: "Problem Solving", category: "Soft Skills" },
  { id: "teamwork", name: "Teamwork", category: "Soft Skills" },
  { id: "agile", name: "Agile/Scrum", category: "Soft Skills" },
];

export const jobRolesDatabase: JobRole[] = [
  {
    id: "frontend-dev",
    title: "Frontend Developer",
    description: "Build beautiful, responsive user interfaces using modern web technologies. Focus on creating seamless user experiences with React, Vue, or Angular.",
    category: "Engineering",
    avgSalary: "$85,000 - $140,000",
    demand: "high",
    requiredSkills: [
      { skillId: "js", minProficiency: "advanced" },
      { skillId: "react", minProficiency: "intermediate" },
      { skillId: "html", minProficiency: "advanced" },
      { skillId: "css", minProficiency: "advanced" },
      { skillId: "ts", minProficiency: "intermediate" },
      { skillId: "tailwind", minProficiency: "beginner" },
    ],
  },
  {
    id: "backend-dev",
    title: "Backend Developer",
    description: "Design and implement server-side logic, databases, and APIs. Build scalable systems that power applications.",
    category: "Engineering",
    avgSalary: "$90,000 - $150,000",
    demand: "high",
    requiredSkills: [
      { skillId: "nodejs", minProficiency: "advanced" },
      { skillId: "python", minProficiency: "intermediate" },
      { skillId: "postgresql", minProficiency: "intermediate" },
      { skillId: "rest", minProficiency: "advanced" },
      { skillId: "docker", minProficiency: "beginner" },
    ],
  },
  {
    id: "fullstack-dev",
    title: "Full Stack Developer",
    description: "Work across the entire stack, from frontend interfaces to backend services. Versatile role requiring broad technical knowledge.",
    category: "Engineering",
    avgSalary: "$95,000 - $160,000",
    demand: "high",
    requiredSkills: [
      { skillId: "js", minProficiency: "advanced" },
      { skillId: "react", minProficiency: "intermediate" },
      { skillId: "nodejs", minProficiency: "intermediate" },
      { skillId: "postgresql", minProficiency: "intermediate" },
      { skillId: "ts", minProficiency: "intermediate" },
      { skillId: "rest", minProficiency: "advanced" },
    ],
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    description: "Bridge development and operations. Automate deployments, manage infrastructure, and ensure system reliability.",
    category: "Operations",
    avgSalary: "$100,000 - $170,000",
    demand: "high",
    requiredSkills: [
      { skillId: "docker", minProficiency: "advanced" },
      { skillId: "kubernetes", minProficiency: "intermediate" },
      { skillId: "aws", minProficiency: "intermediate" },
      { skillId: "cicd", minProficiency: "advanced" },
      { skillId: "terraform", minProficiency: "intermediate" },
      { skillId: "python", minProficiency: "beginner" },
    ],
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    description: "Extract insights from data using statistical analysis and machine learning. Drive data-informed decision making.",
    category: "Data",
    avgSalary: "$105,000 - $180,000",
    demand: "high",
    requiredSkills: [
      { skillId: "python", minProficiency: "advanced" },
      { skillId: "ml", minProficiency: "intermediate" },
      { skillId: "pandas", minProficiency: "advanced" },
      { skillId: "sql", minProficiency: "intermediate" },
      { skillId: "dataviz", minProficiency: "intermediate" },
      { skillId: "numpy", minProficiency: "intermediate" },
    ],
  },
  {
    id: "ml-engineer",
    title: "Machine Learning Engineer",
    description: "Build and deploy machine learning models at scale. Bridge the gap between data science and production systems.",
    category: "Data",
    avgSalary: "$120,000 - $200,000",
    demand: "high",
    requiredSkills: [
      { skillId: "python", minProficiency: "advanced" },
      { skillId: "ml", minProficiency: "advanced" },
      { skillId: "tensorflow", minProficiency: "intermediate" },
      { skillId: "docker", minProficiency: "intermediate" },
      { skillId: "aws", minProficiency: "beginner" },
    ],
  },
  {
    id: "cloud-architect",
    title: "Cloud Architect",
    description: "Design and oversee cloud infrastructure. Create scalable, secure, and cost-effective cloud solutions.",
    category: "Architecture",
    avgSalary: "$140,000 - $220,000",
    demand: "medium",
    requiredSkills: [
      { skillId: "aws", minProficiency: "advanced" },
      { skillId: "kubernetes", minProficiency: "advanced" },
      { skillId: "terraform", minProficiency: "advanced" },
      { skillId: "docker", minProficiency: "advanced" },
      { skillId: "cicd", minProficiency: "intermediate" },
    ],
  },
  {
    id: "tech-lead",
    title: "Technical Lead",
    description: "Lead engineering teams, make architectural decisions, and mentor developers while staying hands-on with code.",
    category: "Leadership",
    avgSalary: "$150,000 - $230,000",
    demand: "medium",
    requiredSkills: [
      { skillId: "leadership", minProficiency: "advanced" },
      { skillId: "communication", minProficiency: "advanced" },
      { skillId: "agile", minProficiency: "intermediate" },
      { skillId: "problemsolving", minProficiency: "advanced" },
      { skillId: "js", minProficiency: "advanced" },
    ],
  },
];

export const learningResourcesDatabase: Record<string, LearningResource[]> = {
  js: [
    { id: "js-1", title: "JavaScript: The Definitive Guide", url: "https://javascript.info/", type: "documentation", duration: "40 hours", provider: "JavaScript.info" },
    { id: "js-2", title: "JavaScript Fundamentals", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", type: "course", duration: "300 hours", provider: "freeCodeCamp" },
  ],
  ts: [
    { id: "ts-1", title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/", type: "documentation", duration: "10 hours", provider: "Microsoft" },
    { id: "ts-2", title: "TypeScript Deep Dive", url: "https://basarat.gitbook.io/typescript/", type: "tutorial", duration: "20 hours", provider: "Basarat" },
  ],
  react: [
    { id: "react-1", title: "React Documentation", url: "https://react.dev/learn", type: "documentation", duration: "15 hours", provider: "React" },
    { id: "react-2", title: "Full Stack Open - React", url: "https://fullstackopen.com/en/", type: "course", duration: "50 hours", provider: "University of Helsinki" },
  ],
  python: [
    { id: "python-1", title: "Python Official Tutorial", url: "https://docs.python.org/3/tutorial/", type: "documentation", duration: "20 hours", provider: "Python.org" },
    { id: "python-2", title: "Automate the Boring Stuff", url: "https://automatetheboringstuff.com/", type: "course", duration: "30 hours", provider: "Al Sweigart" },
  ],
  nodejs: [
    { id: "nodejs-1", title: "Node.js Documentation", url: "https://nodejs.org/en/docs/", type: "documentation", duration: "15 hours", provider: "Node.js" },
    { id: "nodejs-2", title: "The Node.js Handbook", url: "https://www.freecodecamp.org/news/the-definitive-node-js-handbook/", type: "tutorial", duration: "10 hours", provider: "freeCodeCamp" },
  ],
  docker: [
    { id: "docker-1", title: "Docker Getting Started", url: "https://docs.docker.com/get-started/", type: "documentation", duration: "5 hours", provider: "Docker" },
    { id: "docker-2", title: "Docker for Beginners", url: "https://docker-curriculum.com/", type: "tutorial", duration: "8 hours", provider: "Docker Curriculum" },
  ],
  kubernetes: [
    { id: "k8s-1", title: "Kubernetes Documentation", url: "https://kubernetes.io/docs/tutorials/", type: "documentation", duration: "20 hours", provider: "Kubernetes" },
    { id: "k8s-2", title: "Learn Kubernetes Basics", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/", type: "tutorial", duration: "10 hours", provider: "Kubernetes" },
  ],
  aws: [
    { id: "aws-1", title: "AWS Documentation", url: "https://docs.aws.amazon.com/", type: "documentation", duration: "50 hours", provider: "Amazon" },
    { id: "aws-2", title: "AWS Skill Builder", url: "https://skillbuilder.aws/", type: "course", duration: "100 hours", provider: "Amazon" },
  ],
  ml: [
    { id: "ml-1", title: "Machine Learning Crash Course", url: "https://developers.google.com/machine-learning/crash-course", type: "course", duration: "15 hours", provider: "Google" },
    { id: "ml-2", title: "Fast.ai Practical Deep Learning", url: "https://course.fast.ai/", type: "course", duration: "40 hours", provider: "fast.ai" },
  ],
  postgresql: [
    { id: "pg-1", title: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com/", type: "tutorial", duration: "15 hours", provider: "PostgreSQL Tutorial" },
    { id: "pg-2", title: "PostgreSQL Documentation", url: "https://www.postgresql.org/docs/", type: "documentation", duration: "30 hours", provider: "PostgreSQL" },
  ],
  rest: [
    { id: "rest-1", title: "REST API Tutorial", url: "https://restfulapi.net/", type: "tutorial", duration: "5 hours", provider: "RESTful API" },
    { id: "rest-2", title: "API Design Best Practices", url: "https://swagger.io/resources/articles/best-practices-in-api-design/", type: "documentation", duration: "3 hours", provider: "Swagger" },
  ],
  html: [
    { id: "html-1", title: "MDN HTML Guide", url: "https://developer.mozilla.org/en-US/docs/Learn/HTML", type: "documentation", duration: "10 hours", provider: "MDN" },
  ],
  css: [
    { id: "css-1", title: "MDN CSS Guide", url: "https://developer.mozilla.org/en-US/docs/Learn/CSS", type: "documentation", duration: "15 hours", provider: "MDN" },
  ],
  tailwind: [
    { id: "tw-1", title: "Tailwind CSS Documentation", url: "https://tailwindcss.com/docs", type: "documentation", duration: "10 hours", provider: "Tailwind" },
  ],
};

export const educationLevels = [
  "High School",
  "Some College",
  "Associate's Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Self-Taught",
  "Bootcamp Graduate",
];

export const experienceLevels = [
  "Student",
  "Entry Level (0-2 years)",
  "Mid Level (3-5 years)",
  "Senior (6-10 years)",
  "Staff/Principal (10+ years)",
];

export const careerInterests = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "Cloud Computing",
  "DevOps",
  "Cybersecurity",
  "Game Development",
  "Blockchain",
  "AR/VR",
];
