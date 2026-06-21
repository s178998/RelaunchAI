// pages/app/Profile.jsx
"use client";
import { useState, useEffect, useContext, useRef } from "react";
import authContext from "../../context/AuthContext";

const DEPARTMENTS = [
  "Engineering", "Product", "Sales", "Marketing",
  "HR", "Finance", "Operations", "Data Science", "Design",
  "Customer Success", "Legal", "IT", "Security", "Admin",
];

const LEVELS = [
  "Entry (L3)", "Junior (L4)", "Senior (L5)",
  "Staff (L6)", "Senior Staff (L7)", "Principal (L8+)",
  "Manager", "Senior Manager", "Director", "VP+",
];

const DEFAULT_NOTIFICATIONS = {
  emailAlerts: true,
  weeklyDigest: true,
  jobMatchUpdates: false,
};

export default function Profile() {
  const { user } = useContext(authContext);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const skillInputRef = useRef(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    company: "",
    department: "",
    level: "",
    role: "",
    skills: [],
  });
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);

  // Resolve the current user from context or localStorage (same pattern as other views)
  useEffect(() => {
    let resolved = null;
    if (user && user.id) {
      resolved = user;
    } else {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          resolved = JSON.parse(savedUser);
        } catch {
          resolved = null;
        }
      }
    }

    if (!resolved) {
      setLoading(false);
      return;
    }
    setCurrentUser(resolved);

    // Load the onboarding profile + saved notification prefs for this user
    let profile = {};
    const storedProfile = localStorage.getItem(`user_profile_${resolved.id}`);
    if (storedProfile) {
      try {
        profile = JSON.parse(storedProfile);
      } catch {
        profile = {};
      }
    }

    const storedNotifs = localStorage.getItem(`user_notifications_${resolved.id}`);
    if (storedNotifs) {
      try {
        setNotifications({ ...DEFAULT_NOTIFICATIONS, ...JSON.parse(storedNotifs) });
      } catch {
        setNotifications(DEFAULT_NOTIFICATIONS);
      }
    }

    setForm({
      fullName: [resolved.firstname, resolved.lastname].filter(Boolean).join(" "),
      email: resolved.email || "",
      company: profile.company || "",
      department: profile.department || "",
      level: profile.level || "",
      role: profile.role || "",
      skills: parseSkills(profile.skills),
    });
    setLoading(false);
  }, [user]);

  function parseSkills(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const addSkill = () => {
    const skill = newSkill.trim();
    if (!skill) return;
    if (form.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      setNewSkill("");
      return;
    }
    setForm((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
    setNewSkill("");
    setSaved(false);
    skillInputRef.current?.focus();
  };

  const removeSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
    setSaved(false);
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const getInitials = () => {
    const parts = form.fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return "U";
  };

  const handleSave = () => {
    if (!currentUser) return;
    setSaving(true);

    // Merge form changes back into the stored onboarding profile
    let profile = {};
    const storedProfile = localStorage.getItem(`user_profile_${currentUser.id}`);
    if (storedProfile) {
      try {
        profile = JSON.parse(storedProfile);
      } catch {
        profile = {};
      }
    }

    const updatedProfile = {
      ...profile,
      company: form.company,
      department: form.department,
      level: form.level,
      role: form.role,
      skills: form.skills.join(", "),
    };
    localStorage.setItem(`user_profile_${currentUser.id}`, JSON.stringify(updatedProfile));
    localStorage.setItem("user_profile", JSON.stringify(updatedProfile));

    // Persist name/email back onto the user record
    const nameParts = form.fullName.trim().split(/\s+/);
    const updatedUser = {
      ...currentUser,
      firstname: nameParts[0] || currentUser.firstname,
      lastname: nameParts.slice(1).join(" ") || currentUser.lastname,
      email: form.email || currentUser.email,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);

    localStorage.setItem(
      `user_notifications_${currentUser.id}`,
      JSON.stringify(notifications)
    );

    setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 400);
  };

  const handleCancel = () => {
    window.location.reload();
  };

  const handleDeleteAccount = () => {
    if (!currentUser) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );
    if (!confirmed) return;
    localStorage.removeItem(`user_profile_${currentUser.id}`);
    localStorage.removeItem(`user_notifications_${currentUser.id}`);
    localStorage.removeItem(`onboarding_complete_${currentUser.id}`);
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account &amp; Preferences</h1>
          <p className="text-gray-500 text-base">
            Changes to your role or company take effect on your next report refresh.
          </p>
        </div>

        {/* PROFILE */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-3">
            Profile
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xl shadow-sm flex-shrink-0">
                {getInitials()}
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-900">
                  {form.fullName || "Your Name"}
                </p>
                <p className="text-sm text-gray-500">{form.email || "you@example.com"}</p>
                <button
                  type="button"
                  className="mt-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
                >
                  Change photo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6">
              <div>
                <label className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">
                  Password
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="password"
                    value="••••••••••••"
                    readOnly
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-gray-50 focus:outline-none"
                  />
                  <button
                    type="button"
                    className="px-3 py-2.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition whitespace-nowrap"
                  >
                    Change password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* YOUR ROLE */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-3">
            Your Role
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-5">
              This is what your report is based on. Keep it current.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">
                  Department
                </label>
                <select
                  value={form.department}
                  onChange={(e) => updateField("department", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="">Select</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">
                  Level
                </label>
                <select
                  value={form.level}
                  onChange={(e) => updateField("level", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="">Select</option>
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => updateField("role", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Skills */}
            <div className="mt-6">
              <label className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1">
                Skills on File
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Used to match you with relevant job listings.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {form.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-blue-400 hover:text-blue-700 transition"
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <div className="inline-flex items-center">
                  <input
                    ref={skillInputRef}
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    placeholder="+ Add skill"
                    className="text-sm text-gray-700 px-3 py-1.5 border border-dashed border-gray-300 rounded-full focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition w-32"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NOTIFICATIONS */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-3">
            Notifications
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
            {[
              {
                key: "emailAlerts",
                title: "Email alerts",
                desc: "Notify me when a new signal is detected for my role",
              },
              {
                key: "weeklyDigest",
                title: "Weekly digest",
                desc: "A summary of signal changes every Monday morning",
              },
              {
                key: "jobMatchUpdates",
                title: "Job match updates",
                desc: "New job listings that match my profile",
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-6">
                <div>
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifications[item.key]}
                  onClick={() => toggleNotification(item.key)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    notifications[item.key] ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      notifications[item.key] ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Changes saved
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="px-5 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-all"
          >
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}
