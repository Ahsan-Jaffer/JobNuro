import re


def clean_text(text: str) -> str:
    if not text:
        return ""

    text = text.replace("\x00", " ")
    text = re.sub(r"\r\n|\r", "\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def normalize_for_matching(text: str) -> str:
    if not text:
        return ""

    text = text.lower()
    text = re.sub(r"[^a-z0-9+#.\s-]", " ", text)
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def get_word_count(text: str) -> int:
    if not text:
        return 0

    words = re.findall(r"\b\w+\b", text)
    return len(words)