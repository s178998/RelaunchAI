// pages/app/JobMatching.jsx
import { useState, useEffect, useContext, useRef } from "react";
import authContext from "../../context/AuthContext";
import apiService from "../../services/api";

export default function JobMatching() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [matchFilter, setMatchFilter] = useState("all");
  const [jobs, setJobs] = useState([]);
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
    
    const fetchJobs = async () => {
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
        
        // Get the user's profile from onboarding
        const storedProfile = localStorage.getItem(`user_profile_${userId}`);
        
        if (!storedProfile) {
          console.log("No profile found for user:", userId);
          setError("Please complete your profile first");
          setLoading(false);
          return;
        }

        const profile = JSON.parse(storedProfile);
        console.log("Fetching job matches for user:", currentUser?.firstname, "Profile:", profile);
        
        // Call the API with the user's profile
        const result = await apiService.matchJobs(profile);
        console.log("Job matches result:", result);
        
        // The API returns { jobs: [...], total: number }
        const matchedJobs = result.jobs || [];
        
        // Personalize job recommendations based on user's skills and role
        const personalizedJobs = matchedJobs.map(job => ({
          ...job,
          // Boost match score if job matches user's skills
          matchScore: calculatePersonalizedMatchScore(job, profile),
          // Add user-specific tags
          userTags: getUserSpecificTags(job, profile)
        }));
        
        // Sort by match score (highest first)
        personalizedJobs.sort((a, b) => b.matchScore - a.matchScore);
        
        setJobs(personalizedJobs);
        hasFetched.current = true;
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setError(err.message || "Unable to load job matches");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchJobs();
    }
  }, [currentUser]);

  // Helper function to calculate personalized match score
  const calculatePersonalizedMatchScore = (job, profile) => {
    let score = job.matchScore || 75;
    
    // Boost score if job title matches user's role
    if (profile.role && job.title.toLowerCase().includes(profile.role.toLowerCase())) {
      score += 5;
    }
    
    // Boost score if skills match
    const userSkills = profile.skills?.toLowerCase().split(',').map(s => s.trim()) || [];
    const jobSkills = job.skills?.map(s => s.toLowerCase()) || [];
    const matchingSkills = jobSkills.filter(skill => 
      userSkills.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
    );
    
    if (matchingSkills.length > 0) {
      score += Math.min(matchingSkills.length * 3, 15);
    }
    
    return Math.min(score, 98); // Cap at 98%
  };

  // Helper function to get user-specific tags
  const getUserSpecificTags = (job, profile) => {
    const tags = [...(job.tags || [])];
    
    if (profile.role && job.title.toLowerCase().includes(profile.role.toLowerCase())) {
      tags.push("Role Match ✓");
    }
    
    const userSkills = profile.skills?.toLowerCase().split(',').map(s => s.trim()) || [];
    const jobSkills = job.skills?.map(s => s.toLowerCase()) || [];
    const matchingSkills = jobSkills.filter(skill => 
      userSkills.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
    );
    
    if (matchingSkills.length >= 3) {
      tags.push("Skills Match ✓");
    }
    
    return tags;
  };

  const filteredJobs = jobs.filter(job => {
    if (matchFilter === "all") return true;
    if (matchFilter === "high") return job.matchScore >= 85;
    if (matchFilter === "medium") return job.matchScore >= 70 && job.matchScore < 85;
    return true;
  });

  // Get personalized greeting based on user's name
  const getUserGreeting = () => {
    const firstName = currentUser?.firstname || 
                     JSON.parse(localStorage.getItem('user') || '{}')?.firstname || 
                     "there";
    return `Find Your Next Role, ${firstName}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Finding jobs that match your skills...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load jobs</h3>
          <p className="text-gray-500">{error}</p>
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
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            AI-Powered Job Matching · Personalized for You
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getUserGreeting()}
          </h1>
          <p className="text-gray-500 text-base max-w-3xl">
            {jobs.length} personalized job recommendations based on your skills, experience, and preferences.
          </p>
        </div>

        {/* Stats Bar - Personalized */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">Total Matches</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{jobs.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl">🎯</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium">High Match (85%+)</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{jobs.filter(j => j.matchScore >= 85).length}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xl">⭐</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 font-medium">Avg Match Score</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {Math.round(jobs.reduce((acc, j) => acc + j.matchScore, 0) / (jobs.length || 1))}%
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-xl">📊</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 font-medium">Top Skill Match</p>
                <p className="text-lg font-bold text-gray-900 mt-1 truncate">
                  {jobs[0]?.skills?.[0] || "N/A"}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-xl">🏆</div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-2">
            {[
              { id: "all", name: "All Matches" },
              { id: "high", name: "High Match (85%+)" },
              { id: "medium", name: "Medium Match (70-84%)" }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setMatchFilter(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  matchFilter === filter.id
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
        </div>

        {/* Job Listings */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No jobs match your filters</p>
            <button 
              onClick={() => setMatchFilter("all")}
              className="mt-2 text-blue-600 text-sm hover:underline"
            >
              Show all matches
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => setSelectedJob(job.id === selectedJob ? null : job.id)}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${job.logoColor || 'from-blue-500 to-blue-600'} flex items-center justify-center text-white font-bold text-xl shadow-sm flex-shrink-0`}>
                    {job.company?.charAt(0) || 'C'}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{job.company}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">{job.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.skills?.slice(0, 5).map((skill, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {job.userTags?.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {job.tags?.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs text-gray-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{job.matchScore}%</div>
                      <div className="text-xs text-gray-400">Match</div>
                    </div>
                    <button 
                      className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://www.google.com/search?q=${encodeURIComponent(job.title + ' ' + job.company + ' job')}`, '_blank');
                      }}
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
                
                {selectedJob === job.id && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Salary Range</p>
                        <p className="text-sm font-medium text-gray-900">{job.salary || "Competitive"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Posted</p>
                        <p className="text-sm font-medium text-gray-900">{job.postedAt || "Recently"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Why this matches you</p>
                        <p className="text-sm text-gray-600">
                          Based on your {currentUser?.role || "role"} experience and skills.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}