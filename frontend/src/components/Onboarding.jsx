"use client";
// components/Onboarding.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [customCompany, setCustomCompany] = useState(false);
  const [customRole, setCustomRole] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    department: "",
    role: "",
    level: "",
    tenure: "",
    skills: "",
    lookingFor: "",
    priority: ""
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    console.log("Onboarding mounted - User data:", userData);
    console.log("Token exists:", !!token);
    
    if (!userData || !token) {
      console.log("No user or token, redirecting to login");
      router.replace('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    const completed = localStorage.getItem(`onboarding_complete_${parsedUser.id}`);
    console.log(`Onboarding completion check for user ${parsedUser.id}:`, completed);
    
    if (completed === 'true') {
      console.log("User already completed onboarding, redirecting to dashboard");
      router.replace('/dashboard');
    }
  }, [router]);

  const companies = [
    "Meta", "Google", "Amazon", "Microsoft", "Netflix", 
    "Apple", "Stripe", "Uber", "Airbnb", "Salesforce", 
    "Tesla", "LinkedIn", "Twitter/X", "Adobe", "Oracle",
    "Other"
  ];
  
  const departments = [
    "Engineering", "Product", "Sales", "Marketing", 
    "HR", "Finance", "Operations", "Data Science", "Design",
    "Customer Success", "Legal", "IT", "Security", "Admin"
  ];
  
  const levels = [
    "Entry (L3)", "Junior (L4)", "Senior (L5)", 
    "Staff (L6)", "Senior Staff (L7)", "Principal (L8+)",
    "Manager", "Senior Manager", "Director", "VP+"
  ];

  const lookingForOptions = [
    "New job opportunities",
    "Skill development",
    "Networking connections",
    "Interview preparation",
    "Resume feedback",
    "All of the above"
  ];

  const priorityOptions = [
    "Find a new role ASAP",
    "Upskill before searching",
    "Explore options slowly",
    "Just gathering information"
  ];

  const getRoleOptions = (department) => {
    const roles = {
      "Engineering": [
        "Software Engineer", "Senior Software Engineer", "Staff Software Engineer",
        "Frontend Engineer", "Backend Engineer", "Full Stack Engineer",
        "DevOps Engineer", "Site Reliability Engineer", "Data Engineer",
        "Engineering Manager", "Technical Lead", "Mobile Engineer",
        "QA Engineer", "Security Engineer", "Infrastructure Engineer",
        "Other"
      ],
      "Product": [
        "Product Manager", "Senior Product Manager", "Group Product Manager",
        "Product Owner", "Technical Product Manager", "Associate Product Manager",
        "Product Analyst", "Product Operations", "Other"
      ],
      "Sales": [
        "Account Executive", "Sales Manager", "Sales Development Representative",
        "Customer Success Manager", "Solutions Engineer", "Sales Director",
        "Enterprise Account Executive", "Sales Operations", "Other"
      ],
      "Marketing": [
        "Marketing Manager", "Product Marketing Manager", "Growth Marketing Manager",
        "Content Marketing Manager", "SEO Specialist", "Social Media Manager",
        "Brand Manager", "Digital Marketing Manager", "Other"
      ],
      "Data Science": [
        "Data Scientist", "Senior Data Scientist", "Data Analyst",
        "Machine Learning Engineer", "Analytics Manager", "Data Engineer",
        "Business Intelligence Analyst", "Other"
      ],
      "Design": [
        "Product Designer", "UX Designer", "UI Designer",
        "UX Researcher", "Creative Director", "Visual Designer",
        "Design Manager", "Other"
      ],
      "Finance": [
        "Finance Manager", "Financial Analyst", "Senior Financial Analyst",
        "FP&A Manager", "Accounting Manager", "Controller",
        "Treasury Analyst", "Other"
      ],
      "HR": [
        "HR Manager", "Recruiter", "Talent Acquisition Specialist",
        "People Operations Manager", "HR Business Partner", "Benefits Administrator",
        "Other"
      ],
      "Operations": [
        "Operations Manager", "Project Manager", "Program Manager",
        "Business Operations Manager", "Supply Chain Manager", "Logistics Coordinator",
        "Other"
      ],
      "Customer Success": [
        "Customer Success Manager", "Account Manager", "Support Specialist",
        "Customer Experience Manager", "Implementation Specialist", "Other"
      ]
    };
    
    return roles[department] || ["Other"];
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    if (field === 'department') {
      setFormData(prev => ({ ...prev, role: "" }));
      setCustomRole(false);
    }
    
    if (field === 'company' && value === 'Other') {
      setCustomCompany(true);
      setFormData(prev => ({ ...prev, company: "" }));
    } else if (field === 'company') {
      setCustomCompany(false);
    }
  };

  const handleCustomCompanyChange = (value) => {
    setFormData(prev => ({ ...prev, company: value }));
  };

  const handleRoleChange = (value) => {
    if (value === 'Other') {
      setCustomRole(true);
      setFormData(prev => ({ ...prev, role: "" }));
    } else {
      setCustomRole(false);
      setFormData(prev => ({ ...prev, role: value }));
    }
  };

  const handleCustomRoleChange = (value) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = () => {
    setLoading(true);
    
    console.log("Completing onboarding with data:", formData);
    console.log("Current user:", user);
    
    if (user && user.id) {
      const storageKey = `user_profile_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(formData));
      localStorage.setItem('user_profile', JSON.stringify(formData));
      localStorage.setItem(`onboarding_complete_${user.id}`, 'true');
      
      console.log("Saved to localStorage:");
      console.log("  -", storageKey, JSON.stringify(formData));
      console.log("  - onboarding_complete_"+user.id, 'true');
      
      const verifyFlag = localStorage.getItem(`onboarding_complete_${user.id}`);
      console.log("Verification - completion flag saved:", verifyFlag);
      
      if (verifyFlag === 'true') {
        console.log("Redirecting to dashboard...");
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      } else {
        console.error("Failed to save completion flag!");
        setLoading(false);
      }
    } else {
      console.error("No user ID found!");
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const roleOptions = getRoleOptions(formData.department);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Step {step} of 4</span>
            <span className="text-sm text-gray-500">{Math.round((step / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Welcome {user.firstname || 'to RelaunchAI'}!
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Tell us about your role</h2>
              <p className="text-gray-600">This helps us personalize your analysis and recommendations</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Company <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                >
                  <option value="">Select your company</option>
                  {companies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
                {customCompany && (
                  <input
                    type="text"
                    placeholder="Enter your company name"
                    value={formData.company}
                    onChange={(e) => handleCustomCompanyChange(e.target.value)}
                    className="mt-3 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Department <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                >
                  <option value="">Select your department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role Title <span className="text-red-500">*</span></label>
                {formData.department ? (
                  <>
                    <select
                      required
                      value={customRole ? "Other" : formData.role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                    >
                      <option value="">Select your role</option>
                      {roleOptions.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    {customRole && (
                      <input
                        type="text"
                        placeholder="Enter your specific role"
                        value={formData.role}
                        onChange={(e) => handleCustomRoleChange(e.target.value)}
                        className="mt-3 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    )}
                  </>
                ) : (
                  <div className="text-gray-400 text-sm p-3 bg-gray-50 rounded-xl">
                    Please select a department first to see relevant roles
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                disabled={!formData.company || !formData.department || !formData.role}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Experience Level
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">What's your experience level?</h2>
              <p className="text-gray-600">This helps us understand your career stage</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Level <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formData.level}
                  onChange={(e) => handleChange('level', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                >
                  <option value="">Select your level</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">How long have you been at your current company?</label>
                <select
                  value={formData.tenure}
                  onChange={(e) => handleChange('tenure', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                >
                  <option value="">Select tenure</option>
                  <option value="< 1 year">&lt; 1 year</option>
                  <option value="1-2 years">1-2 years</option>
                  <option value="2-4 years">2-4 years</option>
                  <option value="4-6 years">4-6 years</option>
                  <option value="6+ years">6+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Key Skills (comma separated)</label>
                <textarea
                  placeholder="e.g., Python, Financial Analysis, Product Strategy, AWS, Leadership"
                  value={formData.skills}
                  onChange={(e) => handleChange('skills', e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Separate skills with commas. List your strongest skills first.</p>
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-between">
              <button onClick={handleBack} className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all">← Back</button>
              <button onClick={handleNext} disabled={!formData.level} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Your Goals
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">What are you looking for?</h2>
              <p className="text-gray-600">This helps us tailor your recommendations</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">I'm primarily looking for: <span className="text-red-500">*</span></label>
                <div className="space-y-3">
                  {lookingForOptions.map((option, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                      <input type="radio" name="lookingFor" value={option} checked={formData.lookingFor === option} onChange={(e) => handleChange('lookingFor', e.target.value)} className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">My current priority is: <span className="text-red-500">*</span></label>
                <div className="space-y-3">
                  {priorityOptions.map((option, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                      <input type="radio" name="priority" value={option} checked={formData.priority === option} onChange={(e) => handleChange('priority', e.target.value)} className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-between">
              <button onClick={handleBack} className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all">← Back</button>
              <button onClick={handleNext} disabled={!formData.lookingFor || !formData.priority} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Continue →</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Almost There!
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Review Your Profile</h2>
              <p className="text-gray-600">Confirm your information to get personalized insights</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-500">Company</span>
                <span className="font-medium text-gray-900">{formData.company}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-500">Department</span>
                <span className="font-medium text-gray-900">{formData.department}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-500">Role</span>
                <span className="font-medium text-gray-900">{formData.role}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-500">Level</span>
                <span className="font-medium text-gray-900">{formData.level}</span>
              </div>
              {formData.tenure && (
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-500">Tenure</span>
                  <span className="font-medium text-gray-900">{formData.tenure}</span>
                </div>
              )}
              {formData.skills && (
                <div className="flex justify-between items-start pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-500">Skills</span>
                  <span className="font-medium text-gray-900 text-right max-w-[60%]">{formData.skills}</span>
                </div>
              )}
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-500">Looking For</span>
                <span className="font-medium text-gray-900">{formData.lookingFor}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Priority</span>
                <span className="font-medium text-gray-900">{formData.priority}</span>
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-between">
              <button onClick={handleBack} className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all">← Back</button>
              <button onClick={handleComplete} disabled={loading} className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving your profile...</span>
                  </div>
                ) : (
                  "Complete & Go to Dashboard →"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}