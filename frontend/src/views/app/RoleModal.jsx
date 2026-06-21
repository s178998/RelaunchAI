// frontend/src/components/RoleModal.jsx
import { useState } from "react";

export default function RoleModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    company: "",
    department: "",
    role: "",
    level: "",
    tenure: "",
    skills: ""
  });

  const companies = [
    "Meta", "Google", "Amazon", "Microsoft", "Netflix", 
    "Apple", "Stripe", "Uber", "Airbnb", "Salesforce", "Other"
  ];
  
  const departments = [
    "Engineering", "Product", "Sales", "Marketing", 
    "HR", "Finance", "Operations", "Data Science", "Design"
  ];
  
  const levels = [
    "Entry (L3)", "Junior (L4)", "Senior (L5)", 
    "Staff (L6)", "Senior Staff (L7)", "Principal (L8+)"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  AI-Powered Analysis
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Tell us about your role</h2>
                <p className="text-sm text-gray-500 mt-1">Get personalized layoff risk analysis</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
            {/* Company */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
              >
                <option value="">Select your company</option>
                {companies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
              >
                <option value="">Select department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Software Engineer, DevOps Engineer, Data Engineer"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Level and Tenure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Level <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                >
                  <option value="">Select level</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tenure at Company
                </label>
                <select
                  value={formData.tenure}
                  onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                >
                  <option value="">Select tenure</option>
                  <option value="< 1 year">&lt; 1 year</option>
                  <option value="1-2 years">1-2 years</option>
                  <option value="2-4 years">2-4 years</option>
                  <option value="4-6 years">4-6 years</option>
                  <option value="6+ years">6+ years</option>
                </select>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Key Skills
              </label>
              <textarea
                placeholder="React, TypeScript, Python, AWS, System Design (comma separated)"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                rows="3"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Analyzing..." : "Continue →"}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 rounded-b-2xl border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              🔒 Your data is private and only used for analysis • Powered by ChatGPT AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}