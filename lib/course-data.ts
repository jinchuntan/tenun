import { CourseResource } from "./types";

export const coursesBySkill: Record<string, CourseResource[]> = {
  "Machine Learning Fundamentals": [
    {
      name: "Machine Learning Specialization",
      provider: "DeepLearning.AI",
      platform: "Coursera",
      description: "Master ML fundamentals with Andrew Ng — supervised & unsupervised learning, neural networks, and industry best practices.",
      duration: "3 months",
      url: "https://www.coursera.org/specializations/machine-learning-introduction",
    },
    {
      name: "Machine Learning A–Z",
      provider: "Kirill Eremenko & Hadelin de Ponteves",
      platform: "Udemy",
      description: "Hands-on machine learning in Python and R covering regression, classification, clustering, and deep learning with real datasets.",
      duration: "44 hours",
      url: "https://www.udemy.com/course/machinelearning/",
    },
  ],
  "Product Thinking": [
    {
      name: "Digital Product Management Specialization",
      provider: "University of Virginia (Darden)",
      platform: "Coursera",
      description: "Design, develop, and launch digital products using modern PM frameworks. Taught by UVA Darden faculty.",
      duration: "7 months",
      url: "https://www.coursera.org/specializations/uva-darden-digital-product-management",
    },
    {
      name: "Become a Product Manager",
      provider: "Cole Mercer & Evan Kimbrell",
      platform: "Udemy",
      description: "The most comprehensive PM course on Udemy. Covers roadmapping, user research, metrics, and career strategy.",
      duration: "13 hours",
      url: "https://www.udemy.com/course/become-a-product-manager-learn-the-skills-get-a-job/",
    },
  ],
  "Full-Stack Development": [
    {
      name: "Meta Full-Stack Engineer Professional Certificate",
      provider: "Meta",
      platform: "Coursera",
      description: "Build industry-ready full-stack skills with React, Node.js, databases, and deployment. Backed by Meta's engineering teams.",
      duration: "9 months",
      url: "https://www.coursera.org/professional-certificates/meta-full-stack-engineer",
    },
    {
      name: "The Web Developer Bootcamp",
      provider: "Colt Steele",
      platform: "Udemy",
      description: "Complete front-to-back web development with HTML, CSS, JavaScript, Node.js, MongoDB. One of Udemy's most popular courses.",
      duration: "67 hours",
      url: "https://www.udemy.com/course/the-web-developer-bootcamp/",
    },
  ],
  "People Management": [
    {
      name: "Leading Teams Specialization",
      provider: "University of Michigan",
      platform: "Coursera",
      description: "Understand the key challenges of managing teams, motivating employees, and building a high-performance culture.",
      duration: "4 months",
      url: "https://www.coursera.org/specializations/leading-teams",
    },
    {
      name: "The Complete Manager's Toolkit",
      provider: "Chris Croft",
      platform: "Udemy",
      description: "Practical management skills: delegation, motivation, handling difficult conversations, and performance reviews.",
      duration: "11 hours",
      url: "https://www.udemy.com/course/the-complete-managers-toolkit/",
    },
  ],
  "A/B Testing": [
    {
      name: "A/B Testing and Experimentation for Businesses",
      provider: "Udemy Instructors",
      platform: "Udemy",
      description: "Design and analyse A/B tests to make data-driven decisions. Covers statistical significance, experiment design, and interpretation.",
      duration: "6 hours",
      url: "https://www.udemy.com/course/ab-testing/",
    },
    {
      name: "Marketing Analytics",
      provider: "University of Virginia (Darden)",
      platform: "Coursera",
      description: "Use data to understand customer behaviour and evaluate marketing and product experiments with statistical rigour.",
      duration: "4 weeks",
      url: "https://www.coursera.org/learn/uva-darden-market-analytics",
    },
  ],
  "Advanced SQL": [
    {
      name: "The Complete SQL Bootcamp",
      provider: "Jose Portilla",
      platform: "Udemy",
      description: "From zero to hero in SQL with PostgreSQL. Covers complex queries, window functions, joins, and database design.",
      duration: "9 hours",
      url: "https://www.udemy.com/course/the-complete-sql-bootcamp/",
    },
    {
      name: "SQL for Data Science",
      provider: "UC Davis",
      platform: "Coursera",
      description: "Learn SQL for data analysis from the ground up. Filter, sort, aggregate, and join datasets in real-world scenarios.",
      duration: "4 weeks",
      url: "https://www.coursera.org/learn/sql-for-data-science",
    },
  ],
  "Statistical Analysis": [
    {
      name: "Statistics with Python Specialization",
      provider: "University of Michigan",
      platform: "Coursera",
      description: "Visualise data, understand statistical distributions, and perform hypothesis testing and regression in Python.",
      duration: "3 months",
      url: "https://www.coursera.org/specializations/statistics-with-python",
    },
    {
      name: "Statistics and Probability in Data Science",
      provider: "UC San Diego",
      platform: "edX",
      description: "Build strong statistical foundations for data science: probability, distributions, confidence intervals, and significance testing.",
      duration: "6 weeks",
      url: "https://www.edx.org/course/statistics-and-probability-in-data-science-using-python",
    },
  ],
  "Business Communication": [
    {
      name: "Business English Communication Skills Specialization",
      provider: "University of Washington",
      platform: "Coursera",
      description: "Improve professional writing, presentations, and negotiation communication for global workplaces.",
      duration: "4 months",
      url: "https://www.coursera.org/specializations/business-english",
    },
  ],
  "Strategic Planning": [
    {
      name: "Business Strategy Specialization",
      provider: "University of Virginia (Darden)",
      platform: "Coursera",
      description: "Develop frameworks for competitive analysis, strategic planning, and business model innovation.",
      duration: "5 months",
      url: "https://www.coursera.org/specializations/business-strategy",
    },
    {
      name: "Corporate Strategy",
      provider: "University of London",
      platform: "Coursera",
      description: "Explore how firms create and capture value across markets through portfolio strategy and competitive positioning.",
      duration: "4 weeks",
      url: "https://www.coursera.org/learn/corporate-strategy",
    },
  ],
  "User Research Methods": [
    {
      name: "Google UX Design Professional Certificate",
      provider: "Google",
      platform: "Coursera",
      description: "Learn the UX design process from research to high-fidelity prototyping. Includes portfolio projects and Figma practice.",
      duration: "6 months",
      url: "https://www.coursera.org/professional-certificates/google-ux-design",
    },
    {
      name: "UX Research and Design Specialization",
      provider: "University of Michigan",
      platform: "Coursera",
      description: "Conduct usability tests, analyse qualitative data, and turn user insights into actionable product decisions.",
      duration: "6 months",
      url: "https://www.coursera.org/specializations/michiganux",
    },
  ],
  "Cloud Platforms (AWS/GCP)": [
    {
      name: "AWS Cloud Practitioner Essentials",
      provider: "Amazon Web Services",
      platform: "Coursera",
      description: "Introduction to AWS Cloud concepts, services, and infrastructure. Ideal first step toward AWS certification.",
      duration: "6 hours",
      url: "https://www.coursera.org/learn/aws-cloud-practitioner-essentials",
    },
    {
      name: "Google Cloud Fundamentals: Core Infrastructure",
      provider: "Google Cloud",
      platform: "Coursera",
      description: "Hands-on introduction to GCP's core infrastructure products and services including Compute, Storage, and Networking.",
      duration: "8 hours",
      url: "https://www.coursera.org/learn/gcp-fundamentals",
    },
  ],
  "Executive Communication": [
    {
      name: "Leadership Communication for Maximum Impact",
      provider: "Northwestern University",
      platform: "Coursera",
      description: "Craft compelling narratives, present with confidence, and communicate strategic vision to executive audiences.",
      duration: "4 weeks",
      url: "https://www.coursera.org/learn/leadership-communication-executives-nr",
    },
  ],
  "Product Analytics": [
    {
      name: "Google Data Analytics Professional Certificate",
      provider: "Google",
      platform: "Coursera",
      description: "Industry-recognised certificate covering the full analytics lifecycle. Hands-on projects in SQL, R, and Tableau.",
      duration: "6 months",
      url: "https://www.coursera.org/professional-certificates/google-data-analytics",
    },
    {
      name: "Product Analytics Micro-Certification",
      provider: "Reforge",
      platform: "Other",
      description: "Learn how top product teams use data to make decisions — event tracking, funnels, retention, and experimentation.",
      duration: "8 weeks",
      url: "https://www.reforge.com/product-analytics",
    },
  ],
  "Stakeholder Management": [
    {
      name: "Google Project Management Professional Certificate",
      provider: "Google",
      platform: "Coursera",
      description: "Learn stakeholder communication, risk management, and project delivery frameworks used at Google.",
      duration: "6 months",
      url: "https://www.coursera.org/professional-certificates/google-project-management",
    },
  ],
  "Domain Expertise": [
    {
      name: "IBM Data Science Professional Certificate",
      provider: "IBM",
      platform: "Coursera",
      description: "Build domain expertise in data science with Python, SQL, machine learning, and capstone projects using real datasets.",
      duration: "11 months",
      url: "https://www.coursera.org/professional-certificates/ibm-data-science",
    },
  ],
  "Storytelling with Data": [
    {
      name: "Storytelling and influencing: Communicate with impact",
      provider: "Macquarie University",
      platform: "Coursera",
      description: "Craft compelling data narratives that persuade and inform. Covers visualisation principles and presentation design.",
      duration: "4 weeks",
      url: "https://www.coursera.org/learn/communicate-data-stories",
    },
    {
      name: "Data Visualization with Tableau Specialization",
      provider: "UC Davis",
      platform: "Coursera",
      description: "Build interactive dashboards and tell visual stories with data using Tableau from beginner to advanced.",
      duration: "5 months",
      url: "https://www.coursera.org/specializations/data-visualization",
    },
  ],
  "Cross-functional Collaboration": [
    {
      name: "Inspiring and Motivating Individuals",
      provider: "University of Michigan",
      platform: "Coursera",
      description: "Understand team dynamics, motivational theory, and how to align cross-functional stakeholders toward shared goals.",
      duration: "4 weeks",
      url: "https://www.coursera.org/learn/motivate-people-teams",
    },
  ],
  "Budget Management": [
    {
      name: "Financial Planning & Analysis: Building a Company's Budget",
      provider: "Coursera Instructor Network",
      platform: "Coursera",
      description: "Master budgeting frameworks, variance analysis, and financial modelling for operational and strategic planning.",
      duration: "12 hours",
      url: "https://www.coursera.org/learn/financial-planning-analysis",
    },
  ],
  "MVP Design": [
    {
      name: "Design Thinking Specialization",
      provider: "University of Virginia (Darden)",
      platform: "Coursera",
      description: "Apply human-centred design thinking to define problems, ideate, prototype, and test MVPs rapidly.",
      duration: "3 months",
      url: "https://www.coursera.org/specializations/design-thinking-innovation",
    },
    {
      name: "Product Design: The Delft Design Approach",
      provider: "Delft University of Technology",
      platform: "edX",
      description: "Systematic product design methodology from idea generation to functional prototyping.",
      duration: "8 weeks",
      url: "https://www.edx.org/course/product-design-the-delft-design-approach",
    },
  ],
};

export function getCoursesForSkill(skill: string): CourseResource[] {
  if (coursesBySkill[skill]) return coursesBySkill[skill];

  return [
    {
      name: `${skill} — Beginner to Advanced`,
      provider: "Top-rated instructors",
      platform: "Coursera",
      description: `Build foundational to advanced knowledge in ${skill} through structured lessons and hands-on projects.`,
      duration: "4–8 weeks",
      url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`,
    },
    {
      name: `${skill} Complete Bootcamp`,
      provider: "Expert practitioners",
      platform: "Udemy",
      description: `Practical, project-based ${skill} training designed to get you job-ready fast.`,
      duration: "10–20 hours",
      url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}`,
    },
  ];
}
