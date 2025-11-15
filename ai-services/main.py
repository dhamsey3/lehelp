from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="LEHELP AI Services",
    description="AI-powered services for case triage, matching, and document analysis",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class CaseTriageRequest(BaseModel):
    title: str
    description: str
    location: dict
    additional_info: Optional[dict] = None


class CaseTriageResponse(BaseModel):
    case_type: str
    urgency: str
    jurisdiction: str
    confidence: float
    recommended_expertise: List[str]
    estimated_complexity: str


class LawyerMatchRequest(BaseModel):
    case_id: str
    case_type: str
    urgency: str
    location: dict
    required_expertise: List[str]
    language: str


class LawyerMatch(BaseModel):
    lawyer_id: str
    match_score: float
    expertise_match: float
    availability_score: float
    location_proximity: float
    language_compatibility: bool
    estimated_response_time: str


class DocumentAnalysisRequest(BaseModel):
    document_id: str
    document_type: str
    language: str
    content: Optional[str] = None  # Encrypted or reference


class DocumentAnalysisResponse(BaseModel):
    document_id: str
    extracted_entities: dict
    key_dates: List[dict]
    summary: str
    relevance_score: float
    document_category: str
    language_detected: str


# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-services",
        "timestamp": datetime.utcnow().isoformat()
    }


# Case Triage Endpoint
@app.post("/api/v1/triage", response_model=CaseTriageResponse)
async def triage_case(request: CaseTriageRequest):
    """
    Analyze case details and classify case type, urgency, and requirements
    """
    try:
        logger.info(f"Triaging case: {request.title}")
        
        text = f"{request.title} {request.description}".lower()
        
        # Case type classification using keyword matching
        case_types = {
            "asylum": ["asylum", "refugee", "persecution", "flee", "fled", "escape", "sanctuary"],
            "torture": ["torture", "tortured", "cruel treatment", "inhuman", "degrading", "abuse", "beaten"],
            "arbitrary_detention": ["detention", "detained", "imprisoned", "custody", "arrest", "jail", "locked"],
            "disappearance": ["disappear", "missing", "vanish", "abduct", "kidnap", "whereabouts unknown"],
            "discrimination": ["discriminat", "racism", "sexism", "bias", "prejudice", "inequality"],
            "freedom_expression": ["censor", "speech", "expression", "journalist", "press", "media", "publish"],
        }
        
        case_scores = {}
        for case_type, keywords in case_types.items():
            score = sum(1 for keyword in keywords if keyword in text)
            if score > 0:
                case_scores[case_type] = score
        
        # Default to 'other' if no match
        detected_case_type = max(case_scores.items(), key=lambda x: x[1])[0] if case_scores else "other"
        confidence = min(0.95, 0.6 + (max(case_scores.values()) * 0.1)) if case_scores else 0.5
        
        # Urgency assessment
        urgency_keywords = {
            "critical": ["immediate danger", "life threatening", "imminent", "emergency", "critical", "dying"],
            "high": ["urgent", "soon", "quickly", "danger", "threat", "risk", "afraid"],
            "medium": ["concern", "worried", "uncertain", "help needed"],
            "low": ["advice", "question", "information", "guidance"]
        }
        
        urgency_score = "medium"  # default
        for level, keywords in urgency_keywords.items():
            if any(keyword in text for keyword in keywords):
                urgency_score = level
                break
        
        # Expertise recommendation based on case type
        expertise_map = {
            "asylum": ["immigration_law", "refugee_law", "human_rights"],
            "torture": ["human_rights", "criminal_law", "international_law"],
            "arbitrary_detention": ["criminal_law", "human_rights", "habeas_corpus"],
            "disappearance": ["human_rights", "criminal_law", "family_law"],
            "discrimination": ["civil_rights", "employment_law", "human_rights"],
            "freedom_expression": ["constitutional_law", "media_law", "human_rights"],
            "other": ["general_practice", "human_rights"]
        }
        
        recommended_expertise = expertise_map.get(detected_case_type, ["general_practice"])
        
        # Complexity estimation
        complexity_score = len(text.split())
        if complexity_score > 500:
            complexity = "high"
        elif complexity_score > 200:
            complexity = "medium"
        else:
            complexity = "low"
        
        response = CaseTriageResponse(
            case_type=detected_case_type,
            urgency=urgency_score,
            jurisdiction=request.location.get("country", "unknown"),
            confidence=round(confidence, 2),
            recommended_expertise=recommended_expertise,
            estimated_complexity=complexity
        )
        
        logger.info(f"Triage complete: {detected_case_type} ({urgency_score})")
        return response
        
    except Exception as e:
        logger.error(f"Error in case triage: {str(e)}")
        raise HTTPException(status_code=500, detail="Triage processing failed")


# Lawyer Matching Endpoint
@app.post("/api/v1/match", response_model=List[LawyerMatch])
async def match_lawyers(request: LawyerMatchRequest):
    """
    Match case with suitable lawyers based on expertise, location, and availability
    """
    try:
        logger.info(f"Matching lawyers for case: {request.case_id}")
        
        # In production, this would query the database
        # For now, generate realistic matches based on requirements
        
        import random
        random.seed(hash(request.case_id))  # Deterministic for testing
        
        # Simulate lawyer pool (in production, query from database)
        num_candidates = random.randint(3, 8)
        matches = []
        
        for i in range(num_candidates):
            # Calculate expertise match
            # Higher match if required expertise aligns
            expertise_match = random.uniform(0.7, 1.0) if i < 3 else random.uniform(0.5, 0.8)
            
            # Availability score (inverse of current caseload)
            # Prioritize lawyers with lighter loads
            availability_score = random.uniform(0.6, 1.0)
            
            # Location proximity (same country = higher score)
            # In production, calculate actual distance
            location_proximity = random.uniform(0.8, 1.0) if i < 2 else random.uniform(0.5, 0.9)
            
            # Language compatibility check
            # In production, check lawyer's languages against case language
            language_compatibility = random.choice([True, True, True, False])  # 75% match
            
            # Overall match score (weighted average)
            weights = {
                "expertise": 0.40,
                "availability": 0.30,
                "location": 0.20,
                "language": 0.10
            }
            
            match_score = (
                expertise_match * weights["expertise"] +
                availability_score * weights["availability"] +
                location_proximity * weights["location"] +
                (1.0 if language_compatibility else 0.5) * weights["language"]
            )
            
            # Estimate response time based on urgency and availability
            if request.urgency == "critical":
                response_times = ["30 minutes", "1 hour", "2 hours"]
            elif request.urgency == "high":
                response_times = ["2 hours", "4 hours", "6 hours"]
            else:
                response_times = ["12 hours", "24 hours", "48 hours"]
            
            response_time = random.choice(response_times)
            
            match = LawyerMatch(
                lawyer_id=f"lawyer_{i+1:03d}",
                match_score=round(match_score, 2),
                expertise_match=round(expertise_match, 2),
                availability_score=round(availability_score, 2),
                location_proximity=round(location_proximity, 2),
                language_compatibility=language_compatibility,
                estimated_response_time=response_time
            )
            
            matches.append(match)
        
        # Sort by match score (descending)
        matches.sort(key=lambda x: x.match_score, reverse=True)
        
        # Return top 5 matches
        top_matches = matches[:5]
        
        logger.info(f"Found {len(top_matches)} lawyer matches")
        return top_matches
        
    except Exception as e:
        logger.error(f"Error in lawyer matching: {str(e)}")
        raise HTTPException(status_code=500, detail="Matching failed")


# Document Analysis Endpoint
@app.post("/api/v1/analyze-document", response_model=DocumentAnalysisResponse)
async def analyze_document(request: DocumentAnalysisRequest):
    """
    Extract information from documents using NLP
    """
    try:
        logger.info(f"Analyzing document: {request.document_id}")
        
        import re
        from datetime import datetime
        
        content = request.content or ""
        
        # Extract named entities using simple pattern matching
        # In production, use spaCy or similar NLP library
        
        # Extract potential person names (capitalized words)
        person_pattern = r'\b([A-Z][a-z]+ [A-Z][a-z]+)\b'
        persons = list(set(re.findall(person_pattern, content)))[:10]
        
        # Extract organizations (words with "Department", "Ministry", "Organization", etc.)
        org_keywords = ['Department', 'Ministry', 'Organization', 'Agency', 'Bureau', 'Office', 'Court']
        organizations = []
        for keyword in org_keywords:
            orgs = re.findall(rf'{keyword} of [A-Z][a-z]+(?:\s+[A-Z][a-z]+)*', content)
            organizations.extend(orgs)
        organizations = list(set(organizations))[:10]
        
        # Extract locations (country names, cities)
        # In production, use NER model
        location_pattern = r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?(?:,\s*[A-Z]{2,3})?)\b'
        locations = list(set(re.findall(location_pattern, content)))[:10]
        
        # Extract dates (various formats)
        date_patterns = [
            r'\b\d{4}-\d{2}-\d{2}\b',  # YYYY-MM-DD
            r'\b\d{2}/\d{2}/\d{4}\b',  # MM/DD/YYYY
            r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b',  # Month DD, YYYY
        ]
        
        dates = []
        for pattern in date_patterns:
            found_dates = re.findall(pattern, content, re.IGNORECASE)
            dates.extend(found_dates)
        dates = list(set(dates))[:10]
        
        # Generate key dates with context
        key_dates = []
        for date in dates[:5]:
            # Find sentence containing the date for context
            sentences = content.split('.')
            for sentence in sentences:
                if date in sentence:
                    event = sentence.strip()[:100]  # First 100 chars
                    key_dates.append({"date": date, "event": event})
                    break
        
        # Generate summary (first 200 characters for now)
        # In production, use extractive or abstractive summarization
        summary = content[:200] + "..." if len(content) > 200 else content
        
        # Classify document type based on keywords
        doc_categories = {
            "legal_statement": ["statement", "affidavit", "declaration", "testimony"],
            "evidence": ["evidence", "proof", "documentation", "witness"],
            "court_document": ["court", "judgment", "order", "decree", "ruling"],
            "identity_document": ["passport", "id", "certificate", "birth", "marriage"],
            "correspondence": ["letter", "email", "communication", "memo"],
        }
        
        detected_category = "other"
        for category, keywords in doc_categories.items():
            if any(keyword in content.lower() for keyword in keywords):
                detected_category = category
                break
        
        # Calculate relevance score based on content length and keyword density
        relevance_keywords = ["human rights", "violation", "abuse", "persecution", "asylum", "torture"]
        keyword_count = sum(1 for keyword in relevance_keywords if keyword in content.lower())
        relevance_score = min(0.95, 0.5 + (keyword_count * 0.1) + (len(content.split()) / 1000 * 0.2))
        
        response = DocumentAnalysisResponse(
            document_id=request.document_id,
            extracted_entities={
                "persons": persons,
                "organizations": organizations,
                "locations": locations,
                "dates": dates
            },
            key_dates=key_dates,
            summary=summary,
            relevance_score=round(relevance_score, 2),
            document_category=detected_category,
            language_detected=request.language
        )
        
        logger.info(f"Document analysis complete: {detected_category}")
        return response
        
    except Exception as e:
        logger.error(f"Error in document analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Document analysis failed")


# Pattern Recognition Endpoint
@app.post("/api/v1/detect-patterns")
async def detect_patterns(cases: List[dict]):
    """
    Identify patterns across multiple cases for systemic issue detection
    """
    try:
        logger.info(f"Analyzing patterns across {len(cases)} cases")
        
        # TODO: Implement pattern detection
        # - Cluster similar cases
        # - Identify common perpetrators/institutions
        # - Detect geographic patterns
        # - Find temporal correlations
        
        return {
            "status": "success",
            "patterns_detected": [],
            "message": "Pattern detection will be implemented"
        }
        
    except Exception as e:
        logger.error(f"Error in pattern detection: {str(e)}")
        raise HTTPException(status_code=500, detail="Pattern detection failed")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
