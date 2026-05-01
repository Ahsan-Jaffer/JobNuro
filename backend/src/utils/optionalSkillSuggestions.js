const roleBasedOptionalSkills = {
  frontend: [
    "TypeScript",
    "Next.js",
    "Redux",
    "UI Testing",
    "Accessibility",
    "Performance Optimization",
  ],

  backend: [
    "Docker",
    "Redis",
    "GraphQL",
    "Microservices",
    "API Security",
    "Unit Testing",
  ],

  mern: [
    "TypeScript",
    "Docker",
    "Redux",
    "Redis",
    "GraphQL",
    "Testing",
  ],

  python: [
    "Django",
    "Flask",
    "Data Structures",
    "Automation",
    "API Testing",
    "Unit Testing",
  ],

  ai_ml: [
    "NLP",
    "TensorFlow",
    "PyTorch",
    "Model Evaluation",
    "Feature Engineering",
    "Data Visualization",
  ],

  data: [
    "Power BI",
    "Tableau",
    "Data Visualization",
    "Statistics",
    "Dashboarding",
    "Excel",
  ],

  qa: [
    "Automation Testing",
    "Selenium",
    "Test Cases",
    "Jira",
    "API Testing",
    "Regression Testing",
  ],

  uiux: [
    "User Research",
    "Prototyping",
    "Design Systems",
    "Usability Testing",
    "Responsive Design",
    "Accessibility",
  ],

  general: ["Git", "Communication", "Problem Solving", "Documentation"],
};

const normalizeText = (text) => {
  return String(text || "").toLowerCase();
};

const detectRoleCategory = (job = {}) => {
  const combinedText = normalizeText(
    [
      job.title,
      job.description,
      ...(job.requiredSkills || []),
      ...(job.preferredSkills || []),
    ].join(" ")
  );

  if (
    combinedText.includes("mern") ||
    (combinedText.includes("react") &&
      combinedText.includes("node") &&
      combinedText.includes("mongodb"))
  ) {
    return "mern";
  }

  if (
    combinedText.includes("frontend") ||
    combinedText.includes("front-end") ||
    combinedText.includes("react") ||
    combinedText.includes("ui developer")
  ) {
    return "frontend";
  }

  if (
    combinedText.includes("backend") ||
    combinedText.includes("back-end") ||
    combinedText.includes("node") ||
    combinedText.includes("express") ||
    combinedText.includes("api")
  ) {
    return "backend";
  }

  if (
    combinedText.includes("ai") ||
    combinedText.includes("machine learning") ||
    combinedText.includes("ml") ||
    combinedText.includes("deep learning")
  ) {
    return "ai_ml";
  }

  if (
    combinedText.includes("data analyst") ||
    combinedText.includes("data analysis") ||
    combinedText.includes("sql") ||
    combinedText.includes("pandas")
  ) {
    return "data";
  }

  if (
    combinedText.includes("qa") ||
    combinedText.includes("testing") ||
    combinedText.includes("quality assurance")
  ) {
    return "qa";
  }

  if (
    combinedText.includes("ui/ux") ||
    combinedText.includes("ux") ||
    combinedText.includes("figma") ||
    combinedText.includes("designer")
  ) {
    return "uiux";
  }

  if (combinedText.includes("python")) {
    return "python";
  }

  return "general";
};

const normalizeSkill = (skill) => {
  return String(skill || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
};

export const getOptionalSkillSuggestions = ({
  job,
  userSkills = [],
  requiredSkills = [],
  preferredSkills = [],
  limit = 3,
}) => {
  const roleCategory = detectRoleCategory(job);
  const suggestions = roleBasedOptionalSkills[roleCategory] || roleBasedOptionalSkills.general;

  const existingSkillsSet = new Set(
    [...userSkills, ...requiredSkills, ...preferredSkills].map(normalizeSkill)
  );

  return suggestions
    .filter((skill) => !existingSkillsSet.has(normalizeSkill(skill)))
    .slice(0, limit);
};