import json
import re
from pathlib import Path
from app.utils.text_cleaner import normalize_for_matching

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "skills_dictionary.json"


def load_skills_dictionary() -> dict:
    with open(DATA_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def flatten_skills(skills_dictionary: dict) -> list[str]:
    skills = []

    for category_skills in skills_dictionary.values():
        skills.extend(category_skills)

    return sorted(set(skills), key=len, reverse=True)


def extract_skills(text: str) -> dict:
    normalized_text = normalize_for_matching(text)
    skills_dictionary = load_skills_dictionary()

    categorized_skills = {}
    all_found_skills = []

    for category, skills in skills_dictionary.items():
        found_in_category = []

        for skill in skills:
            normalized_skill = normalize_for_matching(skill)

            pattern = r"(?<![a-z0-9+#.])" + re.escape(normalized_skill) + r"(?![a-z0-9+#.])"

            if re.search(pattern, normalized_text):
                found_in_category.append(skill)
                all_found_skills.append(skill)

        if found_in_category:
            categorized_skills[category] = sorted(set(found_in_category))

    return {
        "skills": sorted(set(all_found_skills)),
        "categorizedSkills": categorized_skills,
    }