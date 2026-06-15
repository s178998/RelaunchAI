// pages/app/LayoffRisk.jsx
import { useState, useEffect, useContext, useRef } from "react";
import authContext from "../../context/AuthContext";
import apiService from "../../services/api";

export default function LayoffRisk() {
  const [loading, setLoading] = useState(true);
  const [riskData, setRiskData] = useState(null);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showActionPlan, setShowActionPlan] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [expandedFactor, setExpandedFactor] = useState(null);
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

  const getStatusBadge = (status) => {
    switch(status) {
      case "high": return "bg-red-100 text-red-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "low": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getRiskColor = (score) => {
    if (score >= 70) return "text-red-600";
    if (score >= 40) return "text-yellow-600";
    return "text-green-600";
  };

  const getRiskBarColor = (score) => {
    if (score >= 70) return "bg-red-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Download Report Functionality
  const downloadReport = (format) => {
    if (!riskData) return;
    
    const reportData = {
      user: {
        name: currentUser?.firstname + ' ' + currentUser?.lastname,
        email: currentUser?.email,
      },
      riskAnalysis: {
        score: riskData.riskScore,
        level: riskData.riskLevel,
        summary: riskData.personalizedSummary,
        generatedAt: new Date().toISOString(),
      },
      stats: riskData.stats,
      riskFactors: riskData.riskFactors,
      recommendations: riskData.recommendations,
      marketDemand: riskData.marketDemand,
      watchSignals: riskData.watchSignals,
    };

    if (format === 'json') {
      const dataStr = JSON.stringify(reportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `layoff_risk_report_${currentUser?.firstname}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'text') {
      const textContent = `
LAYOFF RISK REPORT
==================
Generated: ${new Date().toLocaleString()}
User: ${currentUser?.firstname} ${currentUser?.lastname}
Email: ${currentUser?.email}

RISK SUMMARY
------------
Overall Risk Score: ${riskData.riskScore}% (${riskData.riskLevel} Risk)
Summary: ${riskData.personalizedSummary}

STATISTICS
----------
Open Roles: ${riskData.stats?.openRoles?.current} (${riskData.stats?.openRoles?.change > 0 ? '+' : ''}${riskData.stats?.openRoles?.change}%)
Leadership Exits: ${riskData.stats?.leadershipExits?.count}
Sentiment: ${riskData.stats?.sentiment?.level} - ${riskData.stats?.sentiment?.details}

RISK FACTORS
------------
${riskData.riskFactors?.map(f => `- ${f.name}: ${f.score}% (${f.status.toUpperCase()}) - ${f.description}`).join('\n')}

RECOMMENDATIONS
---------------
${riskData.recommendations?.map((r, i) => `${i+1}. ${r}`).join('\n')}

WATCH SIGNALS
-------------
${riskData.watchSignals?.map(s => `- ${s}`).join('\n')}

This report was generated by RelaunchAI. For more insights, visit your dashboard.
      `;
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `layoff_risk_report_${currentUser?.firstname}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    
    setShowDownloadOptions(false);
  };

  const shareReport = async () => {
    if (!riskData) return;
    
    const shareText = `My layoff risk analysis from RelaunchAI: ${riskData.riskScore}% (${riskData.riskLevel} Risk). ${riskData.recommendations?.[0]}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Layoff Risk Report',
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Report summary copied to clipboard!');
    }
  };

  const getActionPlanSteps = () => {
    const riskLevel = riskData?.riskLevel?.toLowerCase();
    
    const plans = {
      high: [
        { step: 1, title: "Immediate Actions", tasks: ["Update your resume today", "Start networking immediately", "Apply to 10+ jobs this week", "Build emergency fund for 6-9 months"] },
        { step: 2, title: "This Week", tasks: ["Reach out to 20+ connections on LinkedIn", "Complete 2 skill courses", "Update portfolio/GitHub", "Set up job alerts"] },
        { step: 3, title: "This Month", tasks: ["Complete 5+ interviews", "Get resume professionally reviewed", "Join industry Slack/Discord groups", "Apply for 30+ positions"] },
      ],
      medium: [
        { step: 1, title: "Immediate Actions", tasks: ["Review and update resume", "Start passive networking", "Complete 1 skill course this week", "Build emergency fund for 3-6 months"] },
        { step: 2, title: "This Week", tasks: ["Update LinkedIn profile", "Reach out to 10 former colleagues", "Research target companies", "Set up job alerts"] },
        { step: 3, title: "This Month", tasks: ["Complete 2-3 interviews", "Get resume feedback", "Attend 2 networking events", "Apply for 15+ positions"] },
      ],
      low: [
        { step: 1, title: "Immediate Actions", tasks: ["Document your achievements", "Start building your brand", "Take 1 skill course this month", "Build emergency fund for 3 months"] },
        { step: 2, title: "This Week", tasks: ["Update LinkedIn profile", "Connect with industry peers", "Research market trends", "Set career goals"] },
        { step: 3, title: "This Month", tasks: ["Explore growth opportunities", "Get mentorship", "Attend 1 conference/event", "Plan career roadmap"] },
      ],
    };
    
    return plans[riskLevel] || plans.medium;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing layoff risk...</p>
        </div>
      </div>
    );
  }

  if (error || !riskData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load risk analysis</h3>
          <p className="text-gray-500">{error || "Please try again later"}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const actionPlan = getActionPlanSteps();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Risk Assessment · Powered by AI
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Report
                </button>
                {showDownloadOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button onClick={() => downloadReport('json')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg">JSON Format</button>
                    <button onClick={() => downloadReport('text')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg">Text Format</button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowActionPlan(true)}
                className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg text-sm font-medium hover:bg-amber-600 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Action Plan
              </button>
              <button
                onClick={shareReport}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
            Layoff Risk Dashboard
          </h1>
          <p className="text-gray-600 text-base max-w-3xl">
            {riskData.personalizedSummary}
          </p>
        </div>

        {/* Overall Risk Score */}
        <div className={`rounded-2xl p-8 mb-8 text-white ${
          riskData.riskScore >= 70 ? 'bg-gradient-to-r from-red-900 to-red-800' :
          riskData.riskScore >= 40 ? 'bg-gradient-to-r from-yellow-800 to-amber-800' :
          'bg-gradient-to-r from-green-800 to-emerald-800'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-sm text-white/70 mb-2">Your Overall Risk Score</p>
              <div className="flex items-baseline gap-3">
                <span className="text-6xl font-bold">{riskData.riskScore}%</span>
                <span className="text-sm text-white/70">{riskData.riskLevel} Risk</span>
              </div>
              <p className="text-sm text-white/70 mt-2">Based on {riskData.riskFactors?.length || 0} key factors + real-time signals</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowActionPlan(true)}
                className="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition backdrop-blur-sm"
              >
                View Action Plan
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Open Roles</span>
              <span className={`text-xs font-semibold ${riskData.stats?.openRoles?.change < 0 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'} px-2 py-0.5 rounded-full`}>
                {riskData.stats?.openRoles?.change > 0 ? '↑' : '↓'} {Math.abs(riskData.stats?.openRoles?.change || 0)}%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">{riskData.stats?.openRoles?.current || 0}</span>
              <span className="text-sm text-gray-400 line-through">{riskData.stats?.openRoles?.previous || 0}</span>
            </div>
            <p className="text-xs text-gray-500 mt-3">Change from previous period</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Leadership Exits</span>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Signal</span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{riskData.stats?.leadershipExits?.count || 0}</div>
            <p className="text-sm text-gray-700">{riskData.stats?.leadershipExits?.details}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Role Sentiment</span>
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Filtered</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{riskData.stats?.sentiment?.level}</div>
            <p className="text-sm text-gray-700">{riskData.stats?.sentiment?.details}</p>
          </div>
        </div>

        {/* Risk Factors Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Risk Factors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {riskData.riskFactors?.map((factor, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition cursor-pointer"
                onClick={() => setExpandedFactor(expandedFactor === idx ? null : idx)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{factor.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{factor.description}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(factor.status)}`}>
                    {factor.status.toUpperCase()}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Risk Score</span>
                    <span className={getRiskColor(factor.score)}>
                      {factor.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getRiskBarColor(factor.score)} transition-all duration-500`}
                      style={{ width: `${factor.score}%` }}
                    ></div>
                  </div>
                </div>
                {expandedFactor === idx && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Why this matters:</span> This factor has a {factor.status} impact on your overall risk.
                      Score is based on current market conditions and company-specific signals.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Market Demand and Watch Signals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Demand for Your Skills</h3>
            <div className="space-y-3">
              {riskData.marketDemand?.slice(0, 5).map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.skill}</span>
                    <span className="text-gray-500">{item.demand}% demand</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.demand}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Watch For</h3>
            <div className="space-y-3">
              {riskData.watchSignals?.map((signal, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-gray-700">{signal}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommended Actions</h3>
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

      {/* Action Plan Modal */}
      {showActionPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your Action Plan</h2>
                <p className="text-sm text-gray-500">Based on your {riskData.riskLevel} risk level</p>
              </div>
              <button
                onClick={() => setShowActionPlan(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {actionPlan.map((phase) => (
                <div key={phase.step} className="mb-6 last:mb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                      {phase.step}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{phase.title}</h3>
                  </div>
                  <div className="ml-11 space-y-2">
                    {phase.tasks.map((task, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition">
                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        <span className="text-sm text-gray-700">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowActionPlan(false);
                    downloadReport('text');
                  }}
                  className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                >
                  Download Full Action Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}