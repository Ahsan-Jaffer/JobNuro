const normalizeSkill = (skill) => {
  return String(skill || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\./g, "")
    .trim();
};

const skillAliases = {
  nodejs: ["node", "node js", "nodejs"],
  expressjs: ["express", "express js", "expressjs"],
  react: ["react", "reactjs", "react js"],
  nextjs: ["next", "next js", "nextjs"],
  mongodb: ["mongo", "mongo db", "mongodb"],
  javascript: ["js", "javascript"],
  typescript: ["ts", "typescript"],
  "tailwind css": ["tailwind", "tailwindcss", "tailwind css"],
  "rest api": ["api", "apis", "rest", "rest api", "restful api"],
  "scikit-learn": ["scikit learn", "sklearn", "scikit-learn"],
};

const getSkillVariants = (skill) => {
  const normalized = normalizeSkill(skill);
  const aliases = skillAliases[normalized] || [];

  return new Set([normalized, ...aliases.map(normalizeSkill)]);
};

export const matchSkillLists = (userSkills = [], jobSkills = []) => {
  const normalizedUserSkills = userSkills.map((skill) => ({
    original: skill,
    variants: getSkillVariants(skill),
  }));

  const matched = [];
  const missing = [];

  jobSkills.forEach((jobSkill) => {
    const jobVariants = getSkillVariants(jobSkill);

    const isMatched = normalizedUserSkills.some((userSkill) => {
      for (const variant of userSkill.variants) {
        if (jobVariants.has(variant)) {
          return true;
        }
      }

      return false;
    });

    if (isMatched) {
      matched.push(jobSkill);
    } else {
      missing.push(jobSkill);
    }
  });

  return {
    matched,
    missing,
    matchCount: matched.length,
    totalCount: jobSkills.length,
    matchRatio: jobSkills.length ? matched.length / jobSkills.length : 1,
  };
};

export const calculateSkillScore = (matchedCount, totalCount, maxScore) => {
  if (!totalCount) {
    return maxScore;
  }

  return Math.round((matchedCount / totalCount) * maxScore);
};