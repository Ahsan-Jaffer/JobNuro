import json
import re
from pathlib import Path
from app.utils.text_cleaner import get_word_count

ACTION_VERBS_PATH = Path(__file__).resolve().parents[1] / "data" / "action_verbs.json"


def load_action_verbs() -> list[str]:
    with open(ACTION_VERBS_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def score_formatting(text: str) -> tuple[int, list[str]]:
    score = 20
    suggestions = []

    if len(text.strip()) < 300:
        score -= 6
        suggestions.append("Resume content appears too short. Add more relevant project or experience details.")

    if "|" in text and text.count("|") > 15:
        score -= 4
        suggestions.append("Avoid complex tables because some ATS systems may parse them incorrectly.")

    if text.count("•") + text.count("-") < 5:
        score -= 3
        suggestions.append("Use bullet points to make project and experience details easier to scan.")

    return max(score, 0), suggestions


def score_required_sections(profile: dict) -> tuple[int, list[str]]:
    score = 15
    suggestions = []

    required_sections = ["education", "skills", "projects"]
    found_sections = set(profile.get("sectionsFound", []))

    for section in required_sections:
        if section not in found_sections:
            score -= 4
            suggestions.append(f"Add a clear {section.title()} section to improve ATS readability.")

    if not profile.get("email") or not profile.get("phone"):
        score -= 3
        suggestions.append("Add complete contact information including email and phone number.")

    return max(score, 0), suggestions


def score_keywords(profile: dict) -> tuple[int, list[str]]:
    skills = profile.get("skills", [])
    score = min(20, len(skills) * 2)

    suggestions = []

    if len(skills) < 5:
        suggestions.append("Add more relevant technical skills such as programming languages, frameworks, databases, and tools.")

    return score, suggestions


def score_skill_clarity(profile: dict) -> tuple[int, list[str]]:
    categorized_skills = profile.get("categorizedSkills", {})
    score = 15
    suggestions = []

    if not profile.get("skills"):
        return 0, ["Add a dedicated skills section with clear technical skills."]

    if len(categorized_skills.keys()) < 2:
        score -= 5
        suggestions.append("Group skills into categories such as Frontend, Backend, Database, Tools, or AI/ML.")

    if len(profile.get("skills", [])) < 4:
        score -= 4

    return max(score, 0), suggestions


def score_achievement_quality(text: str) -> tuple[int, list[str]]:
    action_verbs = load_action_verbs()
    lower_text = text.lower()

    action_count = sum(1 for verb in action_verbs if re.search(r"\b" + re.escape(verb) + r"\b", lower_text))
    metric_count = len(re.findall(r"\b\d+%|\b\d+\+|\b\d+\s?(users|projects|apis|pages|modules|features)\b", lower_text))

    score = 0
    score += min(9, action_count * 2)
    score += min(6, metric_count * 2)

    suggestions = []

    if action_count < 3:
        suggestions.append("Use stronger action verbs such as developed, implemented, optimized, integrated, and deployed.")

    if metric_count < 2:
        suggestions.append("Add measurable achievements, for example: improved performance by 20% or built 5 core modules.")

    return min(score, 15), suggestions


def score_contact_details(profile: dict) -> tuple[int, list[str]]:
    score = 0
    suggestions = []

    if profile.get("email"):
        score += 2
    else:
        suggestions.append("Add a valid professional email address.")

    if profile.get("phone"):
        score += 2
    else:
        suggestions.append("Add a phone number.")

    links = profile.get("links", {})

    if links.get("linkedin") or links.get("github") or links.get("portfolio"):
        score += 1
    else:
        suggestions.append("Add LinkedIn, GitHub, or portfolio link to strengthen your profile.")

    return score, suggestions


def score_grammar_consistency(text: str) -> tuple[int, list[str]]:
    score = 10
    suggestions = []

    if re.search(r"\s{3,}", text):
        score -= 2
        suggestions.append("Remove extra spacing and keep formatting consistent.")

    if len(re.findall(r"[.!?]{2,}", text)) > 2:
        score -= 2
        suggestions.append("Avoid repeated punctuation and keep descriptions professional.")

    word_count = get_word_count(text)

    if word_count < 250:
        score -= 3
    elif word_count > 1200:
        score -= 2
        suggestions.append("Resume may be too long for an entry-level profile. Keep it focused and concise.")

    return max(score, 0), suggestions


def calculate_ats_score(text: str, profile: dict) -> dict:
    formatting_score, formatting_suggestions = score_formatting(text)
    sections_score, sections_suggestions = score_required_sections(profile)
    keywords_score, keywords_suggestions = score_keywords(profile)
    skills_score, skills_suggestions = score_skill_clarity(profile)
    achievements_score, achievements_suggestions = score_achievement_quality(text)
    contact_score, contact_suggestions = score_contact_details(profile)
    grammar_score, grammar_suggestions = score_grammar_consistency(text)

    breakdown = {
        "formatting": formatting_score,
        "sections": sections_score,
        "keywords": keywords_score,
        "skills": skills_score,
        "achievements": achievements_score,
        "contact": contact_score,
        "grammar": grammar_score,
    }

    total_score = sum(breakdown.values())

    suggestions = (
        formatting_suggestions
        + sections_suggestions
        + keywords_suggestions
        + skills_suggestions
        + achievements_suggestions
        + contact_suggestions
        + grammar_suggestions
    )

    unique_suggestions = list(dict.fromkeys(suggestions))

    return {
        "atsScore": min(total_score, 100),
        "atsBreakdown": breakdown,
        "suggestions": unique_suggestions[:8],
    }