// pages/app/Dashboard.jsx
import { useState, useEffect, useContext, useRef } from "react";
import authContext from "../../context/AuthContext";
import apiService from "../../services/api";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [riskData, setRiskData] = useState(null);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const { user } = useContext(authContext);
  const hasFetched = useRef(false);

  // Load user from localStorage if context doesn't have it yet
  useEffect(() => {
    const loadUser = () => {
      if (user && user.id) {
        setCurrentUser(user);
      } else {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setCurrentUser(parsedUser);
          console.log("Loaded user from localStorage:", parsedUser);
        }
      }
    };
    loadUser();
  }, [user]);

  useEffect(() => {
    if (hasFetched.current) return;
    
    const fetchRiskAnalysis = async () => {
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
          setLoading(false);
          return;
        }
        
        const storedProfile = localStorage.getItem(`user_profile_${userId}`);
        
        if (!storedProfile) {
          console.log("No profile found for user:", userId);
          setLoading(false);
          return;
        }

        const profile = JSON.parse(storedProfile);
        console.log("Fetching risk analysis for profile:", profile);
        
        const result = await apiService.analyzeRisk(profile);
        
        console.log("Risk analysis result:", result);
        setRiskData(result);
        hasFetched.current = true;
      } catch (err) {
        console.error("Failed to fetch risk analysis:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchRiskAnalysis();
    }
  }, [currentUser]);

  // Get the user name for greeting
  const getUserName = () => {
    if (currentUser?.firstname) {
      return currentUser.firstname;
    }
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      return parsed.firstname || "there";
    }
    return "there";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                Loading your personalized report...
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-700">Analyzing market trends...</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-700">Checking leadership signals...</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-700">Calculating risk score...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load dashboard</h3>
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

  if (!riskData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
            {riskData.riskLevel} Risk · Updated Live
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {riskData.greeting || "Good morning"}, {getUserName()}.
          </h1>
          <p className="text-gray-600 text-base max-w-3xl">
            {riskData.personalizedSummary}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Open Roles at Company</span>
              <span className={`text-xs font-semibold ${riskData.stats.openRoles.change < 0 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'} px-2 py-0.5 rounded-full`}>
                {riskData.stats.openRoles.change > 0 ? '↑' : '↓'} {Math.abs(riskData.stats.openRoles.change)}%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">{riskData.stats.openRoles.current}</span>
              <span className="text-sm text-gray-400 line-through">{riskData.stats.openRoles.previous}</span>
            </div>
            <p className="text-xs text-gray-500 mt-3">Roles dropped from {riskData.stats.openRoles.previous} → {riskData.stats.openRoles.current} over past 60 days</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Leadership Exits (30 days)</span>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Direct signal</span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{riskData.stats.leadershipExits.count}</div>
            <p className="text-sm text-gray-700">{riskData.stats.leadershipExits.details}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Engineer Sentiment</span>
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Role-filtered</span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{riskData.stats.sentiment.level}</div>
            <p className="text-sm text-gray-700">{riskData.stats.sentiment.details}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-semibold text-gray-900">What leadership is saying</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Earnings language</span>
          </div>
          <div className="space-y-3">
            {riskData.leadershipQuotes?.slice(0, 3).map((quote, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-blue-600 font-mono text-sm">{idx === 0 ? 'CEO:' : idx === 1 ? 'CFO:' : 'CTO:'}</span>
                <p className="text-gray-700 text-sm">{quote}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Risk Factors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {riskData.riskFactors?.map((factor, idx) => (
              <div key={idx} className={`bg-white rounded-xl shadow-sm border p-4 ${
                factor.status === 'high' ? 'border-red-200 bg-red-50/30' : 
                factor.status === 'medium' ? 'border-yellow-200 bg-yellow-50/30' : 
                'border-green-200 bg-green-50/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{factor.name}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    factor.status === 'high' ? 'bg-red-100 text-red-700' :
                    factor.status === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {factor.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{factor.description}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      factor.score >= 70 ? 'bg-red-500' : factor.score >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${factor.score}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Risk Score: {factor.score}%</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Recommended Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskData.recommendations?.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-sm text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}