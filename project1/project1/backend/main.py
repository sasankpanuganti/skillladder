
from fastapi import FastAPI, Depends, HTTPException, status, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import hashlib
import json
import bcrypt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import uvicorn

# Import routers
from routers import auth, jobs
from firebase_service import firebase_service
from services.resume_parser import resume_parser

# Load environment variables
try:
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
except:
    pass  # .env file doesn't exist, use defaults

# File paths
USERS_FILE = os.path.join(os.path.dirname(__file__), "users.json")

# Security
SECRET_KEY = os.getenv("SUPABASE_JWT_SECRET", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Password hashing - using bcrypt directly (already imported at top)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Initialize FastAPI
app = FastAPI(title="Job Portal API", version="1.0.0", redirect_slashes=False)

# Include routers
app.include_router(auth.router)
app.include_router(jobs.router)

# Security utils
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a bcrypt hash"""
    try:
        # Handle string hashes (from database) vs bytes
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    # Ensure password is not longer than 72 bytes (bcrypt limit)
    password_bytes = password[:72].encode('utf-8') if len(password) > 72 else password.encode('utf-8')
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    # Here you would typically fetch the user from your database
    # For now, we'll return a mock user
    return {"email": email, "id": "user123", "user_type": "job_seeker"}

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# For backward compatibility with existing code
supabase = None  # This will be initialized only if needed and available

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def load_users():
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r") as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)

@app.post("/register")
async def register(request: Request):
    data = await request.json()
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")
    
    if not all([email, password, role]):
        raise HTTPException(status_code=400, detail="Missing registration fields.")
    
    # Validate role
    if role not in ["job_seeker", "job_provider"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'job_seeker' or 'job_provider'.")
    
    # Check if user already exists in Firebase
    existing_user = await firebase_service.get_user_by_email(email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists.")
    
    # Create user object with additional fields for job seekers
    user_data = {
        "email": email, 
        "password_hash": get_password_hash(password),  # Use proper bcrypt hashing
        "user_type": role,  # Firebase uses user_type
        "role": role, 
        "history": []
    }
    
    # Add additional fields for job seekers
    if role == "job_seeker":
        name = data.get("name")
        phone = data.get("phone")
        graduation_year = data.get("graduationYear")
        study_year = data.get("studyYear")
        degree_type = data.get("degreeType")
        college_name = data.get("collegeName")

        if not all([name, phone, graduation_year, study_year, degree_type, college_name]):
            raise HTTPException(status_code=400, detail="Missing required fields for job seeker registration.")

        user_data.update({
            "full_name": name,
            "phone": phone,
            "graduation_year": graduation_year,
            "study_year": study_year,
            "degree_type": degree_type,
            "college_name": college_name
        })
    
    # Save to Firebase
    try:
        created_user = await firebase_service.create_user(user_data)
        print(f"✅ User registered successfully in Firebase: {email}")
        return {"status": "registered", "email": email, "role": role, "user_id": created_user.get("id")}
    except Exception as e:
        print(f"❌ Error registering user: {e}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/login")
async def login(request: Request):
    data = await request.json()
    email = data.get("email")
    password = data.get("password")
    if not all([email, password]):
        raise HTTPException(status_code=400, detail="Missing login fields.")
    
    # Get user from Firebase
    user = await firebase_service.get_user_by_email(email, include_password=True)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    
    # Verify password
    if not verify_password(password, user["password_hash"]):
        print(f"❌ Password verification failed for: {email}")
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    
    print(f"✅ User logged in successfully: {email}")
    
    # Get role from user_type or role field
    role = user.get("role") or user.get("user_type", "job_seeker")
    
    return {
        "status": "success", 
        "email": user["email"], 
        "role": role, 
        "user_id": user.get("id"),
        "name": user.get("full_name", user.get("name", "")),
        "user_type": user.get("user_type", role)
    }

@app.post("/save_history")
async def save_history(request: Request):
    data = await request.json()
    email = data.get("email")
    entry = data.get("entry")
    if not email or not entry:
        raise HTTPException(status_code=400, detail="Missing email or entry.")
    users = load_users()
    for u in users:
        if u["email"] == email:
            if "history" not in u:
                u["history"] = []
            u["history"].append(entry)
            save_users(users)
            return {"status": "saved"}
    raise HTTPException(status_code=404, detail="User not found.")

@app.get("/get_history")
async def get_history(email: str):
    users = load_users()
    user = next((u for u in users if u["email"] == email), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"history": user.get("history", [])}

@app.get("/admin/all_users")
async def admin_all_users():
    users = load_users()
    return [{"email": u["email"], "role": u["role"], "history": u.get("history", [])} for u in users]

# Interview scheduling (simple demo)
INTERVIEWS_FILE = os.path.join(os.path.dirname(__file__), "interviews.json")

def load_interviews():
    if not os.path.exists(INTERVIEWS_FILE):
        return []
    with open(INTERVIEWS_FILE, "r") as f:
        return json.load(f)

def save_interviews(interviews):
    with open(INTERVIEWS_FILE, "w") as f:
        json.dump(interviews, f, indent=2)

@app.post("/admin/schedule_interview")
async def schedule_interview(request: Request):
    data = await request.json()
    # expects: { email, round, date, notes }
    interviews = load_interviews()
    interviews.append(data)
    save_interviews(interviews)
    return {"status": "scheduled"}

@app.get("/admin/get_interviews")
async def get_interviews(email: str = None):
    interviews = load_interviews()
    if email:
        interviews = [i for i in interviews if i.get("email") == email]
    return {"interviews": interviews}


# Placeholder for resume upload
import io
from fastapi import HTTPException
from PyPDF2 import PdfReader
import re

@app.post("/upload_resume")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.pdf', '.docx', '.doc')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")
    
    try:
        contents = await file.read()
        
        # Use the advanced NLP ResumeParser
        analysis_result = resume_parser.parse_resume(contents, file.filename)
        
        if "error" in analysis_result:
            raise HTTPException(status_code=500, detail=analysis_result["error"])
            
        return analysis_result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Resume processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Placeholder for ATS scoring
@app.post("/ats_score")
async def ats_score():
    # TODO: Implement ATS scoring logic
    return {"score": 85}

# Job recommendation endpoint
from fastapi import Query

JOBS_DB = [
    {"id": 1, "title": "Python Developer", "skills": ["python", "django", "flask", "sql"], "company": "TechNova", "location": "Bangalore", "salary": "8-15 LPA", "description": "Full-stack Python developer with Django/Flask experience", "rounds": "3", "website": "https://technova.com", "type": "Full-time", "posted_by": "techcorp@gmail.com", "posted_date": "2024-01-01", "status": "active"},
    {"id": 2, "title": "Frontend Engineer", "skills": ["react", "javascript", "css", "html", "typescript"], "company": "WebWorks", "location": "Mumbai", "salary": "6-12 LPA", "description": "React developer for modern web applications", "rounds": "2", "website": "https://webworks.com", "type": "Full-time", "posted_by": "webworks@gmail.com", "posted_date": "2024-01-01", "status": "active"},
    {"id": 3, "title": "Data Analyst", "skills": ["excel", "sql", "data analysis", "powerbi", "python"], "company": "InsightX", "location": "Delhi", "salary": "5-10 LPA", "description": "Data analysis and visualization specialist", "rounds": "2", "website": "https://insightx.com", "type": "Full-time", "posted_by": "insightx@gmail.com", "posted_date": "2024-01-01", "status": "active"},
    {"id": 4, "title": "Machine Learning Engineer", "skills": ["python", "machine learning", "tensorflow", "pytorch", "sql"], "company": "AI Labs", "location": "Hyderabad", "salary": "12-20 LPA", "description": "ML engineer for AI-powered applications", "rounds": "4", "website": "https://ailabs.com", "type": "Full-time", "posted_by": "ailabs@gmail.com", "posted_date": "2024-01-01", "status": "active"},
    {"id": 5, "title": "DevOps Engineer", "skills": ["aws", "docker", "kubernetes", "git", "jenkins"], "company": "CloudOps", "location": "Pune", "salary": "10-18 LPA", "description": "DevOps engineer for cloud infrastructure", "rounds": "3", "website": "https://cloudops.com", "type": "Full-time", "posted_by": "cloudops@gmail.com", "posted_date": "2024-01-01", "status": "active"},
    {"id": 6, "title": "Java Developer", "skills": ["java", "spring", "hibernate", "sql", "maven"], "company": "JavaCorp", "location": "Chennai", "salary": "7-14 LPA", "description": "Java developer with Spring framework experience", "rounds": "3", "website": "https://javacorp.com", "type": "Full-time", "posted_by": "javacorp@gmail.com", "posted_date": "2024-01-01", "status": "active"},
    {"id": 7, "title": "React Native Developer", "skills": ["react", "javascript", "react native", "mobile development"], "company": "MobileTech", "location": "Remote", "salary": "8-16 LPA", "description": "Mobile app developer using React Native", "rounds": "2", "website": "https://mobiletech.com", "type": "Full-time", "posted_by": "mobiletech@gmail.com", "posted_date": "2024-01-01", "status": "active"},
    {"id": 8, "title": "Full Stack Developer", "skills": ["javascript", "react", "node.js", "mongodb", "express"], "company": "FullStack Inc", "location": "Bangalore", "salary": "9-17 LPA", "description": "Full-stack developer for web applications", "rounds": "3", "website": "https://fullstack.com", "type": "Full-time", "posted_by": "fullstack@gmail.com", "posted_date": "2024-01-01", "status": "active"},
    {"id": 9, "title": "Data Scientist", "skills": ["python", "machine learning", "statistics", "sql", "pandas"], "company": "DataCorp", "location": "Mumbai", "salary": "11-19 LPA", "description": "Data scientist for business intelligence", "rounds": "4", "website": "https://datacorp.com", "type": "Full-time", "posted_by": "datacorp@gmail.com", "posted_date": "2024-01-01", "status": "active"},
    {"id": 10, "title": "UI/UX Designer", "skills": ["figma", "adobe", "photoshop", "illustrator", "design"], "company": "DesignHub", "location": "Delhi", "salary": "6-12 LPA", "description": "Creative designer for digital products", "rounds": "2", "website": "https://designhub.com", "type": "Full-time", "posted_by": "designhub@gmail.com", "posted_date": "2024-01-01", "status": "active"},
    {"id": 11, "title": "Python Intern", "skills": ["python", "basic programming"], "company": "TechStart", "location": "Remote", "salary": "2-4 LPA", "description": "Internship for Python programming", "rounds": "1", "website": "https://techstart.com", "type": "Internship", "posted_by": "techstart@gmail.com", "posted_date": "2024-01-01", "status": "active"},
    {"id": 12, "title": "Web Development Intern", "skills": ["html", "css", "javascript", "basic programming"], "company": "WebStart", "location": "Hyderabad", "salary": "2-5 LPA", "description": "Internship for web development", "rounds": "1", "website": "https://webstart.com", "type": "Internship", "posted_by": "webstart@gmail.com", "posted_date": "2024-01-01", "status": "active"},
    {"id": 13, "title": "Data Analysis Intern", "skills": ["excel", "basic statistics", "data entry"], "company": "DataStart", "location": "Pune", "salary": "2-4 LPA", "description": "Internship for data analysis", "rounds": "1", "website": "https://datastart.com", "type": "Internship", "posted_by": "datastart@gmail.com", "posted_date": "2024-01-01", "status": "active"},
    {"id": 14, "title": "React Intern", "skills": ["javascript", "html", "css", "basic react"], "company": "ReactStart", "location": "Chennai", "salary": "2-5 LPA", "description": "Internship for React development", "rounds": "1", "website": "https://reactstart.com", "type": "Internship", "posted_by": "reactstart@gmail.com", "posted_date": "2024-01-01", "status": "active"},
    {"id": 15, "title": "Java Intern", "skills": ["java", "basic programming", "oop"], "company": "JavaStart", "location": "Bangalore", "salary": "2-4 LPA", "description": "Internship for Java development", "rounds": "1", "website": "https://javastart.com", "type": "Internship", "posted_by": "javastart@gmail.com", "posted_date": "2024-01-01", "status": "active"}
]

@app.post("/recommend_jobs")
async def recommend_jobs(request: Request):
    data = await request.json()
    skills = data.get("skills", [])
    
    if not skills:
        # If no skills provided, return all jobs
        return {"jobs": JOBS_DB}
    
    # Score jobs by number of matching skills and skill relevance
    scored_jobs = []
    for job in JOBS_DB:
        match_count = len([s for s in job["skills"] if s.lower() in [skill.lower() for skill in skills]])
        # Bonus points for exact skill matches
        exact_matches = len([s for s in job["skills"] if s.lower() in [skill.lower() for skill in skills]])
        score = match_count * 2 + exact_matches
        
        scored_jobs.append((score, job))
    
    # Sort by score descending, then by job title
    scored_jobs.sort(key=lambda x: (-x[0], x[1]["title"]))
    
    # Return top 10 most relevant jobs
    recommended_jobs = [job for _, job in scored_jobs[:10]]
    
    return {
        "jobs": recommended_jobs,
        "total_matches": len(scored_jobs),
        "skills_analyzed": skills
    }

@app.get("/get_all_jobs")
async def get_all_jobs():
    return {"jobs": JOBS_DB}

# Store job applications
JOB_APPLICATIONS = []

# Store mock test results
MOCK_TEST_RESULTS = []

@app.post("/apply_job")
async def apply_job(request: Request):
    try:
        data = await request.json()
        job_id = data.get("job_id")
        user_email = data.get("user_email")
        
        if not job_id or not user_email:
            raise HTTPException(status_code=400, detail="Missing job_id or user_email")
        
        # Check if job exists in Firebase
        jobs = await firebase_service.get_jobs({"id": job_id})
        if not jobs:
            # Fallback to local JOBS_DB
            job = next((j for j in JOBS_DB if j["id"] == job_id), None)
            if not job:
                raise HTTPException(status_code=404, detail="Job not found")
        else:
            job = jobs[0]
        
        # Check if user already applied
        existing_applications = await firebase_service.get_applications(job_id=job_id, user_email=user_email)
        if existing_applications:
            raise HTTPException(status_code=400, detail="User already applied for this job")
        
        # Create application
        application_data = {
            "job_id": job_id,
            "user_email": user_email,
            "job_title": job["title"],
            "company": job["company"],
            "applied_at": datetime.utcnow().isoformat(),
            "status": "applied"
        }
        
        # Save to Firebase
        created_application = await firebase_service.create_application(application_data)
        
        return {
            "status": "success",
            "message": f"Successfully applied for {job['title']} at {job['company']}",
            "job_id": job_id,
            "application_id": created_application.get("id"),
            "applied_at": created_application.get("applied_at")
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in apply_job: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/get_job_applications")
async def get_job_applications(job_id: int = None, user_email: str = None):
    if job_id:
        applications = [app for app in JOB_APPLICATIONS if app["job_id"] == job_id]
    elif user_email:
        applications = [app for app in JOB_APPLICATIONS if app["user_email"] == user_email]
    else:
        applications = JOB_APPLICATIONS
    
    return {"applications": applications}

# Job Provider Endpoints
@app.post("/post_job")
async def post_job(request: Request):
    try:
        data = await request.json()
        required_fields = ["title", "company", "location", "salary", "description", "skills", "posted_by"]
        
        for field in required_fields:
            if field not in data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Create new job
        new_job = {
            "id": len(JOBS_DB) + 1,
            "title": data["title"],
            "company": data["company"],
            "location": data["location"],
            "salary": data["salary"],
            "description": data["description"],
            "skills": data["skills"],
            "rounds": data.get("rounds", "3"),
            "website": data.get("website", ""),
            "type": data.get("type", "Full-time"),
            "posted_by": data["posted_by"],
            "posted_date": "2024-01-01",
            "status": "active"
        }
        
        JOBS_DB.append(new_job)
        
        return {
            "status": "success",
            "message": "Job posted successfully",
            "job_id": new_job["id"]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in post_job: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/delete_job/{job_id}")
async def delete_job(job_id: int, posted_by: str):
    try:
        # Find job
        job = next((j for j in JOBS_DB if j["id"] == job_id), None)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Check if user posted this job
        if job["posted_by"] != posted_by:
            raise HTTPException(status_code=403, detail="Not authorized to delete this job")
        
        # Remove job
        JOBS_DB.remove(job)
        
        # Remove related applications
        global JOB_APPLICATIONS
        JOB_APPLICATIONS = [app for app in JOB_APPLICATIONS if app["job_id"] != job_id]
        
        return {"status": "success", "message": "Job deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in delete_job: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/get_jobs_by_provider")
async def get_jobs_by_provider(posted_by: str):
    jobs = [job for job in JOBS_DB if job["posted_by"] == posted_by]
    return {"jobs": jobs}

# Mock Test Results
@app.post("/submit_mock_test")
async def submit_mock_test(request: Request):
    try:
        data = await request.json()
        required_fields = ["user_email", "score", "total_questions", "subject"]
        
        for field in required_fields:
            if field not in data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        result_data = {
            "user_email": data["user_email"],
            "score": data["score"],
            "total_questions": data["total_questions"],
            "percentage": round((data["score"] / data["total_questions"]) * 100, 2),
            "subject": data["subject"]
        }
        
        # Save to Firebase
        created_result = await firebase_service.save_mock_test_result(result_data)
        
        print(f"✅ Mock test result saved to Firebase: {data['user_email']}")
        return {
            "status": "success",
            "message": "Mock test result submitted successfully",
            "result_id": created_result.get("id")
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in submit_mock_test: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/get_mock_test_results")
async def get_mock_test_results(user_email: str = None):
    if user_email:
        results = [result for result in MOCK_TEST_RESULTS if result["user_email"] == user_email]
    else:
        results = MOCK_TEST_RESULTS
    
    return {"results": results}

# Analytics for Job Providers
@app.get("/get_provider_analytics")
async def get_provider_analytics(posted_by: str):
    try:
        # Get jobs posted by this provider
        provider_jobs = [job for job in JOBS_DB if job["posted_by"] == posted_by]
        
        # Get applications for these jobs
        job_ids = [job["id"] for job in provider_jobs]
        applications = [app for app in JOB_APPLICATIONS if app["job_id"] in job_ids]
        
        # Get mock test results for applicants
        applicant_emails = list(set([app["user_email"] for app in applications]))
        mock_results = [result for result in MOCK_TEST_RESULTS if result["user_email"] in applicant_emails]
        
        # Calculate analytics
        total_jobs = len(provider_jobs)
        total_applications = len(applications)
        total_applicants = len(applicant_emails)
        total_mock_tests = len(mock_results)
        
        # Average mock test score
        avg_score = 0
        if mock_results:
            avg_score = sum(result["percentage"] for result in mock_results) / len(mock_results)
        
        # Job-wise application count
        job_applications = {}
        for job in provider_jobs:
            job_applications[job["title"]] = len([app for app in applications if app["job_id"] == job["id"]])
        
        # Skills distribution
        all_skills = []
        for job in provider_jobs:
            all_skills.extend(job["skills"])
        
        skill_counts = {}
        for skill in all_skills:
            skill_counts[skill] = skill_counts.get(skill, 0) + 1
        
        return {
            "total_jobs": total_jobs,
            "total_applications": total_applications,
            "total_applicants": total_applicants,
            "total_mock_tests": total_mock_tests,
            "average_mock_score": round(avg_score, 2),
            "job_applications": job_applications,
            "skill_distribution": skill_counts,
            "recent_applications": applications[-10:] if applications else [],
            "recent_mock_results": mock_results[-10:] if mock_results else []
        }
    except Exception as e:
        print(f"Error in get_provider_analytics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Placeholder for feedback
@app.post("/feedback")
async def feedback(feedback: str = Form(...)):
    # TODO: Save feedback
    return {"status": "received"}

# Placeholder for chatbot
@app.post("/chatbot/")
async def chatbot(query: str = Form(...)):
    # TODO: Integrate AI chatbot
    return {"response": "This is a placeholder response."}

# JSON endpoint for chatbot (for frontend)
from fastapi import Body

@app.post("/chatbot")
async def chatbot_json(request: Request):
    data = await request.json()
    question = data.get("question")
    if not question:
        raise HTTPException(status_code=400, detail="Missing 'question' in request body.")
    # TODO: Integrate chatbot logic here
    return {"answer": f"You asked: {question}. This is a placeholder answer."}

# Test endpoint to verify Firebase connection
@app.get("/test-firebase")
async def test_firebase():
    try:
        # Test creating a sample user
        test_user_data = {
            "email": "test@firebase.com",
            "password_hash": hash_password("test123"),
            "role": "job_seeker",
            "user_type": "job_seeker",
            "full_name": "Test User",
            "phone": "1234567890"
        }
        
        # Try to create user
        created_user = await firebase_service.create_user(test_user_data)
        
        return {
            "status": "success",
            "message": "Firebase connection working!",
            "test_user_id": created_user.get("id"),
            "firebase_status": "connected"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Firebase connection failed: {str(e)}",
            "firebase_status": "disconnected"
        }

@app.post("/test-data")
async def create_test_data():
    try:
        if supabase is None:
            return {
                "status": "warning",
                "message": "Supabase not configured. Cannot create test data.",
                "user_id": None,
                "job_id": None
            }
        
        # Test user data
        user_data = {
            "email": "test@example.com",
            "password_hash": hash_password("testpassword123"),
            "user_type": "job_seeker",
            "full_name": "Test User"
        }
        
        # Insert user
        user = supabase.table('users').insert(user_data).execute()
        user_id = user.data[0]['id'] if user.data else None
        
        if not user_id:
            return {"status": "error", "message": "Failed to create test user"}
        
        # Test job data
        job_data = {
            "title": "Software Developer",
            "description": "Looking for a skilled software developer...",
            "company": "Tech Corp",
            "location": "Remote",
            "salary_range": "$80,000 - $120,000",
            "job_type": "Full-time",
            "skills": ["Python", "JavaScript", "React"],
            "posted_by": user_id,
            "status": "active"
        }
        
        # Insert job
        job = supabase.table('jobs').insert(job_data).execute()
        job_id = job.data[0]['id'] if job.data else None
        
        return {
            "status": "success",
            "message": "Test data created successfully",
            "user_id": user_id,
            "job_id": job_id
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
