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