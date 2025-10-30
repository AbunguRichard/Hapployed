from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal
from datetime import datetime, timezone
import uuid
import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import re

router = APIRouter(prefix="/api/grow", tags=["Grow"])

# Helper function to convert MongoDB ObjectId to string
def convert_objectid(doc):
    """Recursively convert ObjectId to string in document"""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [convert_objectid(item) for item in doc]
    if isinstance(doc, dict):
        return {key: str(value) if isinstance(value, ObjectId) else convert_objectid(value) 
                for key, value in doc.items()}
    return doc

# MongoDB connection
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.get_database(os.getenv('DB_NAME', 'test_database'))

# Collections
courses_collection = db.courses
progress_collection = db.user_progress
assessments_collection = db.skill_assessments
mentorships_collection = db.mentorships
community_posts_collection = db.community_posts
users_collection = db.users

# ============================================================================
# MODELS
# ============================================================================

class Resource(BaseModel):
    title: str
    url: str
    type: str

class LessonContent(BaseModel):
    video_url: Optional[str] = None
    article_text: Optional[str] = None
    interactive_content: Optional[Dict] = None
    resources: List[Resource] = []

class Lesson(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    type: Literal["video", "article", "interactive", "quiz", "assignment"]
    duration: Optional[int] = None
    content: LessonContent = LessonContent()
    difficulty: Literal["beginner", "intermediate", "advanced"] = "beginner"
    points: int = 10
    is_premium: bool = False
    order: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CourseStats(BaseModel):
    enrolled: int = 0
    average_rating: float = 0.0
    completion_rate: float = 0.0
    total_points: int = 0

class CoursePrice(BaseModel):
    amount: float = 0.0
    currency: str = "USD"
    is_free: bool = True

class Course(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    category: str
    instructor_id: str
    thumbnail: Optional[str] = None
    price: CoursePrice = CoursePrice()
    level: Literal["beginner", "intermediate", "advanced", "all"] = "beginner"
    lessons: List[Lesson] = []
    stats: CourseStats = CourseStats()
    requirements: List[str] = []
    learning_outcomes: List[str] = []
    tags: List[str] = []
    is_published: bool = False
    is_featured: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CompletedLesson(BaseModel):
    lesson_id: str
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    score: Optional[float] = None
    time_spent: int = 0

class UserProgress(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    course_id: str
    completed_lessons: List[CompletedLesson] = []
    current_lesson_id: Optional[str] = None
    progress: float = 0.0
    total_points_earned: int = 0
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    last_activity: Optional[datetime] = None

class AssessmentQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int
    user_answer: Optional[int] = None
    time_spent: int = 0

class Badge(BaseModel):
    name: str
    icon: str
    level: str

class SkillAssessment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    skill: str
    category: Optional[str] = None
    level: Literal["beginner", "intermediate", "advanced", "expert"]
    score: float = 0.0
    max_score: float = 100.0
    questions: List[AssessmentQuestion] = []
    time_limit: int = 30
    time_spent: int = 0
    passed: bool = False
    badge: Optional[Badge] = None
    taken_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None

class MentorshipSchedule(BaseModel):
    frequency: str
    next_session: Optional[datetime] = None
    session_duration: int = 60

class MentorshipSession(BaseModel):
    date: datetime
    duration: int
    notes: Optional[str] = None
    rating: Optional[float] = None
    feedback: Optional[str] = None

class Mentorship(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    mentor_id: str
    mentee_id: str
    skill: str
    status: Literal["pending", "active", "completed", "cancelled"] = "pending"
    goals: List[str] = []
    schedule: Optional[MentorshipSchedule] = None
    sessions: List[MentorshipSession] = []
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Attachment(BaseModel):
    filename: str
    url: str
    type: str

class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    author_id: str
    content: str
    upvotes: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_expert_answer: bool = False

class CommunityPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    author_id: str
    title: Optional[str] = None
    content: str
    type: Literal["question", "discussion", "achievement", "resource", "news"] = "discussion"
    category: Optional[str] = None
    tags: List[str] = []
    attachments: List[Attachment] = []
    upvotes: List[str] = []
    downvotes: List[str] = []
    comments: List[Comment] = []
    is_pinned: bool = False
    is_expert_post: bool = False
    view_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Request/Response Models
class EnrollRequest(BaseModel):
    course_id: str

class CompleteLessonRequest(BaseModel):
    lesson_id: str
    score: Optional[float] = None
    time_spent: int = 0

class StartAssessmentRequest(BaseModel):
    skill: str
    category: Optional[str] = None

class SubmitAssessmentRequest(BaseModel):
    answers: List[int]
    time_spent: int

class CreatePostRequest(BaseModel):
    content: str
    type: Literal["question", "discussion", "achievement", "resource", "news"] = "discussion"
    category: Optional[str] = "general"
    title: Optional[str] = None

class AddCommentRequest(BaseModel):
    content: str

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def extract_tags(content: str) -> List[str]:
    """Extract tags from content using simple keyword matching"""
    common_tags = ['javascript', 'react', 'node', 'python', 'design', 'marketing', 
                   'django', 'vue', 'angular', 'css', 'html', 'sql']
    tags = []
    content_lower = content.lower()
    
    for tag in common_tags:
        if tag in content_lower:
            tags.append(tag)
    
    return tags[:5]

def generate_skill_badge(skill: str, score: float) -> Badge:
    """Generate badge based on skill and score"""
    if score >= 90:
        level = "expert"
        icon = "🏆"
    elif score >= 80:
        level = "advanced"
        icon = "🥇"
    elif score >= 70:
        level = "intermediate"
        icon = "🥈"
    else:
        level = "beginner"
        icon = "🥉"
    
    return Badge(
        name=f"{skill} {level.capitalize()}",
        icon=icon,
        level=level
    )

def generate_assessment_questions(skill: str, category: Optional[str], count: int = 10) -> List[AssessmentQuestion]:
    """Generate mock assessment questions"""
    questions = []
    for i in range(count):
        questions.append(AssessmentQuestion(
            question=f"What is the best practice for {skill} in scenario {i + 1}?",
            options=[
                "Option A - Basic approach",
                "Option B - Standard practice",
                "Option C - Advanced technique",
                "Option D - Experimental method"
            ],
            correct_answer=i % 4,
            time_spent=0
        ))
    return questions

# ============================================================================
# COURSE ROUTES
# ============================================================================

@router.get("/courses")
async def get_courses(
    category: Optional[str] = None,
    level: Optional[str] = None,
    is_free: Optional[bool] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100)
):
    """Get list of courses with filters"""
    try:
        query = {"is_published": True}
        
        if category:
            query["category"] = category
        
        if level and level != "all":
            query["level"] = level
        
        if is_free is not None:
            query["price.is_free"] = is_free
        
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"tags": {"$in": [re.compile(search, re.IGNORECASE)]}}
            ]
        
        total = await courses_collection.count_documents(query)
        courses = await courses_collection.find(query).sort("stats.enrolled", -1).skip((page - 1) * limit).limit(limit).to_list(None)
        
        return {
            "success": True,
            "data": {
                "courses": courses,
                "pagination": {
                    "current": page,
                    "pages": (total + limit - 1) // limit,
                    "total": total
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/courses/{course_id}/enroll")
async def enroll_in_course(course_id: str, user_id: str = Query(...)):
    """Enroll user in a course"""
    try:
        # Check if course exists
        course = await courses_collection.find_one({"id": course_id})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Check if already enrolled
        existing = await progress_collection.find_one({"user_id": user_id, "course_id": course_id})
        if existing:
            raise HTTPException(status_code=400, detail="Already enrolled in this course")
        
        # Create progress record
        progress = UserProgress(
            user_id=user_id,
            course_id=course_id,
            current_lesson_id=course.get("lessons", [])[0].get("id") if course.get("lessons") else None
        )
        
        await progress_collection.insert_one(progress.dict())
        
        # Update course stats
        await courses_collection.update_one(
            {"id": course_id},
            {"$inc": {"stats.enrolled": 1}}
        )
        
        return {
            "success": True,
            "message": "Successfully enrolled in course",
            "data": progress.dict()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/courses/{course_id}/complete-lesson")
async def complete_lesson(course_id: str, request: CompleteLessonRequest, user_id: str = Query(...)):
    """Mark a lesson as complete"""
    try:
        progress = await progress_collection.find_one({"user_id": user_id, "course_id": course_id})
        if not progress:
            raise HTTPException(status_code=404, detail="Not enrolled in this course")
        
        # Check if lesson already completed
        completed_lesson_ids = [cl.get("lesson_id") for cl in progress.get("completed_lessons", [])]
        
        if request.lesson_id not in completed_lesson_ids:
            # Get course to calculate progress
            course = await courses_collection.find_one({"id": course_id})
            
            completed_lesson = CompletedLesson(
                lesson_id=request.lesson_id,
                score=request.score,
                time_spent=request.time_spent
            )
            
            # Find lesson points
            lesson_points = 10  # default
            for lesson in course.get("lessons", []):
                if lesson.get("id") == request.lesson_id:
                    lesson_points = lesson.get("points", 10)
                    break
            
            # Update progress
            updated_completed = progress.get("completed_lessons", []) + [completed_lesson.dict()]
            new_progress = round((len(updated_completed) / len(course.get("lessons", [1]))) * 100)
            new_points = progress.get("total_points_earned", 0) + lesson_points
            
            update_data = {
                "completed_lessons": updated_completed,
                "progress": new_progress,
                "total_points_earned": new_points,
                "last_activity": datetime.now(timezone.utc)
            }
            
            if new_progress >= 100:
                update_data["completed_at"] = datetime.now(timezone.utc)
            
            await progress_collection.update_one(
                {"user_id": user_id, "course_id": course_id},
                {"$set": update_data}
            )
            
            # Fetch updated progress
            progress = await progress_collection.find_one({"user_id": user_id, "course_id": course_id})
        
        return {
            "success": True,
            "message": "Lesson completed successfully",
            "data": progress
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# SKILL ASSESSMENT ROUTES
# ============================================================================

@router.post("/assessments/start")
async def start_assessment(request: StartAssessmentRequest, user_id: str = Query(...)):
    """Start a new skill assessment"""
    try:
        questions = generate_assessment_questions(request.skill, request.category)
        
        assessment = SkillAssessment(
            user_id=user_id,
            skill=request.skill,
            category=request.category,
            level="intermediate",
            questions=questions,
            time_limit=30
        )
        
        await assessments_collection.insert_one(assessment.dict())
        
        return {
            "success": True,
            "data": assessment.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/assessments/{assessment_id}/submit")
async def submit_assessment(assessment_id: str, request: SubmitAssessmentRequest):
    """Submit assessment answers"""
    try:
        assessment = await assessments_collection.find_one({"id": assessment_id})
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        correct_count = 0
        questions = assessment.get("questions", [])
        
        for idx, user_answer in enumerate(request.answers):
            if idx < len(questions):
                questions[idx]["user_answer"] = user_answer
                if user_answer == questions[idx]["correct_answer"]:
                    correct_count += 1
        
        score = (correct_count / len(questions)) * 100 if questions else 0
        passed = score >= 70
        
        badge = None
        if passed:
            badge = generate_skill_badge(assessment["skill"], score)
        
        # Update assessment
        await assessments_collection.update_one(
            {"id": assessment_id},
            {"$set": {
                "questions": questions,
                "score": score,
                "time_spent": request.time_spent,
                "passed": passed,
                "badge": badge.dict() if badge else None
            }}
        )
        
        # Fetch updated assessment
        assessment = await assessments_collection.find_one({"id": assessment_id})
        
        return {
            "success": True,
            "message": "Assessment passed!" if passed else "Assessment failed, keep learning!",
            "data": convert_objectid(assessment)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# COMMUNITY ROUTES
# ============================================================================

@router.get("/community/posts")
async def get_community_posts(
    category: Optional[str] = None,
    type: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get community posts"""
    try:
        query = {}
        if category:
            query["category"] = category
        if type:
            query["type"] = type
        
        total = await community_posts_collection.count_documents(query)
        posts = await community_posts_collection.find(query).sort([("is_pinned", -1), ("created_at", -1)]).skip((page - 1) * limit).limit(limit).to_list(None)
        
        return {
            "success": True,
            "data": {
                "posts": posts,
                "pagination": {
                    "current": page,
                    "pages": (total + limit - 1) // limit,
                    "total": total
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/community/posts")
async def create_post(request: CreatePostRequest, user_id: str = Query(...)):
    """Create a new community post"""
    try:
        post = CommunityPost(
            author_id=user_id,
            content=request.content,
            type=request.type,
            category=request.category,
            title=request.title,
            tags=extract_tags(request.content)
        )
        
        await community_posts_collection.insert_one(post.dict())
        
        return {
            "success": True,
            "message": "Post created successfully",
            "data": post.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/community/posts/{post_id}/upvote")
async def upvote_post(post_id: str, user_id: str = Query(...)):
    """Upvote a post"""
    try:
        post = await community_posts_collection.find_one({"id": post_id})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        upvotes = post.get("upvotes", [])
        downvotes = post.get("downvotes", [])
        
        # Remove from downvotes if exists
        if user_id in downvotes:
            downvotes.remove(user_id)
        
        # Add to upvotes if not already there
        if user_id not in upvotes:
            upvotes.append(user_id)
        
        await community_posts_collection.update_one(
            {"id": post_id},
            {"$set": {"upvotes": upvotes, "downvotes": downvotes}}
        )
        
        post = await community_posts_collection.find_one({"id": post_id})
        
        return {
            "success": True,
            "data": convert_objectid(post)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/community/posts/{post_id}/comments")
async def add_comment(post_id: str, request: AddCommentRequest, user_id: str = Query(...)):
    """Add comment to a post"""
    try:
        post = await community_posts_collection.find_one({"id": post_id})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        comment = Comment(
            author_id=user_id,
            content=request.content
        )
        
        comments = post.get("comments", []) + [comment.dict()]
        
        await community_posts_collection.update_one(
            {"id": post_id},
            {"$set": {"comments": comments}}
        )
        
        post = await community_posts_collection.find_one({"id": post_id})
        
        return {
            "success": True,
            "message": "Comment added successfully",
            "data": convert_objectid(post)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# PROGRESS & ANALYTICS ROUTES
# ============================================================================

@router.get("/progress/analytics")
async def get_user_analytics(user_id: str = Query(...)):
    """Get user learning analytics"""
    try:
        # Get all progress
        progress_list = await progress_collection.find({"user_id": user_id}).sort("last_activity", -1).to_list(None)
        
        # Get assessments
        assessments = await assessments_collection.find({"user_id": user_id}).sort("taken_at", -1).to_list(None)
        
        total_points = sum(p.get("total_points_earned", 0) for p in progress_list)
        completed_courses = sum(1 for p in progress_list if p.get("progress", 0) >= 100)
        in_progress_courses = sum(1 for p in progress_list if 0 < p.get("progress", 0) < 100)
        passed_assessments = sum(1 for a in assessments if a.get("passed", False))
        
        return {
            "success": True,
            "data": {
                "overview": {
                    "total_points": total_points,
                    "completed_courses": completed_courses,
                    "in_progress_courses": in_progress_courses,
                    "total_assessments": len(assessments),
                    "passed_assessments": passed_assessments
                },
                "recent_activity": progress_list[:5],
                "skill_progress": [],
                "assessments": assessments[:5]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations/courses")
async def get_recommended_courses(user_id: str = Query(...), limit: int = Query(5, ge=1, le=20)):
    """Get recommended courses for user"""
    try:
        # Get published courses sorted by popularity
        courses = await courses_collection.find({
            "is_published": True
        }).sort("stats.enrolled", -1).limit(limit).to_list(None)
        
        return {
            "success": True,
            "data": courses
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/career-paths")
async def get_career_paths(goal: Optional[str] = None):
    """Get career path recommendations"""
    try:
        career_paths = {
            "frontend": {
                "title": "Frontend Developer",
                "description": "Build modern web applications",
                "required_skills": ["javascript", "react", "html", "css"],
                "recommended_courses": ["Advanced React", "Modern JavaScript", "CSS Mastery"],
                "salary_range": "$70,000 - $120,000",
                "demand": "high"
            },
            "backend": {
                "title": "Backend Developer",
                "description": "Build server-side applications and APIs",
                "required_skills": ["node", "python", "database", "api"],
                "recommended_courses": ["Node.js Mastery", "Python for Backend", "Database Design"],
                "salary_range": "$80,000 - $130,000",
                "demand": "high"
            }
        }
        
        result = career_paths.get(goal, career_paths["frontend"]) if goal else career_paths
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
