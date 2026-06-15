// pages/app/SkillsLearning.jsx
import { useState, useEffect, useContext, useRef } from "react";
import authContext from "../../context/AuthContext";
import apiService from "../../services/api";

export default function SkillsLearning() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [skillsData, setSkillsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const { user } = useContext(authContext);
  const hasFetched = useRef(false);

  // Load user from localStorage if context doesn't have it yet
  useEffect(() => {
    const loadUser = () => {
      if (user && user.id) {
        setCurrentUser(user);
        console.log("User loaded from context:", user);
      } else {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setCurrentUser(parsedUser);
          console.log("User loaded from localStorage:", parsedUser);
        }
      }
    };
    loadUser();
  }, [user]);

  useEffect(() => {
    // Prevent multiple fetches
    if (hasFetched.current) return;
    
    const fetchSkills = async () => {
      try {
        setLoading(true);
        
        // Get user ID from currentUser state
        let userId = currentUser?.id;
        if (!userId) {
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            userId = parsedUser.id;
            setCurrentUser(parsedUser);
          }
        }
        
        if (!userId) {
          console.error("No user ID found");
          setError("Please log in again");
          setLoading(false);
          return;
        }
        
        const storedProfile = localStorage.getItem(`user_profile_${userId}`);
        
        if (!storedProfile) {
          console.log("No profile found for user:", userId);
          setError("Please complete your profile first");
          setLoading(false);
          return;
        }

        const profile = JSON.parse(storedProfile);
        console.log("Fetching skills analysis for user:", currentUser?.firstname, "Role:", profile.role);
        
        const result = await apiService.analyzeSkills(profile);
        console.log("Skills analysis result:", result);
        
        setSkillsData(result);
        hasFetched.current = true;
      } catch (err) {
        console.error("Failed to fetch skills analysis:", err);
        setError(err.message || "Unable to load skills analysis");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchSkills();
    }
  }, [currentUser]);

  // Get dynamic skill categories based on user's role and skills data
  const getSkillCategories = () => {
    const totalSkills = (skillsData?.mastered?.length || 0) + 
                        (skillsData?.developing?.length || 0) + 
                        (skillsData?.aspiring?.length || 0);
    
    return [
      { id: "all", name: "All Skills", count: totalSkills },
      { id: "core", name: "Core Skills", count: skillsData?.mastered?.length || 0 },
      { id: "developing", name: "In Progress", count: skillsData?.developing?.length || 0 },
      { id: "aspiring", name: "Learning Goals", count: skillsData?.aspiring?.length || 0 },
    ];
  };

  const skillCategories = getSkillCategories();

  const filteredCourses = (skillsData?.recommendedCourses || []).filter(course => {
    if (activeCategory === "all") return true;
    if (activeCategory === "core") return course.category === "core" || course.matchScore >= 90;
    if (activeCategory === "developing") return course.category === "developing" || (course.matchScore >= 70 && course.matchScore < 90);
    if (activeCategory === "aspiring") return course.category === "aspiring" || course.matchScore < 70;
    return course.category === activeCategory;
  });

  // Function to get the actual URL for a course based on provider and title
  const getCourseUrl = (course) => {
    const searchQuery = encodeURIComponent(`${course.title} ${course.provider}`);
    
    // Direct links to popular learning platforms
    const providerUrls = {
      'Coursera': `https://www.coursera.org/search?query=${encodeURIComponent(course.title)}`,
      'Udemy': `https://www.udemy.com/courses/search/?q=${encodeURIComponent(course.title)}`,
      'Udacity': `https://www.udacity.com/courses/all?search=${encodeURIComponent(course.title)}`,
      'edX': `https://www.edx.org/search?q=${encodeURIComponent(course.title)}`,
      'Pluralsight': `https://www.pluralsight.com/search?q=${encodeURIComponent(course.title)}`,
      'LinkedIn Learning': `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(course.title)}`,
      'Educative': `https://www.educative.io/search?search_string=${encodeURIComponent(course.title)}`,
      'Frontend Masters': `https://frontendmasters.com/courses/?search=${encodeURIComponent(course.title)}`,
      'A Cloud Guru': `https://learn.acloud.guru/search?q=${encodeURIComponent(course.title)}`,
      'Product School': `https://productschool.com/training/courses?search=${encodeURIComponent(course.title)}`,
      'Nielsen Norman': `https://www.nngroup.com/training/courses/?s=${encodeURIComponent(course.title)}`,
    };
    
    // Return provider-specific URL or fallback to Google search
    return providerUrls[course.provider] || `https://www.google.com/search?q=${searchQuery}+course`;
  };

  const getLevelColor = (level) => {
    switch(level?.toLowerCase()) {
      case "beginner": return "bg-green-100 text-green-700";
      case "intermediate": return "bg-blue-100 text-blue-700";
      case "advanced": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  // Get personalized greeting
  const getUserName = () => {
    const firstName = currentUser?.firstname || 
                     JSON.parse(localStorage.getItem('user') || '{}')?.firstname || 
                     "there";
    return firstName;
  };

  // Get role-specific learning message
  const getRoleLearningMessage = () => {
    const role = JSON.parse(localStorage.getItem(`user_profile_${currentUser?.id}`) || '{}')?.role || "professional";
    return `Personalized skill development recommendations for ${role}s based on market demand and your career goals.`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your skills...</p>
        </div>
      </div>
    );
  }

  if (error || !skillsData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load skills analysis</h3>
          <p className="text-gray-500">{error || "Please try again later"}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-8 py-8">
        
        {/* Header - Personalized */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            AI-Powered Learning Path · Personalized for {getUserName()}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Skills & Learning
          </h1>
          <p className="text-gray-500 text-base max-w-3xl">
            {getRoleLearningMessage()}
          </p>
        </div>

        {/* Skills Assessment Summary - Personalized */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-300 mb-1">Your Skill Proficiency</p>
                <p className="text-2xl font-bold">
                  {Math.round((skillsData.mastered?.length || 0) / 
                    ((skillsData.mastered?.length || 0) + 
                     (skillsData.developing?.length || 0) + 
                     (skillsData.aspiring?.length || 1)) * 100)}%
                </p>
                <p className="text-xs text-gray-400 mt-1">Based on your current skill assessment</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Skill Score</p>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mt-2">
                  <span className="text-xl font-bold">
                    {Math.round((skillsData.mastered?.length || 0) / 
                      ((skillsData.mastered?.length || 0) + 
                       (skillsData.developing?.length || 0) + 
                       (skillsData.aspiring?.length || 1)) * 100)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div>
                <p className="text-2xl font-bold text-green-400">{skillsData.mastered?.length || 0}</p>
                <p className="text-xs text-gray-300">Mastered Skills</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">{skillsData.developing?.length || 0}</p>
                <p className="text-xs text-gray-300">Developing</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">{skillsData.aspiring?.length || 0}</p>
                <p className="text-xs text-gray-300">Learning Goals</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Market Demand Heatmap</h3>
            <div className="space-y-3">
              {skillsData.marketDemand?.slice(0, 5).map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700">{item.skill}</span>
                    <span className="text-gray-500">{item.demand}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        item.demand >= 90 ? 'bg-red-500' : 
                        item.demand >= 80 ? 'bg-orange-500' : 
                        item.demand >= 70 ? 'bg-yellow-500' : 
                        item.demand >= 60 ? 'bg-blue-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${item.demand}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">
              Based on current job market data
            </p>
          </div>
        </div>

        {/* Skills Breakdown - Personalized for role */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">✅</span>
              <h3 className="font-semibold text-gray-900">Mastered Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {skillsData.mastered?.map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  {skill}
                </span>
              ))}
              {(!skillsData.mastered || skillsData.mastered.length === 0) && (
                <p className="text-xs text-gray-500">No mastered skills recorded yet</p>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📚</span>
              <h3 className="font-semibold text-gray-900">Developing Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {skillsData.developing?.map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                  {skill}
                </span>
              ))}
              {(!skillsData.developing || skillsData.developing.length === 0) && (
                <p className="text-xs text-gray-500">Focus on these next</p>
              )}
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🎯</span>
              <h3 className="font-semibold text-gray-900">Learning Goals</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {skillsData.aspiring?.map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full cursor-pointer hover:bg-purple-200 transition">
                  {skill}
                </span>
              ))}
              {(!skillsData.aspiring || skillsData.aspiring.length === 0) && (
                <p className="text-xs text-gray-500">Set goals for career growth</p>
              )}
            </div>
          </div>
        </div>

        {/* Recommended Learning Path */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recommended Learning Path</h2>
              <p className="text-sm text-gray-500 mt-1">Personalized courses based on your skill gaps</p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {skillCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === cat.id
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-500">No courses found in this category</p>
              <button 
                onClick={() => setActiveCategory("all")}
                className="mt-2 text-purple-600 text-sm hover:underline"
              >
                View all courses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl">{course.icon || '📚'}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition line-clamp-2">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">{course.provider}</p>
                        {course.provider === 'Coursera' && <span className="text-xs text-blue-600">✓ Accredited</span>}
                        {course.provider === 'Udacity' && <span className="text-xs text-purple-600">✓ Nanodegree</span>}
                        {course.provider === 'edX' && <span className="text-xs text-red-600">✓ University Credit</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                        {course.level || 'Intermediate'}
                      </span>
                      <span className="text-xs text-gray-500">{course.duration || '10 hours'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-purple-600">{course.matchScore || 85}%</span>
                      <span className="text-xs text-gray-400">match</span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${course.matchScore || 85}%` }}></div>
                  </div>

                  <a
                    href={getCourseUrl(course)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Start Learning → 
                    <span className="text-xs ml-1 opacity-70">(opens new tab)</span>
                  </a>

                  {selectedCourse === course.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-600">
                        This course is recommended based on your skill gap analysis and current market demand for {currentUser?.role || "your role"}.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">✓ Certificate included</span>
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">💰 Financial aid available</span>
                      </div>
                    </div>
                  )}
                  
                  {/* View Details Button */}
                  <button
                    onClick={() => setSelectedCourse(course.id === selectedCourse ? null : course.id)}
                    className="w-full mt-2 px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-100 transition"
                  >
                    {selectedCourse === course.id ? "Hide Details" : "View Details"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Learning Resources with Real Links */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <h3 className="text-md font-semibold text-gray-900 mb-4">📖 Additional Learning Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://www.coursera.org/browse/computer-science"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 bg-white rounded-lg hover:shadow-md transition cursor-pointer group"
            >
              <span className="text-xl">🎓</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-purple-600 text-sm">Coursera</p>
                <p className="text-xs text-gray-500">University-accredited courses</p>
              </div>
            </a>
            <a
              href="https://www.udemy.com/courses/development/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 bg-white rounded-lg hover:shadow-md transition cursor-pointer group"
            >
              <span className="text-xl">📺</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-purple-600 text-sm">Udemy</p>
                <p className="text-xs text-gray-500">Affordable courses & sales</p>
              </div>
            </a>
            <a
              href="https://www.pluralsight.com/product/skills"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 bg-white rounded-lg hover:shadow-md transition cursor-pointer group"
            >
              <span className="text-xl">💻</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-purple-600 text-sm">Pluralsight</p>
                <p className="text-xs text-gray-500">Tech skills assessments</p>
              </div>
            </a>
          </div>
          
          {/* Free Resources Section */}
          <div className="mt-4 pt-4 border-t border-purple-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">🎁 Free Learning Resources</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <a
                href="https://www.youtube.com/@freecodecamp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-gray-50 transition text-xs text-gray-600"
              >
                <span>📹</span> freeCodeCamp (YouTube)
              </a>
              <a
                href="https://www.khanacademy.org/computing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-gray-50 transition text-xs text-gray-600"
              >
                <span>📘</span> Khan Academy
              </a>
              <a
                href="https://www.edx.org/school/harvardx"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-gray-50 transition text-xs text-gray-600"
              >
                <span>🏛️</span> Harvard CS50 (Free)
              </a>
              <a
                href="https://www.microsoft.com/en-us/learn"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-gray-50 transition text-xs text-gray-600"
              >
                <span>💡</span> Microsoft Learn
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}