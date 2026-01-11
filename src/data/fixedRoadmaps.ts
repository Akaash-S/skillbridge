import { RoadmapItem, ProficiencyLevel } from "./mockData";

// Fixed roadmap templates for different roles
export const fixedRoadmaps: Record<string, RoadmapItem[]> = {
  "frontend-dev": [
    {
      id: "roadmap-html",
      skillId: "html",
      skillName: "HTML5",
      resources: [
        { id: "html-1", title: "MDN HTML Guide", url: "https://developer.mozilla.org/en-US/docs/Learn/HTML", type: "documentation", duration: "10 hours", provider: "MDN" },
        { id: "html-2", title: "HTML Crash Course", url: "https://www.freecodecamp.org/learn/responsive-web-design/", type: "course", duration: "15 hours", provider: "freeCodeCamp" }
      ],
      difficulty: "beginner" as ProficiencyLevel,
      estimatedTime: "15 hours",
      completed: false
    },
    {
      id: "roadmap-css",
      skillId: "css",
      skillName: "CSS3",
      resources: [
        { id: "css-1", title: "MDN CSS Guide", url: "https://developer.mozilla.org/en-US/docs/Learn/CSS", type: "documentation", duration: "15 hours", provider: "MDN" },
        { id: "css-2", title: "CSS Grid & Flexbox", url: "https://cssgrid.io/", type: "course", duration: "10 hours", provider: "Wes Bos" }
      ],
      difficulty: "beginner" as ProficiencyLevel,
      estimatedTime: "20 hours",
      completed: false
    },
    {
      id: "roadmap-js",
      skillId: "js",
      skillName: "JavaScript",
      resources: [
        { id: "js-1", title: "JavaScript: The Definitive Guide", url: "https://javascript.info/", type: "documentation", duration: "40 hours", provider: "JavaScript.info" },
        { id: "js-2", title: "JavaScript Fundamentals", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", type: "course", duration: "50 hours", provider: "freeCodeCamp" }
      ],
      difficulty: "intermediate" as ProficiencyLevel,
      estimatedTime: "60 hours",
      completed: false
    },
    {
      id: "roadmap-ts",
      skillId: "ts",
      skillName: "TypeScript",
      resources: [
        { id: "ts-1", title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/", type: "documentation", duration: "10 hours", provider: "Microsoft" },
        { id: "ts-2", title: "TypeScript Deep Dive", url: "https://basarat.gitbook.io/typescript/", type: "tutorial", duration: "20 hours", provider: "Basarat" }
      ],
      difficulty: "intermediate" as ProficiencyLevel,
      estimatedTime: "25 hours",
      completed: false
    },
    {
      id: "roadmap-react",
      skillId: "react",
      skillName: "React",
      resources: [
        { id: "react-1", title: "React Documentation", url: "https://react.dev/learn", type: "documentation", duration: "15 hours", provider: "React" },
        { id: "react-2", title: "Full Stack Open - React", url: "https://fullstackopen.com/en/", type: "course", duration: "50 hours", provider: "University of Helsinki" }
      ],
      difficulty: "intermediate" as ProficiencyLevel,
      estimatedTime: "40 hours",
      completed: false
    },
    {
      id: "roadmap-tailwind",
      skillId: "tailwind",
      skillName: "Tailwind CSS",
      resources: [
        { id: "tw-1", title: "Tailwind CSS Documentation", url: "https://tailwindcss.com/docs", type: "documentation", duration: "10 hours", provider: "Tailwind" },
        { id: "tw-2", title: "Tailwind CSS Tutorial", url: "https://www.youtube.com/watch?v=UBOj6rqRUME", type: "video", duration: "8 hours", provider: "Traversy Media" }
      ],
      difficulty: "beginner" as ProficiencyLevel,
      estimatedTime: "12 hours",
      completed: false
    }
  ],

  "backend-dev": [
    {
      id: "roadmap-python",
      skillId: "python",
      skillName: "Python",
      resources: [
        { id: "python-1", title: "Python Official Tutorial", url: "https://docs.python.org/3/tutorial/", type: "documentation", duration: "20 hours", provider: "Python.org" },
        { id: "python-2", title: "Automate the Boring Stuff", url: "https://automatetheboringstuff.com/", type: "course", duration: "30 hours", provider: "Al Sweigart" }
      ],
      difficulty: "intermediate" as ProficiencyLevel,
      estimatedTime: "35 hours",
      completed: false
    },
    {
      id: "roadmap-nodejs",
      skillId: "nodejs",
      skillName: "Node.js",
      resources: [
        { id: "nodejs-1", title: "Node.js Documentation", url: "https://nodejs.org/en/docs/", type: "documentation", duration: "15 hours", provider: "Node.js" },
        { id: "nodejs-2", title: "The Node.js Handbook", url: "https://www.freecodecamp.org/news/the-definitive-node-js-handbook/", type: "tutorial", duration: "10 hours", provider: "freeCodeCamp" }
      ],
      difficulty: "advanced" as ProficiencyLevel,
      estimatedTime: "30 hours",
      completed: false
    },
    {
      id: "roadmap-postgresql",
      skillId: "postgresql",
      skillName: "PostgreSQL",
      resources: [
        { id: "pg-1", title: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com/", type: "tutorial", duration: "15 hours", provider: "PostgreSQL Tutorial" },
        { id: "pg-2", title: "PostgreSQL Documentation", url: "https://www.postgresql.org/docs/", type: "documentation", duration: "30 hours", provider: "PostgreSQL" }
      ],
      difficulty: "intermediate" as ProficiencyLevel,
      estimatedTime: "25 hours",
      completed: false
    },
    {
      id: "roadmap-rest",
      skillId: "rest",
      skillName: "REST APIs",
      resources: [
        { id: "rest-1", title: "REST API Tutorial", url: "https://restfulapi.net/", type: "tutorial", duration: "5 hours", provider: "RESTful API" },
        { id: "rest-2", title: "API Design Best Practices", url: "https://swagger.io/resources/articles/best-practices-in-api-design/", type: "documentation", duration: "3 hours", provider: "Swagger" }
      ],
      difficulty: "advanced" as ProficiencyLevel,
      estimatedTime: "15 hours",
      completed: false
    },
    {
      id: "roadmap-docker",
      skillId: "docker",
      skillName: "Docker",
      resources: [
        { id: "docker-1", title: "Docker Getting Started", url: "https://docs.docker.com/get-started/", type: "documentation", duration: "5 hours", provider: "Docker" },
        { id: "docker-2", title: "Docker for Beginners", url: "https://docker-curriculum.com/", type: "tutorial", duration: "8 hours", provider: "Docker Curriculum" }
      ],
      difficulty: "beginner" as ProficiencyLevel,
      estimatedTime: "10 hours",
      completed: false
    }
  ],

  "fullstack-dev": [
    {
      id: "roadmap-js",
      skillId: "js",
      skillName: "JavaScript",
      resources: [
        { id: "js-1", title: "JavaScript: The Definitive Guide", url: "https://javascript.info/", type: "documentation", duration: "40 hours", provider: "JavaScript.info" },
        { id: "js-2", title: "JavaScript Fundamentals", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", type: "course", duration: "50 hours", provider: "freeCodeCamp" }
      ],
      difficulty: "advanced" as ProficiencyLevel,
      estimatedTime: "60 hours",
      completed: false
    },
    {
      id: "roadmap-react",
      skillId: "react",
      skillName: "React",
      resources: [
        { id: "react-1", title: "React Documentation", url: "https://react.dev/learn", type: "documentation", duration: "15 hours", provider: "React" },
        { id: "react-2", title: "Full Stack Open - React", url: "https://fullstackopen.com/en/", type: "course", duration: "50 hours", provider: "University of Helsinki" }
      ],
      difficulty: "intermediate" as ProficiencyLevel,
      estimatedTime: "40 hours",
      completed: false
    },
    {
      id: "roadmap-nodejs",
      skillId: "nodejs",
      skillName: "Node.js",
      resources: [
        { id: "nodejs-1", title: "Node.js Documentation", url: "https://nodejs.org/en/docs/", type: "documentation", duration: "15 hours", provider: "Node.js" },
        { id: "nodejs-2", title: "The Node.js Handbook", url: "https://www.freecodecamp.org/news/the-definitive-node-js-handbook/", type: "tutorial", duration: "10 hours", provider: "freeCodeCamp" }
      ],
      difficulty: "intermediate" as ProficiencyLevel,
      estimatedTime: "30 hours",
      completed: false
    },
    {
      id: "roadmap-postgresql",
      skillId: "postgresql",
      skillName: "PostgreSQL",
      resources: [
        { id: "pg-1", title: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com/", type: "tutorial", duration: "15 hours", provider: "PostgreSQL Tutorial" },
        { id: "pg-2", title: "PostgreSQL Documentation", url: "https://www.postgresql.org/docs/", type: "documentation", duration: "30 hours", provider: "PostgreSQL" }
      ],
      difficulty: "intermediate" as ProficiencyLevel,
      estimatedTime: "25 hours",
      completed: false
    },
    {
      id: "roadmap-ts",
      skillId: "ts",
      skillName: "TypeScript",
      resources: [
        { id: "ts-1", title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/", type: "documentation", duration: "10 hours", provider: "Microsoft" },
        { id: "ts-2", title: "TypeScript Deep Dive", url: "https://basarat.gitbook.io/typescript/", type: "tutorial", duration: "20 hours", provider: "Basarat" }
      ],
      difficulty: "intermediate" as ProficiencyLevel,
      estimatedTime: "25 hours",
      completed: false
    },
    {
      id: "roadmap-rest",
      skillId: "rest",
      skillName: "REST APIs",
      resources: [
        { id: "rest-1", title: "REST API Tutorial", url: "https://restfulapi.net/", type: "tutorial", duration: "5 hours", provider: "RESTful API" },
        { id: "rest-2", title: "API Design Best Practices", url: "https://swagger.io/resources/articles/best-practices-in-api-design/", type: "documentation", duration: "3 hours", provider: "Swagger" }
      ],
      difficulty: "advanced" as ProficiencyLevel,
      estimatedTime: "15 hours",
      completed: false
    }
  ],

  "devops-engineer": [
    {
      id: "roadmap-docker",
      skillId: "docker",
      skillName: "Docker",
      resources: [
        { id: "docker-1", title: "Docker Getting Started", url: "https://docs.docker.com/get-started/", type: "documentation", duration: "5 hours", provider: "Docker" },
        { id: "docker-2", title: "Docker for Beginners", url: "https://docker-curriculum.com/", type: "tutorial", duration: "8 hours", provider: "Docker Curriculum" }
      ],
      difficulty: "advanced" as ProficiencyLevel,
      estimatedTime: "20 hours",
      completed: false
    },
    {
      id: "roadmap-kubernetes",
      skillId: "kubernetes",
      skillName: "Kubernetes",
      resources: [
        { id: "k8s-1", title: "Kubernetes Documentation", url: "https://kubernetes.io/docs/tutorials/", type: "documentation", duration: "20 hours", provider: "Kubernetes" },
        { id: "k8s-2", title: "Learn Kubernetes Basics", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/", type: "tutorial", duration: "10 hours", provider: "Kubernetes" }
      ],
      difficulty: "intermediate" as ProficiencyLevel,
      estimatedTime: "35 hours",
      completed: false
    },
    {
      id: "roadmap-aws",
      skillId: "aws",
      skillName: "AWS",
      resources: [
        { id: "aws-1", title: "AWS Documentation", url: "https://docs.aws.amazon.com/", type: "documentation", duration: "50 hours", provider: "Amazon" },
        { id: "aws-2", title: "AWS Skill Builder", url: "https://skillbuilder.aws/", type: "course", duration: "100 hours", provider: "Amazon" }
      ],
      difficulty: "intermediate" as ProficiencyLevel,
      estimatedTime: "80 hours",
      completed: false
    },
    {
      id: "roadmap-cicd",
      skillId: "cicd",
      skillName: "CI/CD",
      resources: [
        { id: "cicd-1", title: "GitHub Actions Documentation", url: "https://docs.github.com/en/actions", type: "documentation", duration: "10 hours", provider: "GitHub" },
        { id: "cicd-2", title: "CI/CD Pipeline Tutorial", url: "https://www.atlassian.com/continuous-delivery/principles/continuous-integration-vs-delivery-vs-deployment", type: "tutorial", duration: "8 hours", provider: "Atlassian" }
      ],
      difficulty: "advanced" as ProficiencyLevel,
      estimatedTime: "25 hours",
      completed: false
    },
    {
      id: "roadmap-terraform",
      skillId: "terraform",
      skillName: "Terraform",
      resources: [
        { id: "tf-1", title: "Terraform Documentation", url: "https://www.terraform.io/docs", type: "documentation", duration: "15 hours", provider: "HashiCorp" },
        { id: "tf-2", title: "Terraform Tutorial", url: "https://learn.hashicorp.com/terraform", type: "tutorial", duration: "20 hours", provider: "HashiCorp" }
      ],
      difficulty: "intermediate" as ProficiencyLevel,
      estimatedTime: "30 hours",
      completed: false
    },
    {
      id: "roadmap-python",
      skillId: "python",
      skillName: "Python",
      resources: [
        { id: "python-1", title: "Python Official Tutorial", url: "https://docs.python.org/3/tutorial/", type: "documentation", duration: "20 hours", provider: "Python.org" },
        { id: "python-2", title: "Automate the Boring Stuff", url: "https://automatetheboringstuff.com/", type: "course", duration: "30 hours", provider: "Al Sweigart" }
      ],
      difficulty: "beginner" as ProficiencyLevel,
      estimatedTime: "25 hours",
      completed: false
    }
  ],

  "data-scientist": [
    {
      id: "roadmap-python",
      skillId: "python",
      skillName: "Python",
      resources: [
        { id: "python-1", title: "Python Official Tutorial", url: "https://docs.python.org/3/tutorial/", type: "documentation", duration: "20 hours", provider: "Python.org" },
        { id: "python-2", title: "Automate the Boring Stuff", url: "https://automatetheboringstuff.com/", type: "course", duration: "30 hours", provider: "Al Sweigart" }
      ],
      difficulty: "advanced" as ProficiencyLevel,
      estimatedTime: "40 hours",
      completed: false
    },
    {
      id: "roadmap-ml",
      skillId: "ml",
      skillName: "Machine Learning",
      resources: [
        { id: "ml-1", title: "Machine Learning Crash Course", url: "https://developers.google.com/machine-learning/crash-course", type: "course", duration: "15 hours", provider: "Google" },
        { id: "ml-2", title: "Fast.ai Practical Deep Learning", url: "https://course.fast.ai/", type: "course", duration: "40 hours", provider: "fast.ai" }
      ],
      difficulty: "intermediate" as ProficiencyLevel,
      estimatedTime: "50 hours",
      completed: false
    },
    {
      id: "roadmap-pandas",
      skillId: "pandas",
      skillName: "Pandas",
      resources: [
        { id: "pandas-1", title: "Pandas Documentation", url: "https://pandas.pydata.org/docs/", type: "documentation", duration: "20 hours", provider: "Pandas" },
        { id: "pandas-2", title: "Pandas Tutorial", url: "https://www.kaggle.com/learn/pandas", type: "course", duration: "15 hours", provider: "Kaggle" }
      ],
      difficulty: "advanced" as ProficiencyLevel,
      estimatedTime: "30 hours",
      completed: false
    },
    {
      id: "roadmap-sql",
      skillId: "sql",
      skillName: "SQL",
      resources: [
        { id: "sql-1", title: "SQL Tutorial", url: "https://www.w3schools.com/sql/", type: "tutorial", duration: "10 hours", provider: "W3Schools" },
        { id: "sql-2", title: "Advanced SQL", url: "https://www.kaggle.com/learn/advanced-sql", type: "course", duration: "12 hours", provider: "Kaggle" }
      ],
      difficulty: "intermediate" as ProficiencyLevel,
      estimatedTime: "20 hours",
      completed: false
    },
    {
      id: "roadmap-dataviz",
      skillId: "dataviz",
      skillName: "Data Visualization",
      resources: [
        { id: "dataviz-1", title: "Matplotlib Tutorial", url: "https://matplotlib.org/stable/tutorials/index.html", type: "tutorial", duration: "8 hours", provider: "Matplotlib" },
        { id: "dataviz-2", title: "Seaborn Tutorial", url: "https://seaborn.pydata.org/tutorial.html", type: "tutorial", duration: "6 hours", provider: "Seaborn" }
      ],
      difficulty: "intermediate" as ProficiencyLevel,
      estimatedTime: "15 hours",
      completed: false
    },
    {
      id: "roadmap-numpy",
      skillId: "numpy",
      skillName: "NumPy",
      resources: [
        { id: "numpy-1", title: "NumPy Documentation", url: "https://numpy.org/doc/stable/", type: "documentation", duration: "10 hours", provider: "NumPy" },
        { id: "numpy-2", title: "NumPy Tutorial", url: "https://www.w3schools.com/python/numpy/", type: "tutorial", duration: "8 hours", provider: "W3Schools" }
      ],
      difficulty: "intermediate" as ProficiencyLevel,
      estimatedTime: "15 hours",
      completed: false
    }
  ],

  "ml-engineer": [
    {
      id: "roadmap-python-ml",
      skillId: "python",
      skillName: "Python for ML",
      resources: [
        { id: "python-ml-1", title: "Python Machine Learning", url: "https://scikit-learn.org/stable/tutorial/index.html", type: "documentation", duration: "25 hours", provider: "Scikit-learn" },
        { id: "python-ml-2", title: "Python for Data Science", url: "https://www.kaggle.com/learn/python", type: "course", duration: "20 hours", provider: "Kaggle" }
      ],
      difficulty: "advanced" as ProficiencyLevel,
      estimatedTime: "35 hours",
      completed: false
    },
    {
      id: "roadmap-ml-advanced",
      skillId: "ml",
      skillName: "Advanced Machine Learning",
      resources: [
        { id: "ml-adv-1", title: "Advanced ML Specialization", url: "https://www.coursera.org/specializations/advanced-machine-learning", type: "course", duration: "60 hours", provider: "Coursera" },
        { id: "ml-adv-2", title: "ML Engineering Best Practices", url: "https://developers.google.com/machine-learning/guides", type: "documentation", duration: "20 hours", provider: "Google" }
      ],
      difficulty: "advanced" as ProficiencyLevel,
      estimatedTime: "70 hours",
      completed: false
    },
    {
      id: "roadmap-tensorflow",
      skillId: "tensorflow",
      skillName: "TensorFlow",
      resources: [
        { id: "tf-1", title: "TensorFlow Documentation", url: "https://www.tensorflow.org/learn", type: "documentation", duration: "30 hours", provider: "TensorFlow" },
        { id: "tf-2", title: "TensorFlow Developer Certificate", url: "https://www.tensorflow.org/certificate", type: "course", duration: "40 hours", provider: "TensorFlow" }
      ],
      difficulty: "intermediate" as ProficiencyLevel,
      estimatedTime: "50 hours",
      completed: false
    },
    {
      id: "roadmap-docker-ml",
      skillId: "docker",
      skillName: "Docker for ML",
      resources: [
        { id: "docker-ml-1", title: "Docker for Data Science", url: "https://docs.docker.com/get-started/", type: "documentation", duration: "10 hours", provider: "Docker" },
        { id: "docker-ml-2", title: "Containerizing ML Models", url: "https://towardsdatascience.com/how-to-containerize-python-applications-with-docker-7ceae397a90a", type: "tutorial", duration: "8 hours", provider: "Medium" }
      ],
      difficulty: "intermediate" as ProficiencyLevel,
      estimatedTime: "15 hours",
      completed: false
    },
    {
      id: "roadmap-aws-ml",
      skillId: "aws",
      skillName: "AWS for ML",
      resources: [
        { id: "aws-ml-1", title: "AWS Machine Learning", url: "https://aws.amazon.com/machine-learning/", type: "documentation", duration: "20 hours", provider: "AWS" },
        { id: "aws-ml-2", title: "AWS SageMaker Tutorial", url: "https://aws.amazon.com/sagemaker/getting-started/", type: "tutorial", duration: "15 hours", provider: "AWS" }
      ],
      difficulty: "beginner" as ProficiencyLevel,
      estimatedTime: "25 hours",
      completed: false
    }
  ],

  "cloud-architect": [
    {
      id: "roadmap-aws-architect",
      skillId: "aws",
      skillName: "AWS Architecture",
      resources: [
        { id: "aws-arch-1", title: "AWS Solutions Architect", url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/", type: "course", duration: "80 hours", provider: "AWS" },
        { id: "aws-arch-2", title: "AWS Well-Architected Framework", url: "https://aws.amazon.com/architecture/well-architected/", type: "documentation", duration: "20 hours", provider: "AWS" }
      ],
      difficulty: "advanced" as ProficiencyLevel,
      estimatedTime: "90 hours",
      completed: false
    },
    {
      id: "roadmap-kubernetes-arch",
      skillId: "kubernetes",
      skillName: "Kubernetes Architecture",
      resources: [
        { id: "k8s-arch-1", title: "Kubernetes Architecture Deep Dive", url: "https://kubernetes.io/docs/concepts/architecture/", type: "documentation", duration: "25 hours", provider: "Kubernetes" },
        { id: "k8s-arch-2", title: "CKA Certification", url: "https://www.cncf.io/certification/cka/", type: "course", duration: "60 hours", provider: "CNCF" }
      ],
      difficulty: "advanced" as ProficiencyLevel,
      estimatedTime: "70 hours",
      completed: false
    },
    {
      id: "roadmap-terraform-arch",
      skillId: "terraform",
      skillName: "Infrastructure as Code",
      resources: [
        { id: "tf-arch-1", title: "Terraform Associate Certification", url: "https://www.hashicorp.com/certification/terraform-associate", type: "course", duration: "40 hours", provider: "HashiCorp" },
        { id: "tf-arch-2", title: "Advanced Terraform Patterns", url: "https://learn.hashicorp.com/terraform", type: "tutorial", duration: "30 hours", provider: "HashiCorp" }
      ],
      difficulty: "advanced" as ProficiencyLevel,
      estimatedTime: "60 hours",
      completed: false
    },
    {
      id: "roadmap-docker-arch",
      skillId: "docker",
      skillName: "Container Architecture",
      resources: [
        { id: "docker-arch-1", title: "Docker Architecture Guide", url: "https://docs.docker.com/get-started/overview/", type: "documentation", duration: "15 hours", provider: "Docker" },
        { id: "docker-arch-2", title: "Docker Security Best Practices", url: "https://docs.docker.com/engine/security/", type: "documentation", duration: "10 hours", provider: "Docker" }
      ],
      difficulty: "advanced" as ProficiencyLevel,
      estimatedTime: "20 hours",
      completed: false
    },
    {
      id: "roadmap-cicd-arch",
      skillId: "cicd",
      skillName: "CI/CD Architecture",
      resources: [
        { id: "cicd-arch-1", title: "DevOps CI/CD Pipeline", url: "https://docs.github.com/en/actions", type: "documentation", duration: "20 hours", provider: "GitHub" },
        { id: "cicd-arch-2", title: "Enterprise CI/CD Patterns", url: "https://www.jenkins.io/doc/book/pipeline/", type: "tutorial", duration: "25 hours", provider: "Jenkins" }
      ],
      difficulty: "intermediate" as ProficiencyLevel,
      estimatedTime: "35 hours",
      completed: false
    }
  ]
};

// Helper function to get fixed roadmap for a role
export const getFixedRoadmap = (roleId: string): RoadmapItem[] => {
  return fixedRoadmaps[roleId] || [];
};

// Helper function to get all available roadmap role IDs
export const getAvailableRoadmapRoles = (): string[] => {
  return Object.keys(fixedRoadmaps);
};

// Helper function to check if a role has a roadmap template
export const hasRoadmapTemplate = (roleId: string): boolean => {
  return roleId in fixedRoadmaps && fixedRoadmaps[roleId].length > 0;
};

// Helper function to get roadmap statistics
export const getRoadmapStats = (roleId: string) => {
  const roadmap = getFixedRoadmap(roleId);
  if (roadmap.length === 0) {
    return null;
  }
  
  const totalHours = roadmap.reduce((sum, item) => {
    const hours = parseInt(item.estimatedTime.split(' ')[0]) || 0;
    return sum + hours;
  }, 0);
  
  const difficultyCount = roadmap.reduce((acc, item) => {
    acc[item.difficulty] = (acc[item.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalSkills: roadmap.length,
    totalHours,
    estimatedWeeks: Math.ceil(totalHours / 10), // Assuming 10 hours per week
    difficultyBreakdown: difficultyCount
  };
};