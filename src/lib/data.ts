export const profile = {
  name: "Vyshnav K Kumar",
  first: "Vyshnav",
  last: "K Kumar",
  role: "Senior Full Stack Developer",
  tagline: "Generative AI & RAG",
  location: "Calicut, Kerala, India",
  email: "vyshnav456@gmail.com",
  phone: "+91 7012682369",
  linkedin: "https://www.linkedin.com/in/vyshnavkkumar",
  resume: "/Vyshnav_K_Kumar_Resume.pdf",
  summary:
    "Full Stack Developer with 5+ years of experience designing, developing, and scaling enterprise web applications using React.js, Next.js, Node.js, Express.js, MongoDB, JavaScript, and TypeScript. Strong background in responsive UI development, REST and GraphQL APIs, authentication, microservices, real-time systems, and cloud-based deployments.",
  summary2:
    "Hands-on exposure to Generative AI application development — LLM API integration, prompt engineering, retrieval-augmented generation, embeddings, vector search, and AI-assisted engineering workflows. Proven technical lead guiding a 9-member team.",
} as const;

export const stats = [
  { value: 5, suffix: "+", label: "Years building for production" },
  { value: 9, suffix: "", label: "Engineers led as technical lead" },
  { value: 83, suffix: "%", label: "Faster demo provisioning" },
  { value: 99.9, suffix: "%", label: "Service availability maintained" },
] as const;

export type Experience = {
  role: string;
  company: string;
  location: string;
  period: string;
  current?: boolean;
  points: string[];
};

export const experience: Experience[] = [
  {
    role: "Technical Lead",
    company: "Infinite Open Source Solutions LLP",
    location: "Calicut, India",
    period: "Jan 2024 — Present",
    current: true,
    points: [
      "Lead full-stack architecture and delivery of enterprise MERN applications using React.js, Node.js, Express.js, MongoDB, REST APIs, and reusable service-oriented components.",
      "Design scalable backend APIs, authentication flows, real-time features, and responsive user interfaces while translating product requirements into maintainable technical solutions.",
      "Guide a cross-functional team of 9 engineers through sprint planning, code reviews, technical decisions, debugging, release management, and production support.",
      "Integrated AI-assisted and agentic development workflows using Claude Code, Cursor, GitHub Copilot, and ChatGPT for rapid prototyping, refactoring, test generation, and documentation.",
      "Contributed to AI-enabled solution design involving LLM-based summarization, structured outputs, document processing, embeddings, vector retrieval, and RAG-oriented workflows.",
      "Engineered an automated demo provisioning pipeline that reduced setup time by 83% (90 seconds to 15 seconds), saving more than 10 engineering hours per week.",
      "Improved application performance by up to 40% through query optimization, API profiling, caching, code-quality standards, and systematic root-cause analysis.",
      "Maintained 99.9% service availability through Dockerized deployments, CI/CD automation, monitoring, and infrastructure hardening.",
    ],
  },
  {
    role: "Software Developer",
    company: "Infinite Open Source Solutions LLP",
    location: "Calicut, India",
    period: "Oct 2021 — Dec 2023",
    points: [
      "Developed end-to-end product features using React.js, JavaScript, Node.js, Express.js, MongoDB, MySQL, and RESTful APIs for enterprise web platforms.",
      "Built reusable UI components, modular backend services, validation layers, database integrations, error handling, and secure JWT-based authentication.",
      "Modernized legacy modules into service-oriented and microservices-based components, improving scalability, maintainability, and deployment flexibility.",
      "Implemented real-time dashboards and event-driven functionality using WebSocket, Redis, and RabbitMQ-based processing patterns.",
      "Resolved more than 50 critical production issues through log analysis, performance profiling, database investigation, regression testing, and documented root-cause analysis.",
      "Collaborated with product managers, UI/UX designers, QA engineers, and DevOps teams to deliver production-ready releases in Agile sprints.",
    ],
  },
];

export type Project = {
  title: string;
  blurb: string;
  stack: string[];
  highlights: string[];
  accent: "violet" | "cyan" | "amber" | "emerald";
};

export const projects: Project[] = [
  {
    title: "AI-Powered Customer Engagement Platform",
    blurb:
      "An AI-enabled platform that processes conversations and documents to generate summaries, requirements, searchable knowledge, sentiment insights, and structured business outputs.",
    stack: ["React.js", "Node.js", "Python / FastAPI", "MongoDB", "PostgreSQL", "LLMs", "RAG"],
    highlights: [
      "LLM integration with prompt workflows and structured outputs",
      "Embeddings and vector retrieval powering semantic search",
      "Background queues for long-running document processing",
      "Multi-tenant API design",
    ],
    accent: "violet",
  },
  {
    title: "Network Marketing Enterprise Platform",
    blurb:
      "A multi-tenant full-stack platform built around complex hierarchical user structures, commission engines, and financial workflows at scale.",
    stack: ["React.js", "Node.js", "Express.js", "MongoDB", "MySQL"],
    highlights: [
      "Genealogy dashboards over deep hierarchical trees",
      "Commission and payout calculation engines",
      "Authentication, roles, and reporting",
      "High-volume API and database operations",
    ],
    accent: "cyan",
  },
  {
    title: "Learning Management System",
    blurb:
      "An LMS with responsive interfaces, course and user management, student progress tracking, and automated assessments deployed on AWS.",
    stack: ["MERN Stack", "AWS", "WebSocket"],
    highlights: [
      "Course, cohort, and user management",
      "Progress tracking and automated assessments",
      "Real-time functionality over WebSocket",
      "Analytics dashboards",
    ],
    accent: "emerald",
  },
  {
    title: "Process Automation & DevOps Pipeline",
    blurb:
      "Automated provisioning and deployment workflows that cut environment setup from 90 seconds to 15 and improved release consistency across production.",
    stack: ["Node.js", "Docker", "GitLab CI/CD", "AWS"],
    highlights: [
      "83% reduction in setup time",
      "Consistent, repeatable releases",
      "99.9% availability across environments",
      "10+ engineering hours saved weekly",
    ],
    accent: "amber",
  },
];

export const skills = [
  {
    group: "Frontend",
    items: [
      "React.js",
      "Next.js",
      "Redux",
      "Redux Toolkit",
      "JavaScript (ES6+)",
      "TypeScript",
      "HTML5",
      "CSS3",
      "Tailwind CSS",
      "Material UI",
      "Responsive Design",
    ],
  },
  {
    group: "Backend & APIs",
    items: [
      "Node.js",
      "Express.js",
      "REST API Development",
      "GraphQL",
      "WebSocket",
      "JWT",
      "Authentication & Authorization",
      "Microservices",
    ],
  },
  {
    group: "Databases & Caching",
    items: ["MongoDB", "MySQL", "PostgreSQL", "Mongoose", "Sequelize", "Redis"],
  },
  {
    group: "Generative AI",
    items: [
      "LLMs",
      "RAG",
      "Prompt Engineering",
      "Embeddings",
      "Vector Search",
      "OpenAI API",
      "Gemini API",
      "LangChain / LlamaIndex",
      "Agentic AI",
    ],
  },
  {
    group: "Cloud & DevOps",
    items: [
      "Docker",
      "AWS EC2",
      "Azure",
      "CI/CD",
      "GitLab CI/CD",
      "Git",
      "Nginx",
      "Linux",
      "Kubernetes fundamentals",
    ],
  },
  {
    group: "Engineering",
    items: [
      "System Design",
      "API Integration",
      "Agile / Scrum",
      "Code Review",
      "TDD",
      "Performance Optimization",
      "Postman",
      "Jira",
    ],
  },
] as const;

export const education = [
  {
    title: "B.Tech in Electronics and Communication Engineering",
    org: "T K M College of Engineering, Kollam, Kerala",
  },
  {
    title: "Penetration Tester",
    org: "RedTeam Hacker Academy",
  },
  {
    title: "Full Stack Development — CCBP Tech 4.0 Intensive",
    org: "NxtWave",
  },
] as const;

export const achievements = [
  {
    title: "Best R&D Performer Award",
    detail: "For product innovation, backend optimization, and engineering improvements.",
  },
  {
    title: "Process Optimization Excellence",
    detail:
      "Recognition for reducing custom demo setup time by 83% and improving sales enablement.",
  },
] as const;

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#projects", label: "Projects" },
  { href: "#delivery", label: "Delivery" },
  { href: "#stack", label: "Stack" },
  { href: "#contact", label: "Contact" },
] as const;
