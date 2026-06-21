// pages/app/ResumeBuilder.jsx - Complete with Email Notifications & Response Tracking
import { useState, useEffect, useContext, useRef } from "react";
import authContext from "../../context/AuthContext";

export default function ResumeBuilder() {
  const [currentUser, setCurrentUser] = useState(null);
  const { user } = useContext(authContext);
  const [step, setStep] = useState("questions");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({
    fullName: "",
    professionalTitle: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    summary: "",
    experience: [],
    education: [],
    skills: "",
    achievements: "",
    certifications: "",
    languages: ""
  });
  const [resume, setResume] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [generating, setGenerating] = useState(false);
  const [showAITips, setShowAITips] = useState(true);
  const [showAutoApply, setShowAutoApply] = useState(false);
  const [applyingJobs, setApplyingJobs] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  // Questions array
  const questions = [
    {
      id: "fullName",
      question: "What's your full name?",
      type: "text",
      placeholder: "John Michael Doe",
      required: true,
      helpText: "Use your professional name as you want it to appear on your resume"
    },
    {
      id: "professionalTitle",
      question: "What's your current professional title?",
      type: "text",
      placeholder: "Senior Software Engineer",
      required: true,
      helpText: "Your current job title or desired role"
    },
    {
      id: "email",
      question: "What's your email address?",
      type: "email",
      placeholder: "john.doe@example.com",
      required: true,
      helpText: "Where you'll receive job application updates"
    },
    {
      id: "phone",
      question: "What's your phone number?",
      type: "tel",
      placeholder: "(555) 123-4567",
      required: true,
      helpText: "Include country code if applying internationally"
    },
    {
      id: "location",
      question: "Where are you located?",
      type: "text",
      placeholder: "San Francisco, CA",
      required: true,
      helpText: "City and state, or 'Remote' if applicable"
    },
    {
      id: "linkedin",
      question: "What's your LinkedIn URL?",
      type: "url",
      placeholder: "linkedin.com/in/johndoe",
      required: false,
      helpText: "Recruiters will check this - make sure it's updated"
    },
    {
      id: "github",
      question: "What's your GitHub/Portfolio URL?",
      type: "url",
      placeholder: "github.com/johndoe",
      required: false,
      helpText: "Especially important for technical roles"
    },
    {
      id: "summary",
      question: "Write a brief professional summary (2-3 sentences)",
      type: "textarea",
      placeholder: "Results-driven Software Engineer with 5+ years of experience...",
      required: true,
      helpText: "Highlight your key strengths and career highlights"
    },
    {
      id: "experience",
      question: "Tell us about your work experience",
      type: "experience",
      required: true,
      helpText: "Add your most relevant positions (you can add multiple)"
    },
    {
      id: "education",
      question: "Tell us about your education",
      type: "education",
      required: true,
      helpText: "Degrees, certifications, or relevant coursework"
    },
    {
      id: "skills",
      question: "What are your top technical/professional skills?",
      type: "skills",
      placeholder: "Python, React, Project Management, AWS",
      required: true,
      helpText: "Separate skills with commas - list your strongest ones first"
    },
    {
      id: "achievements",
      question: "What are your key achievements?",
      type: "achievements",
      placeholder: "Led team to increase revenue by 40%, Won Employee of the Year",
      required: false,
      helpText: "Quantifiable achievements work best (e.g., 'Increased sales by 30%')"
    },
    {
      id: "certifications",
      question: "What certifications do you have?",
      type: "text",
      placeholder: "AWS Certified, PMP, Scrum Master",
      required: false,
      helpText: "List relevant professional certifications"
    },
    {
      id: "languages",
      question: "What languages do you speak?",
      type: "text",
      placeholder: "English (Native), Spanish (Fluent)",
      required: false,
      helpText: "Include proficiency level"
    }
  ];

  // Load user data on mount
  useEffect(() => {
    const loadUser = () => {
      if (user && user.id) {
        setCurrentUser(user);
        
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setAnswers(prev => ({
            ...prev,
            fullName: `${parsed.firstname || ''} ${parsed.lastname || ''}`.trim(),
            email: parsed.email || ''
          }));
        }
        
        const profile = localStorage.getItem(`user_profile_${user.id}`);
        if (profile) {
          const parsedProfile = JSON.parse(profile);
          setAnswers(prev => ({
            ...prev,
            professionalTitle: parsedProfile.role || "",
            skills: parsedProfile.skills || ""
          }));
        }
      }
    };
    loadUser();
    
    // Load saved applications
    const savedApplications = localStorage.getItem('job_applications');
    if (savedApplications) {
      setAppliedJobs(JSON.parse(savedApplications));
    }
    
    const savedNotifications = localStorage.getItem('job_notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, [user]);

  // Simulate email notification
  const sendEmailNotification = (job, type, details) => {
    const emailContent = {
      application: {
        subject: `✅ Application Confirmation: ${job.title} at ${job.company}`,
        body: `Dear ${answers.fullName},\n\nThank you for applying to the ${job.title} position at ${job.company}. We have received your application and our recruiting team will review it within 5-7 business days.\n\nApplication Details:\n• Position: ${job.title}\n• Company: ${job.company}\n• Location: ${job.location}\n• Applied: ${new Date().toLocaleString()}\n\nNext Steps:\n1. Our team will review your qualifications\n2. If selected, you'll receive an interview invitation\n3. Check your email regularly for updates\n\nBest regards,\n${job.company} Recruiting Team`
      },
      interview: {
        subject: `🎉 Interview Invitation: ${job.title} at ${job.company}`,
        body: `Dear ${answers.fullName},\n\nCongratulations! Your application for the ${job.title} position at ${job.company} has impressed our team. We would like to invite you for an interview.\n\nInterview Details:\n• Date: ${details.date || "Next week"}\n• Time: ${details.time || "10:00 AM PST"}\n• Format: ${details.format || "Video Call (Zoom)"}\n• Duration: 45-60 minutes\n\nPlease confirm your availability by replying to this email.\n\nWe look forward to speaking with you!\n\nBest regards,\n${job.company} Recruiting Team`
      },
      rejection: {
        subject: `📫 Update on your application: ${job.title} at ${job.company}`,
        body: `Dear ${answers.fullName},\n\nThank you for your interest in the ${job.title} position at ${job.company}. After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.\n\nWe encourage you to apply for future openings that match your skills and experience.\n\nWe wish you the best in your job search!\n\nSincerely,\n${job.company} Recruiting Team`
      },
      offer: {
        subject: `🎊 Job Offer: ${job.title} at ${job.company}`,
        body: `Dear ${answers.fullName},\n\nWe are thrilled to offer you the position of ${job.title} at ${job.company}! Your skills, experience, and enthusiasm impressed our entire interview panel.\n\nOffer Details:\n• Base Salary: ${details.salary || "$160,000 - $190,000"}\n• Equity: ${details.equity || "$50,000 RSUs"}\n• Bonus: ${details.bonus || "15% annual performance bonus"}\n• Start Date: ${details.startDate || "Flexible - within 30 days"}\n\nPlease review the attached offer letter and let us know your decision by ${details.deadline || "next Friday"}.\n\nWe're excited to potentially welcome you to the team!\n\nBest regards,\n${job.company} Recruiting Team`
      }
    };
    
    const content = emailContent[type];
    if (content) {
      console.log(`📧 Email sent to ${answers.email}:`, content.subject);
      console.log(`Message: ${content.body.substring(0, 100)}...`);
      
      // Store notification
      const newNotification = {
        id: Date.now(),
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        type: type,
        subject: content.subject,
        message: content.body,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      localStorage.setItem('job_notifications', JSON.stringify([newNotification, ...notifications]));
      
      // Show alert in UI
      alert(`📧 Email sent to ${answers.email}\nSubject: ${content.subject}`);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    }
  };

  // Simulate random responses from companies over time
  const simulateResponses = () => {
    const responses = [
      { type: "interview", probability: 0.3, delay: 3000 },
      { type: "rejection", probability: 0.5, delay: 5000 },
      { type: "offer", probability: 0.2, delay: 8000 }
    ];
    
    appliedJobs.forEach(job => {
      if (!job.responseSent) {
        const rand = Math.random();
        let responseType = null;
        
        if (rand < 0.3) responseType = "interview";
        else if (rand < 0.8) responseType = "rejection";
        else responseType = "offer";
        
        const delay = responseType === "offer" ? 8000 : responseType === "interview" ? 3000 : 5000;
        
        setTimeout(() => {
          const jobDetails = matchingJobs.find(j => j.id === job.id);
          if (jobDetails) {
            const interviewDetails = {
              date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
              time: "10:00 AM PST",
              format: "Video Call"
            };
            
            const offerDetails = {
              salary: "$175,000 - $210,000",
              equity: "$75,000 RSUs",
              bonus: "15% annual bonus",
              startDate: "Flexible",
              deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()
            };
            
            sendEmailNotification(jobDetails, responseType, 
              responseType === "interview" ? interviewDetails : 
              responseType === "offer" ? offerDetails : {});
            
            setAppliedJobs(prev => prev.map(j => 
              j.id === job.id ? { ...j, responseSent: true, responseType: responseType, respondedAt: new Date().toISOString() } : j
            ));
          }
        }, delay);
      }
    });
  };

  // Generate matching jobs
  const generateMatchingJobs = () => {
    const skills = answers.skills.toLowerCase();
    const title = answers.professionalTitle.toLowerCase();
    
    const jobListings = [
      {
        id: 1,
        title: "Senior Software Engineer",
        company: "Google",
        location: "Mountain View, CA (Remote)",
        salary: "$180k - $250k",
        skills: ["React", "Python", "AWS", "System Design"],
        description: "Join Google's core infrastructure team to build scalable solutions.",
        applyUrl: "https://careers.google.com/jobs",
        matchScore: 92
      },
      {
        id: 2,
        title: "Staff Software Engineer",
        company: "Amazon",
        location: "Seattle, WA / Remote",
        salary: "$190k - $260k",
        skills: ["AWS", "Distributed Systems", "Java", "Leadership"],
        description: "Lead technical initiatives for Amazon's e-commerce platform.",
        applyUrl: "https://amazon.jobs",
        matchScore: 88
      },
      {
        id: 3,
        title: "Senior Frontend Engineer",
        company: "Meta",
        location: "Menlo Park, CA / Remote",
        salary: "$175k - $240k",
        skills: ["React", "TypeScript", "GraphQL", "Next.js"],
        description: "Build next-generation user interfaces for billions of users.",
        applyUrl: "https://metacareers.com",
        matchScore: 85
      },
      {
        id: 4,
        title: "Software Engineer - Infrastructure",
        company: "Microsoft",
        location: "Redmond, WA / Remote",
        salary: "$165k - $230k",
        skills: ["Azure", "Kubernetes", "Go", "CI/CD"],
        description: "Design and maintain cloud infrastructure services.",
        applyUrl: "https://careers.microsoft.com",
        matchScore: 82
      },
      {
        id: 5,
        title: "Lead Software Engineer",
        company: "Stripe",
        location: "San Francisco, CA / Remote",
        salary: "$200k - $280k",
        skills: ["Ruby", "Java", "Payments", "API Design"],
        description: "Lead payment processing infrastructure team.",
        applyUrl: "https://stripe.com/jobs",
        matchScore: 79
      }
    ];
    
    const matched = jobListings
      .map(job => {
        let score = job.matchScore;
        const matchingSkills = job.skills.filter(skill => 
          skills.includes(skill.toLowerCase())
        );
        score += matchingSkills.length * 2;
        return { ...job, matchScore: Math.min(score, 98) };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
    
    setMatchingJobs(matched);
  };

  const toggleJobSelection = (jobId) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const selectAllJobs = () => {
    if (selectedJobs.length === matchingJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(matchingJobs.map(job => job.id));
    }
  };

  const autoApplyToJobs = async () => {
    setApplyingJobs(true);
    
    for (const jobId of selectedJobs) {
      const job = matchingJobs.find(j => j.id === jobId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newApplication = {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        status: "applied",
        appliedAt: new Date().toISOString(),
        responseSent: false
      };
      
      setAppliedJobs(prev => [...prev, newApplication]);
      
      // Send application confirmation email
      sendEmailNotification(job, "application", {});
    }
    
    localStorage.setItem('job_applications', JSON.stringify([...appliedJobs, ...selectedJobs.map(id => {
      const job = matchingJobs.find(j => j.id === id);
      return {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        status: "applied",
        appliedAt: new Date().toISOString(),
        responseSent: false
      };
    })]));
    
    setApplyingJobs(false);
    setShowAutoApply(false);
    alert(`✅ Successfully applied to ${selectedJobs.length} jobs! Check your email (${answers.email}) for confirmation.`);
    
    // Start simulating responses
    setTimeout(() => simulateResponses(), 2000);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
    localStorage.setItem('job_notifications', JSON.stringify(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    )));
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case "application": return "📧";
      case "interview": return "🎉";
      case "rejection": return "📫";
      case "offer": return "🎊";
      default: return "🔔";
    }
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case "application": return "bg-blue-100 border-blue-300";
      case "interview": return "bg-green-100 border-green-300";
      case "rejection": return "bg-gray-100 border-gray-300";
      case "offer": return "bg-yellow-100 border-yellow-300";
      default: return "bg-gray-100";
    }
  };

  const handleInputChange = (field, value) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  // Experience functions
  const addExperience = () => {
    setAnswers(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now(),
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: ""
      }]
    }));
  };

  const updateExperience = (id, field, value) => {
    setAnswers(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id) => {
    setAnswers(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  // Education functions
  const addEducation = () => {
    setAnswers(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now(),
        degree: "",
        field: "",
        school: "",
        location: "",
        year: "",
        gpa: ""
      }]
    }));
  };

  const updateEducation = (id, field, value) => {
    setAnswers(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id) => {
    setAnswers(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const generateResume = () => {
    setGenerating(true);
    setStep("generating");
    
    setTimeout(() => {
      const generatedResume = {
        personal: {
          fullName: answers.fullName,
          title: answers.professionalTitle,
          email: answers.email,
          phone: answers.phone,
          location: answers.location,
          linkedin: answers.linkedin,
          github: answers.github,
          summary: answers.summary
        },
        experience: answers.experience,
        education: answers.education,
        skills: answers.skills.split(',').map(s => s.trim()),
        achievements: answers.achievements ? answers.achievements.split(',').map(a => a.trim()) : [],
        certifications: answers.certifications ? answers.certifications.split(',').map(c => c.trim()) : [],
        languages: answers.languages ? answers.languages.split(',').map(l => l.trim()) : []
      };
      
      setResume(generatedResume);
      setStep("preview");
      setGenerating(false);
      
      // Auto-generate matching jobs
      generateMatchingJobs();
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      generateResume();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const isCurrentQuestionValid = () => {
    const question = questions[currentQuestion];
    if (!question.required) return true;
    
    const answer = answers[question.id];
    if (question.type === "experience") {
      return answer && answer.length > 0;
    }
    if (question.type === "education") {
      return answer && answer.length > 0;
    }
    return answer && answer.trim() !== "";
  };

  const renderQuestion = () => {
    const question = questions[currentQuestion];
    const answer = answers[question.id] || "";
    
    switch (question.type) {
      case "textarea":
        return (
          <textarea
            value={answer}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={question.placeholder}
          />
        );
      
      case "experience":
        const experiences = answer || [];
        return (
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">{exp.title || "New Position"}</h4>
                  <button
                    onClick={() => removeExperience(exp.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={exp.title || ""}
                    onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={exp.company || ""}
                    onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={exp.location || ""}
                    onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Start Date"
                      value={exp.startDate || ""}
                      onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="End Date"
                      value={exp.endDate || ""}
                      onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={exp.current || false}
                        onChange={(e) => {
                          updateExperience(exp.id, "current", e.target.checked);
                          if (e.target.checked) updateExperience(exp.id, "endDate", "Present");
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">I currently work here</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe your responsibilities and achievements...\nExample:\n• Led team of 5 engineers to rebuild main dashboard\n• Reduced load time from 8 seconds to under 2 seconds\n• Mentored 3 junior developers"
                      value={exp.description || ""}
                      onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use bullet points and include metrics</p>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addExperience}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition"
            >
              + Add Another Position
            </button>
          </div>
        );
      
      case "education":
        const educations = answer || [];
        return (
          <div className="space-y-4">
            {educations.map((edu) => (
              <div key={edu.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">{edu.degree || "New Degree"}</h4>
                  <button
                    onClick={() => removeEducation(edu.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Degree"
                    value={edu.degree || ""}
                    onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Field of Study"
                    value={edu.field || ""}
                    onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="School/University"
                    value={edu.school || ""}
                    onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={edu.year || ""}
                    onChange={(e) => updateEducation(edu.id, "year", e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="GPA (optional)"
                    value={edu.gpa || ""}
                    onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addEducation}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition"
            >
              + Add Another Degree
            </button>
          </div>
        );
      
      case "skills":
        return (
          <div>
            <textarea
              value={answer}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={question.placeholder}
            />
            <p className="text-xs text-gray-500 mt-2">Separate skills with commas</p>
          </div>
        );
      
      case "achievements":
        return (
          <div>
            <textarea
              value={answer}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={question.placeholder}
            />
            <p className="text-xs text-gray-500 mt-2">Separate achievements with commas</p>
          </div>
        );
      
      default:
        return (
          <input
            type={question.type}
            value={answer}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={question.placeholder}
          />
        );
    }
  };

  // Templates
  const templates = {
    modern: {
      name: "Modern",
      bgColor: "bg-white",
      accentColor: "text-blue-600",
      borderColor: "border-blue-200",
      headerBg: "bg-gradient-to-r from-blue-600 to-blue-700"
    },
    classic: {
      name: "Classic",
      bgColor: "bg-gray-50",
      accentColor: "text-gray-800",
      borderColor: "border-gray-300",
      headerBg: "bg-gray-800"
    },
    minimal: {
      name: "Minimal",
      bgColor: "bg-white",
      accentColor: "text-gray-600",
      borderColor: "border-gray-200",
      headerBg: "bg-gray-100"
    }
  };

  const currentTemplate = templates[selectedTemplate];

  // Generating screen
  if (step === "generating") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">✨</span>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">AI is crafting your resume...</h2>
          <p className="text-gray-600">Creating a professional layout optimized for success</p>
        </div>
      </div>
    );
  }

  // Preview screen with Auto-Apply
  if (step === "preview" && resume) {
    const unreadCount = notifications.filter(n => !n.read).length;
    
    return (
      <div className={`min-h-screen ${currentTemplate.bgColor} py-8`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header with Notifications */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Resume Ready
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Your Professional Resume</h1>
            </div>
            <div className="flex gap-2">
              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm flex items-center gap-2"
                >
                  🔔 Notifications
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-gray-200 font-semibold">Job Application Updates</div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No notifications yet. Apply to jobs to get updates!
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id}
                          className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${!notif.read ? 'bg-blue-50' : ''}`}
                          onClick={() => markNotificationAsRead(notif.id)}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-xl">{getNotificationIcon(notif.type)}</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{notif.subject}</p>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notif.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {Object.entries(templates).map(([key, t]) => (
                  <option key={key} value={key}>{t.name}</option>
                ))}
              </select>
              
              <button
                onClick={() => setStep("questions")}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition"
              >
                Edit Info
              </button>
              
              <button
                onClick={() => setShowAutoApply(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                🤖 Auto-Apply to Jobs
              </button>
            </div>
          </div>

          {/* Email Sent Indicator */}
          {emailSent && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded-lg text-green-700 text-sm flex items-center gap-2 animate-pulse">
              <span>📧</span> Email notification sent to {answers.email}!
            </div>
          )}

          {/* Resume Preview */}
          <div className={`rounded-2xl shadow-xl overflow-hidden border ${currentTemplate.borderColor}`}>
            <div className={`${currentTemplate.headerBg} px-8 py-8 text-white`}>
              <h1 className="text-4xl font-bold">{resume.personal.fullName}</h1>
              <p className="text-xl opacity-90 mt-2">{resume.personal.title}</p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm opacity-80">
                {resume.personal.email && <span>📧 {resume.personal.email}</span>}
                {resume.personal.phone && <span>📱 {resume.personal.phone}</span>}
                {resume.personal.location && <span>📍 {resume.personal.location}</span>}
              </div>
              {(resume.personal.linkedin || resume.personal.github) && (
                <div className="flex flex-wrap gap-3 mt-2 text-sm opacity-70">
                  {resume.personal.linkedin && <span>💼 {resume.personal.linkedin}</span>}
                  {resume.personal.github && <span>💻 {resume.personal.github}</span>}
                </div>
              )}
            </div>

            <div className="px-8 py-6 bg-white">
              {resume.personal.summary && (
                <div className="mb-6">
                  <h2 className={`text-lg font-semibold ${currentTemplate.accentColor} border-b pb-2 mb-3`}>Professional Summary</h2>
                  <p className="text-gray-700 leading-relaxed">{resume.personal.summary}</p>
                </div>
              )}

              {resume.experience && resume.experience.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-lg font-semibold ${currentTemplate.accentColor} border-b pb-2 mb-3`}>Work Experience</h2>
                  {resume.experience.map((exp, idx) => (
                    <div key={idx} className="mb-4">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                          <p className="text-gray-700">{exp.company}</p>
                        </div>
                        <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</p>
                      </div>
                      <p className="text-gray-600 text-sm mt-2 whitespace-pre-wrap">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {resume.education && resume.education.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-lg font-semibold ${currentTemplate.accentColor} border-b pb-2 mb-3`}>Education</h2>
                  {resume.education.map((edu, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{edu.degree} in {edu.field}</h3>
                          <p className="text-gray-700">{edu.school}</p>
                        </div>
                        <p className="text-sm text-gray-500">{edu.year}</p>
                      </div>
                      {edu.gpa && <p className="text-sm text-gray-500 mt-1">GPA: {edu.gpa}</p>}
                    </div>
                  ))}
                </div>
              )}

              {resume.skills && resume.skills.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-lg font-semibold ${currentTemplate.accentColor} border-b pb-2 mb-3`}>Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {resume.skills.map((skill, idx) => (
                      <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {resume.achievements && resume.achievements.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-lg font-semibold ${currentTemplate.accentColor} border-b pb-2 mb-3`}>Key Achievements</h2>
                  <ul className="list-disc list-inside space-y-1">
                    {resume.achievements.map((achievement, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{achievement}</li>
                    ))}
                  </ul>
                </div>
              )}

              {resume.certifications && resume.certifications.length > 0 && (
                <div>
                  <h2 className={`text-lg font-semibold ${currentTemplate.accentColor} border-b pb-2 mb-3`}>Certifications</h2>
                  <div className="flex flex-wrap gap-2">
                    {resume.certifications.map((cert, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">{cert}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Applied Jobs Tracking */}
          {appliedJobs.length > 0 && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>📋</span> Your Applications ({appliedJobs.length})
              </h3>
              <div className="space-y-2">
                {appliedJobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between text-sm p-2 bg-white rounded border border-gray-100">
                    <div>
                      <span className="font-medium">{job.title}</span>
                      <span className="text-gray-500 ml-2">at {job.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {job.responseType === "interview" && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">📅 Interview Scheduled</span>
                      )}
                      {job.responseType === "offer" && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">🎊 Offer Received!</span>
                      )}
                      {job.responseType === "rejection" && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">📫 Not Selected</span>
                      )}
                      {!job.responseSent && (
                        <span className="text-xs text-gray-400">⏳ Awaiting response...</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {showAITips && (
            <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 Pro Tips</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700">
                    <div>✓ Customize your summary for each job application</div>
                    <div>✓ Add quantifiable metrics to your experience</div>
                    <div>✓ Keep your LinkedIn profile updated</div>
                    <div>✓ Save as PDF for best formatting</div>
                  </div>
                </div>
                <button onClick={() => setShowAITips(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
            </div>
          )}
        </div>

        {/* Auto-Apply Modal */}
        {showAutoApply && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">🤖 AI Auto-Apply to Jobs</h2>
                  <p className="text-sm text-gray-500">Based on your skills and experience</p>
                </div>
                <button
                  onClick={() => setShowAutoApply(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Found {matchingJobs.length} matching jobs for you
                  </p>
                  <button
                    onClick={selectAllJobs}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {selectedJobs.length === matchingJobs.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                
                <div className="space-y-3 mb-6">
                  {matchingJobs.map(job => (
                    <label
                      key={job.id}
                      className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job.id)}
                        onChange={() => toggleJobSelection(job.id)}
                        className="mt-1 w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{job.title}</h3>
                            <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              {job.matchScore}% Match
                            </span>
                            <span className="text-sm font-medium text-gray-900">{job.salary}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{job.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {job.skills.map((skill, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAutoApply(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={autoApplyToJobs}
                    disabled={selectedJobs.length === 0 || applyingJobs}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {applyingJobs ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Applying...
                      </>
                    ) : (
                      `Apply to ${selectedJobs.length} Job${selectedJobs.length !== 1 ? 's' : ''}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Questions screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Tell us about yourself
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{questions[currentQuestion].question}</h2>
            <p className="text-gray-500 text-sm mt-1">{questions[currentQuestion].helpText}</p>
          </div>

          <div className="mb-8">
            {renderQuestion()}
          </div>

          <div className="flex justify-between gap-4">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                currentQuestion === 0 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              ← Back
            </button>
            <button
              onClick={nextQuestion}
              disabled={!isCurrentQuestionValid()}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                isCurrentQuestionValid()
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {currentQuestion === questions.length - 1 ? "Generate Resume →" : "Next →"}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            ✨ All information is private and only used to generate your resume
          </p>
        </div>
      </div>
    </div>
  );
}