import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.core.config import settings
from app.utils.file_reader import (
    validate_resume_file,
    save_upload_file,
    extract_text_from_resume,
)
from app.utils.text_cleaner import clean_text, get_word_count
from app.services.resume_parser import parse_resume_profile
from app.services.ats_scorer import calculate_ats_score

router = APIRouter(prefix="/api/resume", tags=["Resume Analysis"])


@router.post("/analyze")
async def analyze_resume(resume: UploadFile = File(...)):
    file_type = validate_resume_file(resume, settings.max_file_size_mb)

    os.makedirs("temp_uploads", exist_ok=True)

    file_extension = "pdf" if file_type == "pdf" else "docx"
    temp_file_name = f"{uuid.uuid4()}.{file_extension}"
    temp_file_path = os.path.join("temp_uploads", temp_file_name)

    try:
        await save_upload_file(
            file=resume,
            destination_path=temp_file_path,
            max_size_mb=settings.max_file_size_mb,
        )

        extracted_text = extract_text_from_resume(temp_file_path, file_type)
        cleaned_text = clean_text(extracted_text)

        if len(cleaned_text) < 50:
            raise HTTPException(
                status_code=422,
                detail="Resume text could not be extracted properly. Please upload a text-based PDF or DOCX file.",
            )

        parsed_profile = parse_resume_profile(cleaned_text)
        ats_result = calculate_ats_score(cleaned_text, parsed_profile)

        return {
            "success": True,
            "message": "Resume analyzed successfully",
            "data": {
                "rawText": cleaned_text,
                "parsedProfile": parsed_profile,
                "atsScore": ats_result["atsScore"],
                "atsBreakdown": ats_result["atsBreakdown"],
                "suggestions": ats_result["suggestions"],
                "analysisMeta": {
                    "fileType": file_type,
                    "wordCount": get_word_count(cleaned_text),
                    "skillsFound": len(parsed_profile.get("skills", [])),
                    "sectionsFound": parsed_profile.get("sectionsFound", []),
                },
            },
        }

    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)