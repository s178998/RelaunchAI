// pages/app/TransitionHub.jsx
import { useState, useEffect, useContext, useRef } from "react";
import authContext from "../../context/AuthContext";
import apiService from "../../services/api";

export default function TransitionHub() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [transitionData, setTransitionData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [completedTasks, setCompletedTasks] = useState({});
  const { user } = useContext(authContext);
  const hasFetched = useRef(false);

  // Load user from localStorage
  useEffect(() => {
    const loadUser = () => {
      if (user && user.id) {
        setCurrentUser(user);
      } else {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setCurrentUser(parsedUser);
        }
      }
    };
    loadUser();
  }, [user]);

  useEffect(() => {
    if (hasFetched.current) return;
    
    const fetchTransitionData = async () => {
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
        
        // Get risk analysis to personalize transition data
        const riskResult = await apiService.analyzeRisk(profile);
        
        // Personalize transition data based on user's company and risk level
        const personalizedData = {
          company: profile.company,
          role: profile.role,
          riskLevel: riskResult.riskLevel,
          riskScore: riskResult.riskScore,
          severanceEstimate: calculateSeveranceEstimate(profile),
          marketOutlook: getMarketOutlook(profile.role),
          recommendedActions: getRecommendedActions(riskResult.riskLevel, profile),
        };
        
        setTransitionData(personalizedData);
        hasFetched.current = true;
      } catch (err) {
        console.error("Failed to fetch transition data:", err);
        setTransitionData(getFallbackData());
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchTransitionData();
    }
  }, [currentUser]);

  // Helper functions
  const calculateSeveranceEstimate = (profile) => {
    const basePay = 12;
    let yearsBonus = 0;
    if (profile.tenure) {
      const years = parseInt(profile.tenure) || 1;
      yearsBonus = years * 2;
    }
    const total = basePay + yearsBonus;
    const estimatedAmount = total * 10000;
    return {
      weeks: total,
      amount: `$${estimatedAmount.toLocaleString()}+`
    };
  };

  const getMarketOutlook = (role) => {
    const outlooks = {
      "Software Engineer": { demand: "High", timeToHire: "2-4 weeks", avgSalary: "$150k - $200k" },
      "Product Manager": { demand: "Medium", timeToHire: "3-6 weeks", avgSalary: "$140k - $190k" },
      "Data Scientist": { demand: "High", timeToHire: "2-5 weeks", avgSalary: "$145k - $195k" },
      "DevOps Engineer": { demand: "High", timeToHire: "2-4 weeks", avgSalary: "$155k - $210k" },
    };
    return outlooks[role] || { demand: "Medium", timeToHire: "3-5 weeks", avgSalary: "$130k - $180k" };
  };

  const getRecommendedActions = (riskLevel, profile) => {
    const actions = {
      high: [
        "Update your resume and LinkedIn immediately",
        "Start networking with former colleagues",
        "Apply to at least 10 jobs per week",
        "Consider contract or freelance work",
        "Build emergency fund for 6-9 months"
      ],
      medium: [
        "Refresh your portfolio and GitHub",
        "Connect with recruiters in your industry",
        "Take online courses to upskill",
        "Update your career documents",
        "Build emergency fund for 3-6 months"
      ],
      low: [
        "Continue skill development",
        "Maintain professional network",
        "Document your achievements",
        "Explore growth opportunities",
        "Build emergency fund for 3 months"
      ]
    };
    return actions[riskLevel?.toLowerCase()] || actions.medium;
  };

  const getFallbackData = () => ({
    company: "Your Company",
    role: "Your Role",
    riskLevel: "Moderate",
    riskScore: 50,
    severanceEstimate: { weeks: 14, amount: "$45,000+" },
    marketOutlook: { demand: "Medium", timeToHire: "3-5 weeks", avgSalary: "$130k - $180k" },
    recommendedActions: getRecommendedActions("medium", {})
  });

  // Download Severance Checklist
  const downloadSeveranceChecklist = () => {
    const checklist = `SEVERANCE CHECKLIST - ${transitionData?.company || "Your Company"}
Generated: ${new Date().toLocaleString()}

☐ Step 1: Initial Review
  - Don't sign immediately (you have 21-45 days)
  - Read the entire agreement carefully
  - Note any confusing terms or sections
  - Check calculation of payments

☐ Step 2: Document Gathering
  - Collect all employment documents
  - Save performance reviews
  - Download pay stubs
  - Save equity grant documents
  - Archive important emails

☐ Step 3: Legal Review
  - Schedule consultation with employment attorney
  - Ask about non-compete clauses
  - Review intellectual property provisions
  - Check confidentiality requirements

☐ Step 4: Negotiation Points
  - Extended health insurance (COBRA)
  - Outplacement services
  - Extended exercise window for options
  - Positive reference letter
  - Pro-rated bonus

☐ Step 5: Timeline Management
  - Note signature deadline
  - COBRA election: 60 days
  - 401(k) rollover: 90 days
  - Stock option exercise window

☐ Step 6: Financial Planning
  - Calculate total package value
  - Plan for taxes
  - Update budget
  - Build emergency fund

☐ Step 7: Career Transition
  - Update LinkedIn
  - Request recommendations
  - Join alumni network
  - Start job search

Remember: Never sign under pressure. You have the right to take time and seek advice.`;
    
    const blob = new Blob([checklist], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `severance_checklist_${transitionData?.company}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download Resume Templates
  const downloadResumeTemplate = (format) => {
    let content = '';
    
    if (format === 'standard') {
      content = `RESUME TEMPLATE - STANDARD FORMAT

[YOUR NAME]
[Phone] • [Email] • [LinkedIn URL]

PROFESSIONAL SUMMARY
[2-3 sentences highlighting your experience, key skills, and career goals]

TECHNICAL SKILLS
• Skill 1 • Skill 2 • Skill 3
• Tool 1 • Tool 2 • Tool 3

WORK EXPERIENCE
[Company Name] | [Location]
[Job Title] | [Start Date] - [End Date]
• Key achievement with metric
• Key responsibility with specific result

EDUCATION
[Degree] in [Field] | [University Name] | [Year]

CERTIFICATIONS
• Certification Name | Issuing Body | Year`;
    } else if (format === 'ats') {
      content = `ATS-FRIENDLY RESUME TEMPLATE

[FIRST NAME] [LAST NAME]
[Phone] | [Email] | [LinkedIn URL]

SKILLS
Skill 1, Skill 2, Skill 3, Skill 4, Skill 5

SUMMARY
[2-3 sentence summary with keywords from job descriptions]

EXPERIENCE

[COMPANY NAME] | [CITY, STATE]
[Job Title] | [MONTH YEAR - MONTH YEAR]
• Action verb description with result/metric
• Action verb description with result/metric

EDUCATION

[Degree] in [Field] | [UNIVERSITY NAME] | [YEAR]

Note: Use standard fonts (Arial, Calibri), avoid tables and columns`;
    } else {
      content = `TECH RESUME TEMPLATE

[YOUR NAME]
[Phone] | [Email] | [GitHub] | [LinkedIn]

TECHNICAL SKILLS
Languages: Language 1, Language 2, Language 3
Frameworks: Framework 1, Framework 2
Tools: Tool 1, Tool 2, Tool 3
Cloud: AWS/Azure/GCP services

EXPERIENCE

[COMPANY NAME] | [DATES]
[Job Title]
• Architected and built system handling X requests/second
• Led team of X engineers delivering project on schedule
• Reduced costs by X% through optimization

EDUCATION
[BS/MS] in [Computer Science] | [University] | [Year]`;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume_template_${format}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openResourceLink = (url) => {
    window.open(url, '_blank');
  };

  const toggleTask = (taskId) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your transition toolkit...</p>
        </div>
      </div>
    );
  }

  if (!transitionData) return null;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header - Personalized */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Career Transition Hub · {transitionData.company}
            </div>
            <button
              onClick={() => setShowChecklist(true)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Master Checklist
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
            Your Transition Toolkit
          </h1>
          <p className="text-gray-600 text-base max-w-3xl">
            Based on your {transitionData.riskLevel} risk level as a {transitionData.role} at {transitionData.company}, 
            here are personalized resources to help you navigate your career transition.
          </p>
        </div>

        {/* Quick Stats - Personalized */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="text-2xl font-bold text-blue-600">{transitionData.severanceEstimate?.amount || "$15k+"}</div>
            <div className="text-xs text-gray-600 mt-1">Est. Severance Package</div>
            <div className="text-xs text-gray-400 mt-1">{transitionData.severanceEstimate?.weeks || 12} weeks base</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="text-2xl font-bold text-green-600">{transitionData.marketOutlook?.timeToHire || "3-6 months"}</div>
            <div className="text-xs text-gray-600 mt-1">Est. Time to Hire</div>
            <div className="text-xs text-gray-400 mt-1">Market demand: {transitionData.marketOutlook?.demand}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <div className="text-2xl font-bold text-purple-600">{transitionData.marketOutlook?.avgSalary || "$150k"}</div>
            <div className="text-xs text-gray-600 mt-1">Avg Market Salary</div>
            <div className="text-xs text-gray-400 mt-1">For {transitionData.role}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
            <div className="text-2xl font-bold text-orange-600">{transitionData.riskScore}%</div>
            <div className="text-xs text-gray-600 mt-1">Your Risk Score</div>
            <div className="text-xs text-gray-400 mt-1">{transitionData.riskLevel} risk level</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6 overflow-x-auto">
            {["overview", "severance", "benefits", "resume", "networking", "legal"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 text-sm font-medium capitalize transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Actions for You</h3>
                <div className="space-y-3">
                  {transitionData.recommendedActions?.map((step, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                        {i + 1}
                      </div>
                      <span className="text-sm text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Support Resources</h3>
                <div className="space-y-4">
                  <button 
                    onClick={() => openResourceLink('https://www.careeronestop.org')}
                    className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                  >
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Career Coach</p>
                      <p className="text-xs text-gray-500">Free 1-on-1 sessions</p>
                    </div>
                    <span className="text-blue-600 text-sm">Schedule →</span>
                  </button>
                  <button 
                    onClick={() => openResourceLink('https://www.mentalhealth.gov')}
                    className="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
                  >
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Mental Health Support</p>
                      <p className="text-xs text-gray-500">24/7 counseling available</p>
                    </div>
                    <span className="text-green-600 text-sm">Access →</span>
                  </button>
                  <button 
                    onClick={() => openResourceLink('https://www.2600hz.com/financial-planning')}
                    className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                  >
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Financial Planning</p>
                      <p className="text-xs text-gray-500">Free consultation</p>
                    </div>
                    <span className="text-purple-600 text-sm">Book →</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Insights for {transitionData.role}s</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-100 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900">Current Demand</p>
                    <p className="text-lg font-bold text-green-600 mt-1">{transitionData.marketOutlook?.demand}</p>
                    <p className="text-xs text-gray-400 mt-2">National average for {transitionData.role}</p>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900">Time to Hire</p>
                    <p className="text-lg font-bold text-blue-600 mt-1">{transitionData.marketOutlook?.timeToHire}</p>
                    <p className="text-xs text-gray-400 mt-2">From application to offer</p>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900">Salary Range</p>
                    <p className="text-lg font-bold text-purple-600 mt-1">{transitionData.marketOutlook?.avgSalary}</p>
                    <p className="text-xs text-gray-400 mt-2">Based on your experience level</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Severance Tab */}
          {activeTab === "severance" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estimated Severance Package</h3>
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Base Pay</span>
                    <span className="text-sm font-medium text-gray-900">12 weeks</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Years of Service Bonus</span>
                    <span className="text-sm font-medium text-gray-900">+{Math.floor((transitionData.severanceEstimate?.weeks || 12) - 12)} weeks/year</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Unused PTO Payout</span>
                    <span className="text-sm font-medium text-gray-900">100%</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Bonus for Signing Release</span>
                    <span className="text-sm font-medium text-gray-900">$5,000 - $15,000</span>
                  </div>
                  <div className="flex justify-between py-2 pt-3">
                    <span className="text-base font-semibold text-gray-900">Total Estimated</span>
                    <span className="text-base font-bold text-blue-600">{transitionData.severanceEstimate?.amount}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4 text-center">
                  *Based on industry averages for {transitionData.company}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Steps to Take</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm font-medium text-red-900">Don't sign immediately</p>
                    <p className="text-xs text-red-700 mt-1">You typically have 21-45 days to review</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900">Get legal review</p>
                    <p className="text-xs text-yellow-700 mt-1">Free consultation available</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Negotiate if possible</p>
                    <p className="text-xs text-blue-700 mt-1">Especially equity and extended benefits</p>
                  </div>
                </div>
                <button 
                  onClick={downloadSeveranceChecklist}
                  className="w-full mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                >
                  Download Severance Checklist
                </button>
              </div>
            </div>
          )}

          {/* Benefits Tab */}
          {activeTab === "benefits" && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits to Protect</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">Health Insurance (COBRA)</p>
                    <p className="text-sm text-gray-600">You have 60 days to elect coverage</p>
                    <button 
                      onClick={() => openResourceLink('https://www.dol.gov/general/topic/health-plans/cobra')}
                      className="text-xs text-blue-600 mt-1 hover:underline"
                    >
                      Learn about COBRA →
                    </button>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">401(k) & Retirement</p>
                    <p className="text-sm text-gray-600">Roll over to IRA or new employer plan</p>
                    <button 
                      onClick={() => openResourceLink('https://www.irs.gov/retirement-plans/plan-participant-employee/rollovers-of-retirement-plan-and-ira-distributions')}
                      className="text-xs text-blue-600 mt-1 hover:underline"
                    >
                      Rollover guide →
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">Stock Options & RSUs</p>
                    <p className="text-sm text-gray-600">Exercise window: typically 90 days</p>
                    <button 
                      onClick={() => openResourceLink('https://www.sec.gov/education/capital-raising/equity-options')}
                      className="text-xs text-blue-600 mt-1 hover:underline"
                    >
                      Understand your equity →
                    </button>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">Career Support</p>
                    <p className="text-sm text-gray-600">Often included in severance packages</p>
                    <button 
                      onClick={() => openResourceLink('https://www.careeronestop.org')}
                      className="text-xs text-blue-600 mt-1 hover:underline"
                    >
                      Find career resources →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resume Tab */}
          {activeTab === "resume" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume Resources</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => downloadResumeTemplate('standard')}
                    className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <p className="font-medium text-gray-900">Download Standard Resume Template</p>
                    <p className="text-xs text-gray-500">Traditional format for all industries</p>
                  </button>
                  <button 
                    onClick={() => downloadResumeTemplate('ats')}
                    className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                  >
                    <p className="font-medium text-blue-900">ATS-Friendly Template</p>
                    <p className="text-xs text-blue-700">Optimized for automated screening</p>
                  </button>
                  <button 
                    onClick={() => downloadResumeTemplate('tech')}
                    className="w-full text-left p-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
                  >
                    <p className="font-medium text-green-900">Tech Industry Template</p>
                    <p className="text-xs text-green-700">For software engineers and technical roles</p>
                  </button>
                  <button 
                    onClick={() => openResourceLink('https://www.linkedin.com/help/linkedin/answer/a1335796')}
                    className="w-full text-left p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                  >
                    <p className="font-medium text-purple-900">LinkedIn Profile Guide</p>
                    <p className="text-xs text-purple-700">Optimize your professional presence</p>
                  </button>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Gap Analysis</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Technical Skills</span>
                      <span className="text-green-600">Strong</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Soft Skills</span>
                      <span className="text-green-600">Strong</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "80%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Leadership</span>
                      <span className="text-yellow-600">Developing</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Interview Prep</span>
                      <span className="text-yellow-600">Needs Work</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "55%" }}></div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab("skills-learning")}
                    className="w-full mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                  >
                    Create Personalized Learning Plan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Networking Tab */}
          {activeTab === "networking" && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alumni Network</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-3">Former {transitionData.company} colleagues who can help:</p>
                  <div className="space-y-3">
                    <button 
                      onClick={() => openResourceLink('https://www.linkedin.com')}
                      className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-left"
                    >
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">JD</div>
                      <div>
                        <p className="font-medium text-gray-900">Jane Doe</p>
                        <p className="text-xs text-gray-500">Now at Google</p>
                      </div>
                    </button>
                    <button 
                      onClick={() => openResourceLink('https://www.linkedin.com')}
                      className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-left"
                    >
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">MS</div>
                      <div>
                        <p className="font-medium text-gray-900">Mike Smith</p>
                        <p className="text-xs text-gray-500">Now at Stripe</p>
                      </div>
                    </button>
                    <button 
                      onClick={() => openResourceLink('https://www.linkedin.com')}
                      className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-left"
                    >
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">SL</div>
                      <div>
                        <p className="font-medium text-gray-900">Sarah Lee</p>
                        <p className="text-xs text-gray-500">Tech Recruiter</p>
                      </div>
                    </button>
                  </div>
                </div>
                <div className="border-l border-gray-200 pl-6">
                  <p className="text-sm text-gray-600 mb-3">Recommended groups to join:</p>
                  <div className="space-y-3">
                    <button 
                      onClick={() => openResourceLink('https://www.linkedin.com/groups')}
                      className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                    >
                      <p className="font-medium text-gray-900">{transitionData.company} Alumni Network</p>
                      <p className="text-xs text-gray-500">Connect with former colleagues</p>
                    </button>
                    <button 
                      onClick={() => openResourceLink('https://www.meetup.com/topics/tech-careers/')}
                      className="w-full text-left p-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
                    >
                      <p className="font-medium text-gray-900">Tech Layoffs Support Group</p>
                      <p className="text-xs text-gray-500">Weekly virtual meetups</p>
                    </button>
                    <button 
                      onClick={() => openResourceLink('https://join.slack.com/t/tech-careers/shared_invite/zt-xxxxx')}
                      className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                      Join Slack Community
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Legal Tab */}
          {activeTab === "legal" && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal Resources</h3>
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="font-medium text-amber-900">Important: Do not sign anything without review</p>
                  <p className="text-sm text-amber-700 mt-1">You have 21-45 days to review the severance agreement depending on your state</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => openResourceLink('https://www.americanbar.org/groups/legal_services/flh-home/')}
                    className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <p className="font-medium text-gray-900">Free Legal Consultation</p>
                    <p className="text-sm text-gray-600 mt-1">30 min with employment attorney</p>
                    <span className="text-blue-600 text-sm mt-1 inline-block">Schedule →</span>
                  </button>
                  <button 
                    onClick={() => openResourceLink('https://www.dol.gov/agencies/whd/layoffs')}
                    className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <p className="font-medium text-gray-900">Know Your Rights</p>
                    <p className="text-sm text-gray-600 mt-1">WARN Act, discrimination laws, and more</p>
                    <span className="text-blue-600 text-sm mt-1 inline-block">Learn more →</span>
                  </button>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Documents to keep:</span> Offer letter, performance reviews, 
                    equity grants, severance agreement, and any email communications about your role
                  </p>
                </div>
                <button 
                  onClick={() => downloadSeveranceChecklist()}
                  className="w-full mt-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                >
                  Download Legal Rights Checklist
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Master Checklist Modal */}
      {showChecklist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Career Transition Checklist</h2>
                <p className="text-sm text-gray-500">Track your progress through this transition</p>
              </div>
              <button
                onClick={() => setShowChecklist(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {[
                { title: "Immediate Actions (Week 1)", tasks: [
                  "Review severance agreement timeline",
                  "Save all important documents locally",
                  "Update LinkedIn profile",
                  "Draft a list of references",
                  "Calculate monthly expenses and runway"
                ]},
                { title: "Legal & Financial (Week 1-2)", tasks: [
                  "Schedule legal consultation",
                  "Review COBRA or marketplace insurance",
                  "Understand stock option exercise window",
                  "Plan 401(k) rollover strategy",
                  "File for unemployment benefits"
                ]},
                { title: "Career Preparation (Week 2-3)", tasks: [
                  "Update resume with recent achievements",
                  "Create portfolio or work samples",
                  "Start reaching out to network",
                  "Set up job alerts on key platforms",
                  "Practice interview questions"
                ]},
                { title: "Job Search (Week 3-4)", tasks: [
                  "Apply to 10+ positions per week",
                  "Attend industry networking events",
                  "Complete skill assessments",
                  "Prepare for technical interviews",
                  "Follow up with recruiters"
                ]},
                { title: "Ongoing (Month 2+)", tasks: [
                  "Track all applications and follow-ups",
                  "Continue learning and upskilling",
                  "Expand professional network",
                  "Stay positive and maintain routine",
                  "Celebrate small wins"
                ]}
              ].map((section, idx) => (
                <div key={idx}>
                  <h3 className="text-md font-semibold text-gray-900 mb-3">{section.title}</h3>
                  <div className="space-y-2">
                    {section.tasks.map((task, taskIdx) => {
                      const taskId = `${idx}-${taskIdx}`;
                      return (
                        <label key={taskIdx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!completedTasks[taskId]}
                            onChange={() => toggleTask(taskId)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300"
                          />
                          <span className={`text-sm ${completedTasks[taskId] ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                            {task}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    const completedCount = Object.values(completedTasks).filter(Boolean).length;
                    alert(`You've completed ${completedCount} out of ${Object.keys(completedTasks).length} tasks! Keep going!`);
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                >
                  Save Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}