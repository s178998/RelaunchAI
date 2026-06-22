# app/services/openai_service.py
import openai
from app.core.config import settings
import json
import logging
import random
from typing import Dict, List, Any
from datetime import datetime, timedelta
import hashlib

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY
        self.model = "gpt-3.5-turbo"
        self.cache = {}
        self.cache_duration = timedelta(hours=24)
    
    def _get_cache_key(self, user_profile: Dict[str, Any]) -> str:
        profile_string = f"{user_profile.get('company')}_{user_profile.get('role')}_{user_profile.get('department')}_{user_profile.get('level')}"
        return hashlib.md5(profile_string.encode()).hexdigest()
    
    def _get_cached_result(self, cache_key: str):
        if cache_key in self.cache:
            cached_data, timestamp = self.cache[cache_key]
            if datetime.now() - timestamp < self.cache_duration:
                return cached_data
            else:
                del self.cache[cache_key]
        return None
    
    def _cache_result(self, cache_key: str, result: Dict[str, Any]):
        self.cache[cache_key] = (result, datetime.now())
    
    # ============ ALL 30 COURSES ============
    def _get_all_courses(self) -> List[Dict[str, Any]]:
        """Return all 30 courses for software engineers"""
        return [
            # System Design & Architecture (Highest Priority)
            {
                "id": 1,
                "title": "System Design Interview – An Insider's Guide",
                "provider": "Alex Xu (ByteByteGo)",
                "duration": "25 hours",
                "level": "Advanced",
                "matchScore": 98,
                "category": "system-design",
                "icon": "🏗️",
                "source": "Amazon bestseller + course"
            },
            {
                "id": 2,
                "title": "Grokking the System Design Interview",
                "provider": "Educative",
                "duration": "50 hours",
                "level": "Advanced",
                "matchScore": 96,
                "category": "system-design",
                "icon": "📐",
                "source": "Most popular system design course"
            },
            {
                "id": 3,
                "title": "Designing Data-Intensive Applications",
                "provider": "Martin Kleppmann",
                "duration": "Self-paced (book)",
                "level": "Expert",
                "matchScore": 94,
                "category": "system-design",
                "icon": "📚",
                "source": "Industry bible for distributed systems"
            },
            {
                "id": 4,
                "title": "Microservices Architecture",
                "provider": "Udemy",
                "duration": "20 hours",
                "level": "Advanced",
                "matchScore": 90,
                "category": "architecture",
                "icon": "🔧",
                "source": "Bestseller on microservices"
            },
            # Cloud & DevOps
            {
                "id": 5,
                "title": "AWS Certified Solutions Architect",
                "provider": "AWS (Coursera)",
                "duration": "60 hours",
                "level": "Intermediate",
                "matchScore": 92,
                "category": "cloud",
                "icon": "☁️",
                "source": "Most recognized cloud cert"
            },
            {
                "id": 6,
                "title": "Docker & Kubernetes: The Complete Guide",
                "provider": "Udemy",
                "duration": "25 hours",
                "level": "Intermediate",
                "matchScore": 90,
                "category": "devops",
                "icon": "🐳",
                "source": "Top-rated DevOps course"
            },
            {
                "id": 7,
                "title": "Terraform for Beginners",
                "provider": "HashiCorp (Coursera)",
                "duration": "15 hours",
                "level": "Intermediate",
                "matchScore": 85,
                "category": "devops",
                "icon": "🔄",
                "source": "Essential for IaC engineers"
            },
            {
                "id": 8,
                "title": "Google Cloud DevOps Engineer",
                "provider": "Google (Coursera)",
                "duration": "40 hours",
                "level": "Advanced",
                "matchScore": 87,
                "category": "cloud",
                "icon": "🌩️",
                "source": "Google Professional Certificate"
            },
            # AI/ML Engineering
            {
                "id": 9,
                "title": "Machine Learning Engineering in Production",
                "provider": "DeepLearning.AI (Coursera)",
                "duration": "40 hours",
                "level": "Advanced",
                "matchScore": 93,
                "category": "ai-engineering",
                "icon": "🤖",
                "source": "MLOps specialization"
            },
            {
                "id": 10,
                "title": "Full Stack LLM Bootcamp",
                "provider": "Full Stack Deep Learning",
                "duration": "Self-paced",
                "level": "Advanced",
                "matchScore": 91,
                "category": "ai-engineering",
                "icon": "🧠",
                "source": "Building production LLM apps"
            },
            {
                "id": 11,
                "title": "LangChain for LLM Applications",
                "provider": "DeepLearning.AI",
                "duration": "3 hours",
                "level": "Intermediate",
                "matchScore": 88,
                "category": "ai-engineering",
                "icon": "⛓️",
                "source": "Top-rated LangChain course"
            },
            # Frontend/Backend Specialization
            {
                "id": 12,
                "title": "The Complete React Developer Course",
                "provider": "Udemy",
                "duration": "40 hours",
                "level": "Intermediate",
                "matchScore": 86,
                "category": "frontend",
                "icon": "⚛️",
                "source": "Highest-rated React course"
            },
            {
                "id": 13,
                "title": "Node.js, Express, MongoDB Bootcamp",
                "provider": "Udemy",
                "duration": "40 hours",
                "level": "Intermediate",
                "matchScore": 84,
                "category": "backend",
                "icon": "🟢",
                "source": "Node.js with over 200,000 students"
            },
            {
                "id": 14,
                "title": "Next.js 15 – The Complete Guide",
                "provider": "Zero To Mastery",
                "duration": "30 hours",
                "level": "Intermediate",
                "matchScore": 88,
                "category": "frontend",
                "icon": "▲",
                "source": "Official Next.js course"
            },
            {
                "id": 15,
                "title": "Spring Boot 3 & Spring Framework 6",
                "provider": "Udemy",
                "duration": "50 hours",
                "level": "Intermediate",
                "matchScore": 82,
                "category": "backend",
                "icon": "🌱",
                "source": "Java backend bestseller"
            },
            # Software Craftsmanship
            {
                "id": 16,
                "title": "Clean Code & Software Design",
                "provider": "Udemy",
                "duration": "15 hours",
                "level": "Intermediate",
                "matchScore": 89,
                "category": "craftsmanship",
                "icon": "📖",
                "source": "Based on Clean Code book"
            },
            {
                "id": 17,
                "title": "Refactoring to Clean Code",
                "provider": "Refactoring.guru",
                "duration": "8 hours",
                "level": "Intermediate",
                "matchScore": 87,
                "category": "craftsmanship",
                "icon": "🧹",
                "source": "Best resource on refactoring"
            },
            {
                "id": 18,
                "title": "Testing with Jest & React Testing Library",
                "provider": "Udemy",
                "duration": "15 hours",
                "level": "Intermediate",
                "matchScore": 83,
                "category": "testing",
                "icon": "✅",
                "source": "Frontend testing bestseller"
            },
            {
                "id": 19,
                "title": "SQL for Data Science",
                "provider": "UC Davis (Coursera)",
                "duration": "15 hours",
                "level": "Intermediate",
                "matchScore": 80,
                "category": "database",
                "icon": "📊",
                "source": "Top-rated SQL course"
            },
            # Interview Prep & Career
            {
                "id": 20,
                "title": "LeetCode Patterns & Algorithms",
                "provider": "NeetCode",
                "duration": "50 hours",
                "level": "Advanced",
                "matchScore": 97,
                "category": "interview",
                "icon": "🎯",
                "source": "Best algorithmic patterns course"
            },
            {
                "id": 21,
                "title": "Cracking the Coding Interview",
                "provider": "Udemy",
                "duration": "30 hours",
                "level": "Advanced",
                "matchScore": 95,
                "category": "interview",
                "icon": "💡",
                "source": "Based on Gayle Laakmann McDowell's book"
            },
            {
                "id": 22,
                "title": "Data Structures and Algorithms",
                "provider": "UC San Diego (Coursera)",
                "duration": "40 hours",
                "level": "Intermediate",
                "matchScore": 94,
                "category": "algorithms",
                "icon": "📊",
                "source": "Top-ranked DSA specialization"
            },
            {
                "id": 23,
                "title": "Graph Algorithms in Python",
                "provider": "Stanford (Coursera)",
                "duration": "25 hours",
                "level": "Advanced",
                "matchScore": 91,
                "category": "algorithms",
                "icon": "📈",
                "source": "Stanford's Algorithms course"
            },
            # Performance & Scalability
            {
                "id": 24,
                "title": "Database Systems & Performance Optimization",
                "provider": "MIT OpenCourseWare",
                "duration": "Self-paced",
                "level": "Advanced",
                "matchScore": 86,
                "category": "database",
                "icon": "⚡",
                "source": "MIT 6.830 Database Systems"
            },
            {
                "id": 25,
                "title": "Web Performance Optimization",
                "provider": "Udacity",
                "duration": "10 hours",
                "level": "Intermediate",
                "matchScore": 84,
                "category": "performance",
                "icon": "🚀",
                "source": "Udacity performance course"
            },
            # Security for Engineers
            {
                "id": 26,
                "title": "Web Security for Developers",
                "provider": "Stanford (Coursera)",
                "duration": "20 hours",
                "level": "Intermediate",
                "matchScore": 82,
                "category": "security",
                "icon": "🔒",
                "source": "Stanford security course"
            },
            {
                "id": 27,
                "title": "OWASP Secure Coding Practices",
                "provider": "OWASP (OpenSecurityTraining)",
                "duration": "15 hours",
                "level": "Intermediate",
                "matchScore": 78,
                "category": "security",
                "icon": "🛡️",
                "source": "Industry standard secure coding"
            },
            # Additional Specialized
            {
                "id": 28,
                "title": "Rust Programming Language",
                "provider": "MIT (edX)",
                "duration": "20 hours",
                "level": "Intermediate",
                "matchScore": 76,
                "category": "programming-languages",
                "icon": "🦀",
                "source": "Emerging systems language"
            },
            {
                "id": 29,
                "title": "Go Programming Language",
                "provider": "Google (Coursera)",
                "duration": "25 hours",
                "level": "Intermediate",
                "matchScore": 80,
                "category": "programming-languages",
                "icon": "🐹",
                "source": "Google's Go specialization"
            },
            {
                "id": 30,
                "title": "Design Patterns in JavaScript/TypeScript",
                "provider": "Udemy",
                "duration": "15 hours",
                "level": "Advanced",
                "matchScore": 85,
                "category": "design-patterns",
                "icon": "🎨",
                "source": "Gang of Four patterns in JS"
            }
        ]
    
    # ============ ANALYZE RISK METHOD ============
    async def analyze_risk(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        cache_key = self._get_cache_key(user_profile)
        cached_result = self._get_cached_result(cache_key)
        if cached_result:
            cached_result['cached'] = True
            return cached_result
        
        company = user_profile.get('company', 'Unknown')
        role = user_profile.get('role', 'Unknown')
        department = user_profile.get('department', 'Unknown')
        level = user_profile.get('level', 'Unknown')
        
        # Calculate consistent risk score
        risk_score = self._calculate_risk_score(company, role, department, level)
        
        result = {
            "riskScore": risk_score,
            "riskLevel": self._get_risk_level(risk_score),
            "greeting": "Good morning",
            "personalizedSummary": self._get_summary(company, role, risk_score),
            "stats": self._get_stats(company, risk_score),
            "leadershipQuotes": self._get_quotes(),
            "riskFactors": self._get_risk_factors(company, role, risk_score),
            "recommendations": self._get_recommendations(risk_score),
            "marketDemand": self._get_market_demand(),
            "watchSignals": self._get_watch_signals(),
            "cached": False,
            "lastUpdated": datetime.now().isoformat()
        }
        
        self._cache_result(cache_key, result)
        return result
    
    # ============ MATCH JOBS METHOD ============
    async def match_jobs(self, user_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get job matches based on user's role"""
        role = user_profile.get('role', 'Professional')
        department = user_profile.get('department', '')
        skills = user_profile.get('skills', '')
        
        return self._get_jobs_for_role(role, department, skills)
    
    # ============ ANALYZE SKILLS METHOD ============
    async def analyze_skills(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze skills and recommend learning paths"""
        role = user_profile.get('role', 'Professional')
        department = user_profile.get('department', '')
        skills_input = user_profile.get('skills', '')
        
        # Get all 30 courses
        all_courses = self._get_all_courses()
        
        # Filter courses based on role
        recommended_courses = self._filter_courses_by_role(all_courses, role)
        
        # Get skills breakdown
        skills_data = self._get_skills_for_role(role, department, skills_input)
        
        # Add the courses to the skills data
        skills_data["recommendedCourses"] = recommended_courses
        
        return skills_data
    
    # ============ FILTER COURSES BY ROLE ============
    def _filter_courses_by_role(self, courses: List[Dict], role: str) -> List[Dict]:
        """Filter courses based on user's role"""
        role_lower = role.lower()
        
        # Define which categories are relevant for each role
        role_categories = {
            "software engineer": ["system-design", "cloud", "devops", "ai-engineering", "frontend", "backend", "craftsmanship", "testing", "database", "interview", "algorithms", "performance", "security", "programming-languages", "design-patterns"],
            "frontend": ["frontend", "system-design", "design-patterns", "testing", "craftsmanship"],
            "backend": ["backend", "system-design", "cloud", "devops", "database", "security", "craftsmanship"],
            "full stack": ["frontend", "backend", "system-design", "cloud", "devops", "database"],
            "devops": ["devops", "cloud", "security", "system-design", "performance"],
            "data scientist": ["ai-engineering", "database", "algorithms", "system-design"],
            "machine learning": ["ai-engineering", "algorithms", "system-design", "database"],
            "product manager": ["system-design", "frontend", "backend", "craftsmanship"],
            "security": ["security", "cloud", "system-design", "craftsmanship"],
            "mobile": ["frontend", "system-design", "craftsmanship"],
        }
        
        # Get categories for this role, or use all if not found
        categories = role_categories.get(role_lower, [])
        
        if not categories:
            # If role not found, return all courses sorted by match score
            return sorted(courses, key=lambda x: x.get("matchScore", 0), reverse=True)
        
        # Filter courses by categories
        filtered = [c for c in courses if c.get("category") in categories]
        
        # If no courses match, return top matches
        if not filtered:
            return sorted(courses, key=lambda x: x.get("matchScore", 0), reverse=True)[:10]
        
        return sorted(filtered, key=lambda x: x.get("matchScore", 0), reverse=True)
    
    # ============ HELPER METHODS ============
    def _calculate_risk_score(self, company: str, role: str, department: str, level: str) -> int:
        company_risk = {
            "Meta": 75, "Amazon": 70, "Google": 65, "Microsoft": 60,
            "Netflix": 65, "Salesforce": 70, "Twitter": 80, "Zoom": 75,
            "Uber": 55, "Airbnb": 50, "Stripe": 45, "Adobe": 40,
            "Apple": 35, "LinkedIn": 40, "Tesla": 45,
        }
        
        dept_risk = {
            "HR": 1.3, "Recruiting": 1.4, "Sales": 1.2, "Marketing": 1.15,
            "Operations": 1.1, "Product": 0.9, "Engineering": 0.85,
            "Data Science": 0.85, "Design": 0.95, "Finance": 1.0,
        }
        
        base = company_risk.get(company, 50)
        multiplier = dept_risk.get(department, 1.0)
        score = int(base * multiplier)
        
        if "Principal" in level or "Staff" in level or "Director" in level:
            score -= 10
        elif "Junior" in level or "Entry" in level:
            score += 10
        
        return max(15, min(85, score))
    
    def _get_risk_level(self, score: int) -> str:
        if score >= 65: return "High"
        if score >= 40: return "Moderate"
        return "Low"
    
    def _get_summary(self, company: str, role: str, score: int) -> str:
        if score >= 65:
            return f"Based on your profile at {company} as a {role}, our analysis shows HIGH risk levels. The tech industry is currently seeing significant shifts, and your role shows elevated risk indicators."
        elif score >= 40:
            return f"Based on your profile at {company} as a {role}, our analysis shows MODERATE risk levels. The tech industry is currently seeing shifts, but your skills remain relevant."
        else:
            return f"Based on your profile at {company} as a {role}, our analysis shows LOW risk levels. Your role appears stable, and your skills remain valuable in the current market."
    
    def _get_stats(self, company: str, score: int) -> Dict:
        open_current = max(20, 100 - (score - 20))
        open_previous = open_current + int(score / 2)
        return {
            "openRoles": {
                "current": open_current,
                "previous": open_previous,
                "change": -int(score / 2)
            },
            "leadershipExits": {
                "count": 2 if score > 60 else 1 if score > 40 else 0,
                "details": f"{'Recent' if score > 40 else 'No significant'} leadership changes at {company}"
            },
            "sentiment": {
                "level": "Concerned" if score > 60 else "Mixed" if score > 40 else "Positive",
                "details": f"Market sentiment for your role is {'cautious' if score > 60 else 'stable' if score > 40 else 'optimistic'}"
            }
        }
    
    def _get_quotes(self) -> List[str]:
        return [
            "Focusing on operational efficiency and cost optimization",
            "Strategic investment in priority areas including AI",
            "Navigating market uncertainties with cautious optimism"
        ]
    
    def _get_risk_factors(self, company: str, role: str, score: int) -> List[Dict]:
        return [
            {
                "name": "Market Demand",
                "score": min(85, score + 5),
                "status": "high" if score > 60 else "medium" if score > 40 else "low",
                "description": f"{role} positions are {'competitive' if score > 60 else 'stable' if score > 40 else 'in demand'}"
            },
            {
                "name": "Company Performance",
                "score": score,
                "status": "high" if score > 60 else "medium" if score > 40 else "low",
                "description": f"{company} has shown {'mixed results' if score > 50 else 'stable performance'}"
            },
            {
                "name": "Skill Relevance",
                "score": max(30, 85 - score),
                "status": "high" if score < 40 else "medium" if score < 65 else "low",
                "description": f"Your skills are {'highly relevant' if score < 40 else 'moderately relevant'}"
            }
        ]
    
    def _get_recommendations(self, score: int) -> List[str]:
        if score >= 65:
            return [
                "Update your resume and LinkedIn immediately",
                "Start networking with former colleagues",
                "Apply to at least 10 jobs per week",
                "Build emergency fund for 6-9 months",
                "Complete 2 skill courses this month"
            ]
        elif score >= 40:
            return [
                "Refresh your portfolio and LinkedIn profile",
                "Connect with recruiters in your industry",
                "Take online courses to upskill",
                "Update your career documents",
                "Build emergency fund for 3-6 months"
            ]
        else:
            return [
                "Continue skill development",
                "Maintain professional network",
                "Document your achievements",
                "Explore growth opportunities",
                "Build emergency fund for 3 months"
            ]
    
    def _get_market_demand(self) -> List[Dict]:
        return [
            {"skill": "AI/ML Integration", "demand": 94},
            {"skill": "Data Analysis", "demand": 89},
            {"skill": "Cloud Computing", "demand": 87},
            {"skill": "Strategic Planning", "demand": 85},
            {"skill": "Cross-functional Leadership", "demand": 82}
        ]
    
    def _get_watch_signals(self) -> List[str]:
        return [
            "Company earnings calls and future guidance",
            "Leadership announcements or unexpected departures",
            "Hiring freezes in your department",
            "Changes to performance review cycles"
        ]
    
    # ============ JOB MATCHING HELPER ============
    def _get_jobs_for_role(self, role: str, department: str, skills: str) -> List[Dict[str, Any]]:
        role_lower = role.lower()
        
        if 'finance' in role_lower or 'financial' in role_lower:
            return [
                {"id": 1, "title": "Finance Manager", "company": "Google", "location": "Mountain View, CA", "matchScore": 94, "salary": "$140k - $190k", "skills": ["Financial Analysis", "Budgeting", "Forecasting"], "postedAt": "2 days ago", "logoColor": "from-blue-500 to-blue-600", "tags": ["FAANG"]},
                {"id": 2, "title": "Senior Financial Analyst", "company": "Amazon", "location": "Seattle, WA", "matchScore": 91, "salary": "$120k - $160k", "skills": ["Financial Modeling", "Variance Analysis", "Excel"], "postedAt": "3 days ago", "logoColor": "from-purple-500 to-purple-600", "tags": ["E-commerce"]},
                {"id": 3, "title": "FP&A Manager", "company": "Microsoft", "location": "Redmond, WA", "matchScore": 89, "salary": "$135k - $185k", "skills": ["Financial Planning", "Budgeting", "Strategic Finance"], "postedAt": "1 week ago", "logoColor": "from-red-500 to-red-600", "tags": ["Enterprise"]},
            ]
        elif 'product' in role_lower or 'pm' in role_lower:
            return [
                {"id": 1, "title": "Senior Product Manager", "company": "Google", "location": "Mountain View, CA", "matchScore": 94, "salary": "$170k - $230k", "skills": ["Product Strategy", "User Research", "Data Analysis"], "postedAt": "2 days ago", "logoColor": "from-blue-500 to-blue-600", "tags": ["FAANG"]},
                {"id": 2, "title": "Technical Product Manager", "company": "Microsoft", "location": "Redmond, WA", "matchScore": 91, "salary": "$160k - $220k", "skills": ["Agile", "API Design", "Technical Writing"], "postedAt": "3 days ago", "logoColor": "from-purple-500 to-purple-600", "tags": ["Enterprise"]},
                {"id": 3, "title": "Product Manager - Growth", "company": "Meta", "location": "Menlo Park, CA", "matchScore": 89, "salary": "$165k - $225k", "skills": ["Growth Strategy", "A/B Testing", "Analytics"], "postedAt": "4 days ago", "logoColor": "from-red-500 to-red-600", "tags": ["Social Media"]},
            ]
        elif 'engineer' in role_lower or 'developer' in role_lower:
            return [
                {"id": 1, "title": "Senior Software Engineer", "company": "Google", "location": "Mountain View, CA", "matchScore": 94, "salary": "$180k - $250k", "skills": ["Python", "System Design", "Algorithms"], "postedAt": "2 days ago", "logoColor": "from-blue-500 to-blue-600", "tags": ["FAANG"]},
                {"id": 2, "title": "Full Stack Engineer", "company": "Microsoft", "location": "Redmond, WA", "matchScore": 91, "salary": "$160k - $220k", "skills": ["React", "Node.js", "TypeScript"], "postedAt": "3 days ago", "logoColor": "from-purple-500 to-purple-600", "tags": ["Enterprise"]},
                {"id": 3, "title": "Frontend Engineer", "company": "Meta", "location": "Menlo Park, CA", "matchScore": 89, "salary": "$165k - $225k", "skills": ["React", "GraphQL", "JavaScript"], "postedAt": "4 days ago", "logoColor": "from-red-500 to-red-600", "tags": ["Social Media"]},
            ]
        else:
            return [
                {"id": 1, "title": f"{role}", "company": "Google", "location": "Mountain View, CA", "matchScore": 92, "salary": "$140k - $190k", "skills": ["Leadership", "Strategy", "Communication"], "postedAt": "2 days ago", "logoColor": "from-blue-500 to-blue-600", "tags": ["FAANG"]},
                {"id": 2, "title": f"Senior {role}", "company": "Microsoft", "location": "Redmond, WA", "matchScore": 89, "salary": "$150k - $200k", "skills": ["Project Management", "Collaboration", "Analytics"], "postedAt": "3 days ago", "logoColor": "from-purple-500 to-purple-600", "tags": ["Enterprise"]},
            ]
    
    # ============ SKILLS ANALYSIS HELPER ============
    def _get_skills_for_role(self, role: str, department: str, skills_input: str) -> Dict[str, Any]:
        role_lower = role.lower()
        
        if 'finance' in role_lower or 'financial' in role_lower:
            return {
                "mastered": ["Financial Analysis", "Budgeting & Forecasting", "Excel", "Variance Analysis"],
                "developing": ["FP&A", "SQL", "Power BI", "Strategic Planning"],
                "aspiring": ["AI in Finance", "M&A", "Advanced Modeling", "Leadership"],
                "marketDemand": [
                    {"skill": "FP&A", "demand": 92},
                    {"skill": "Financial Modeling", "demand": 89},
                    {"skill": "Data Analytics", "demand": 87},
                ]
            }
        elif 'product' in role_lower or 'pm' in role_lower:
            return {
                "mastered": ["Product Strategy", "User Research", "Roadmapping", "Data Analysis"],
                "developing": ["Technical Architecture", "UX Design", "Go-to-Market"],
                "aspiring": ["AI/ML Strategy", "Leadership", "Coding Basics"],
                "marketDemand": [
                    {"skill": "AI/ML Strategy", "demand": 94},
                    {"skill": "Product Analytics", "demand": 89},
                    {"skill": "Product Leadership", "demand": 87},
                ]
            }
        elif 'engineer' in role_lower or 'developer' in role_lower:
            return {
                "mastered": ["JavaScript/TypeScript", "React", "Python", "Git", "REST APIs"],
                "developing": ["Node.js", "AWS", "System Design", "Docker"],
                "aspiring": ["Kubernetes", "Machine Learning", "Leadership"],
                "marketDemand": [
                    {"skill": "AI/ML", "demand": 94},
                    {"skill": "System Design", "demand": 89},
                    {"skill": "Cloud", "demand": 87},
                ]
            }
        else:
            user_skills = [s.strip() for s in skills_input.split(',') if s.strip()] if skills_input else []
            mastered = user_skills[:4] if user_skills else ["Strategic Planning", "Leadership", "Communication", "Project Management"]
            
            return {
                "mastered": mastered,
                "developing": ["Advanced Analytics", "Team Leadership", "Technical Acumen"],
                "aspiring": ["Executive Presence", "Change Management", "Innovation"],
                "marketDemand": [
                    {"skill": "Strategic Planning", "demand": 88},
                    {"skill": "Leadership", "demand": 86},
                    {"skill": "Data Analysis", "demand": 84},
                ]
            }

# Create singleton instance
openai_service = OpenAIService()