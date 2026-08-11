import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

PROMPT_TEMPLATE = """
You are an ATS (Applicant Tracking System) resume screening assistant.
Compare the RESUME to the JOB DESCRIPTION and score how well it would pass an ATS filter.

Return ONLY valid JSON (no markdown fences, no extra commentary) in exactly this shape:
{{
  "ats_score": <integer 0-100>,
  "matched_skills": [<list of strings found in both resume and job description>],
  "missing_skills": [<list of strings required by the job but missing from the resume>],
  "suggestions": [<list of short, actionable betterment suggestions to improve the resume>]
}}

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}
"""


def analyze_resume(resume_text: str, job_description: str) -> dict:
    """Sends the resume + job description to Gemini and returns a parsed dict."""
    model = genai.GenerativeModel("gemini-3.5-flash")
    prompt = PROMPT_TEMPLATE.format(
        resume_text=resume_text[:6000],
        job_description=job_description[:3000],
    )

    response = model.generate_content(prompt)
    raw = response.text.strip()

    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.startswith("json"):
            raw = raw[4:]

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        data = {
            "ats_score": 0,
            "matched_skills": [],
            "missing_skills": [],
            "suggestions": ["Could not parse the AI response. Please try again."],
        }

    return data
