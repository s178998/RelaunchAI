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
        
        return self._get_skills_for_role(role, department, skills_input)
    
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
        
        # Finance roles
        if 'finance' in role_lower or 'financial' in role_lower:
            return [
                {"id": 1, "title": "Finance Manager", "company": "Google", "location": "Mountain View, CA", "matchScore": 94, "salary": "$140k - $190k", "skills": ["Financial Analysis", "Budgeting", "Forecasting"], "postedAt": "2 days ago", "logoColor": "from-blue-500 to-blue-600", "tags": ["FAANG"]},
                {"id": 2, "title": "Senior Financial Analyst", "company": "Amazon", "location": "Seattle, WA", "matchScore": 91, "salary": "$120k - $160k", "skills": ["Financial Modeling", "Variance Analysis", "Excel"], "postedAt": "3 days ago", "logoColor": "from-purple-500 to-purple-600", "tags": ["E-commerce"]},
                {"id": 3, "title": "FP&A Manager", "company": "Microsoft", "location": "Redmond, WA", "matchScore": 89, "salary": "$135k - $185k", "skills": ["Financial Planning", "Budgeting", "Strategic Finance"], "postedAt": "1 week ago", "logoColor": "from-red-500 to-red-600", "tags": ["Enterprise"]},
            ]
        
        # Product roles
        elif 'product' in role_lower or 'pm' in role_lower:
            return [
                {"id": 1, "title": "Senior Product Manager", "company": "Google", "location": "Mountain View, CA", "matchScore": 94, "salary": "$170k - $230k", "skills": ["Product Strategy", "User Research", "Data Analysis"], "postedAt": "2 days ago", "logoColor": "from-blue-500 to-blue-600", "tags": ["FAANG"]},
                {"id": 2, "title": "Technical Product Manager", "company": "Microsoft", "location": "Redmond, WA", "matchScore": 91, "salary": "$160k - $220k", "skills": ["Agile", "API Design", "Technical Writing"], "postedAt": "3 days ago", "logoColor": "from-purple-500 to-purple-600", "tags": ["Enterprise"]},
                {"id": 3, "title": "Product Manager - Growth", "company": "Meta", "location": "Menlo Park, CA", "matchScore": 89, "salary": "$165k - $225k", "skills": ["Growth Strategy", "A/B Testing", "Analytics"], "postedAt": "4 days ago", "logoColor": "from-red-500 to-red-600", "tags": ["Social Media"]},
            ]
        
        # Engineering roles
        elif 'engineer' in role_lower or 'developer' in role_lower:
            return [
                {"id": 1, "title": "Senior Software Engineer", "company": "Google", "location": "Mountain View, CA", "matchScore": 94, "salary": "$180k - $250k", "skills": ["Python", "System Design", "Algorithms"], "postedAt": "2 days ago", "logoColor": "from-blue-500 to-blue-600", "tags": ["FAANG"]},
                {"id": 2, "title": "Full Stack Engineer", "company": "Microsoft", "location": "Redmond, WA", "matchScore": 91, "salary": "$160k - $220k", "skills": ["React", "Node.js", "TypeScript"], "postedAt": "3 days ago", "logoColor": "from-purple-500 to-purple-600", "tags": ["Enterprise"]},
                {"id": 3, "title": "Frontend Engineer", "company": "Meta", "location": "Menlo Park, CA", "matchScore": 89, "salary": "$165k - $225k", "skills": ["React", "GraphQL", "JavaScript"], "postedAt": "4 days ago", "logoColor": "from-red-500 to-red-600", "tags": ["Social Media"]},
            ]
        
        # Default
        else:
            return [
                {"id": 1, "title": f"{role}", "company": "Google", "location": "Mountain View, CA", "matchScore": 92, "salary": "$140k - $190k", "skills": ["Leadership", "Strategy", "Communication"], "postedAt": "2 days ago", "logoColor": "from-blue-500 to-blue-600", "tags": ["FAANG"]},
                {"id": 2, "title": f"Senior {role}", "company": "Microsoft", "location": "Redmond, WA", "matchScore": 89, "salary": "$150k - $200k", "skills": ["Project Management", "Collaboration", "Analytics"], "postedAt": "3 days ago", "logoColor": "from-purple-500 to-purple-600", "tags": ["Enterprise"]},
            ]
    
    # ============ SKILLS ANALYSIS HELPER ============
    def _get_skills_for_role(self, role: str, department: str, skills_input: str) -> Dict[str, Any]:
        role_lower = role.lower()
        
        # Finance skills
        if 'finance' in role_lower or 'financial' in role_lower:
            return {
                "mastered": ["Financial Analysis", "Budgeting & Forecasting", "Excel", "Variance Analysis"],
                "developing": ["FP&A", "SQL", "Power BI", "Strategic Planning"],
                "aspiring": ["AI in Finance", "M&A", "Advanced Modeling", "Leadership"],
                "marketDemand": [
                    {"skill": "FP&A", "demand": 92},
                    {"skill": "Financial Modeling", "demand": 89},
                    {"skill": "Data Analytics", "demand": 87},
                ],
                "recommendedCourses": [
                    {"id": 1, "title": "FP&A Certification", "provider": "CFI", "duration": "24 hours", "level": "Advanced", "matchScore": 95, "category": "finance", "icon": "💰"},
                    {"id": 2, "title": "Financial Modeling", "provider": "Wall Street Prep", "duration": "20 hours", "level": "Advanced", "matchScore": 93, "category": "finance", "icon": "📊"},
                    {"id": 3, "title": "Power BI for Finance", "provider": "Microsoft", "duration": "16 hours", "level": "Intermediate", "matchScore": 90, "category": "analytics", "icon": "📈"},
                ]
            }
        
        # Product skills
        elif 'product' in role_lower or 'pm' in role_lower:
            return {
                "mastered": ["Product Strategy", "User Research", "Roadmapping", "Data Analysis"],
                "developing": ["Technical Architecture", "UX Design", "Go-to-Market"],
                "aspiring": ["AI/ML Strategy", "Leadership", "Coding Basics"],
                "marketDemand": [
                    {"skill": "AI/ML Strategy", "demand": 94},
                    {"skill": "Product Analytics", "demand": 89},
                    {"skill": "Product Leadership", "demand": 87},
                ],
                "recommendedCourses": [
                    {"id": 1, "title": "Product Strategy", "provider": "Product School", "duration": "16 hours", "level": "Advanced", "matchScore": 95, "category": "product", "icon": "🏗️"},
                    {"id": 2, "title": "Data Analytics for PMs", "provider": "Coursera", "duration": "12 hours", "level": "Intermediate", "matchScore": 92, "category": "analytics", "icon": "📊"},
                ]
            }
        
        # Engineering skills
        elif 'engineer' in role_lower or 'developer' in role_lower:
            return {
                "mastered": ["JavaScript/TypeScript", "React", "Python", "Git", "REST APIs"],
                "developing": ["Node.js", "AWS", "System Design", "Docker"],
                "aspiring": ["Kubernetes", "Machine Learning", "Leadership"],
                "marketDemand": [
                    {"skill": "AI/ML", "demand": 94},
                    {"skill": "System Design", "demand": 89},
                    {"skill": "Cloud", "demand": 87},
                ],
                "recommendedCourses": [
                    {"id": 1, "title": "System Design", "provider": "Educative", "duration": "20 hours", "level": "Advanced", "matchScore": 95, "category": "backend", "icon": "🏗️"},
                    {"id": 2, "title": "AWS Certification", "provider": "A Cloud Guru", "duration": "40 hours", "level": "Advanced", "matchScore": 88, "category": "devops", "icon": "☁️"},
                ]
            }
        
        # Default
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
                ],
                "recommendedCourses": [
                    {"id": 1, "title": "Leadership Development", "provider": "Harvard", "duration": "16 hours", "level": "Advanced", "matchScore": 95, "category": "leadership", "icon": "👥"},
                    {"id": 2, "title": "Strategic Thinking", "provider": "Coursera", "duration": "12 hours", "level": "Intermediate", "matchScore": 92, "category": "strategy", "icon": "🎯"},
                ]
            }

# Create singleton instance
openai_service = OpenAIService()