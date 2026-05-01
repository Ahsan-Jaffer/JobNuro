import re
from app.services.skill_extractor import extract_skills


SECTION_KEYWORDS = {
    "summary": ["summary", "profile", "objective", "professional summary"],
    "education": ["education", "academic background", "qualification", "qualifications"],
    "experience": ["experience", "work experience", "employment", "internship", "internships"],
    "projects": ["projects", "academic projects", "personal projects", "portfolio"],
    "certifications": ["certifications", "certificates", "courses"],
    "skills": ["skills", "technical skills", "core skills", "technologies"],
}


def extract_email(text: str) -> str | None:
    match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    return match.group(0) if match else None


def extract_phone(text: str) -> str | None:
    patterns = [
        r"(\+92[\s-]?\d{3}[\s-]?\d{7})",
        r"(03\d{2}[\s-]?\d{7})",
        r"(\+?\d[\d\s().-]{9,}\d)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0).strip()

    return None


def extract_links(text: str) -> dict:
    urls = re.findall(r"https?://[^\s,]+|www\.[^\s,]+", text, flags=re.IGNORECASE)

    links = {
        "linkedin": None,
        "github": None,
        "portfolio": None,
        "others": [],
    }

    for url in urls:
        cleaned_url = url.rstrip(").,]}")
        lower_url = cleaned_url.lower()

        if "linkedin.com" in lower_url:
            links["linkedin"] = cleaned_url
        elif "github.com" in lower_url:
            links["github"] = cleaned_url
        else:
            links["others"].append(cleaned_url)

    if links["others"]:
        links["portfolio"] = links["others"][0]

    return links


def extract_name(text: str, email: str | None = None) -> str | None:
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    ignore_words = [
        "resume",
        "curriculum vitae",
        "cv",
        "email",
        "phone",
        "linkedin",
        "github",
    ]

    for line in lines[:8]:
        lower_line = line.lower()

        if any(word in lower_line for word in ignore_words):
            continue

        if email and email.lower() in lower_line:
            continue

        if len(line.split()) <= 5 and re.match(r"^[A-Za-z .'-]+$", line):
            return line

    return None


def find_sections_present(text: str) -> list[str]:
    lower_text = text.lower()
    found_sections = []

    for section, keywords in SECTION_KEYWORDS.items():
        for keyword in keywords:
            pattern = r"(^|\n)\s*" + re.escape(keyword) + r"\s*(:|\n|$)"
            if re.search(pattern, lower_text):
                found_sections.append(section)
                break

    return sorted(set(found_sections))


def extract_section_lines(text: str, section_name: str, limit: int = 8) -> list[str]:
    keywords = SECTION_KEYWORDS.get(section_name, [])
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    start_index = None

    for index, line in enumerate(lines):
        lower_line = line.lower().rstrip(":")
        if lower_line in keywords:
            start_index = index + 1
            break

    if start_index is None:
        return []

    extracted = []

    all_section_headings = {
        keyword
        for keywords_list in SECTION_KEYWORDS.values()
        for keyword in keywords_list
    }

    for line in lines[start_index:]:
        lower_line = line.lower().rstrip(":")

        if lower_line in all_section_headings:
            break

        extracted.append(line)

        if len(extracted) >= limit:
            break

    return extracted


def parse_resume_profile(text: str) -> dict:
    email = extract_email(text)
    phone = extract_phone(text)
    links = extract_links(text)
    name = extract_name(text, email)
    skill_result = extract_skills(text)
    sections_found = find_sections_present(text)

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "links": links,
        "skills": skill_result["skills"],
        "categorizedSkills": skill_result["categorizedSkills"],
        "education": extract_section_lines(text, "education"),
        "projects": extract_section_lines(text, "projects"),
        "experience": extract_section_lines(text, "experience"),
        "certifications": extract_section_lines(text, "certifications"),
        "sectionsFound": sections_found,
    }