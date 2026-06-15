// routes/routes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import authContext from "../context/AuthContext";

import AppLayout from "../layouts/AppLayout";
import PublicLayout from "../layouts/PublicLayout";
import CommunityLayout from "../layouts/CommunityLayout";

import Landing from "../pages/public/Landing";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import Onboarding from "../components/Onboarding";

import Dashboard from "../pages/app/Dashboard";
import Interview from "../pages/app/Interview";
import TransitionHub from "../pages/app/TransitionHub";
import Profile from "../pages/app/Profile";
import Settings from "../pages/app/Settings";
import JobMatching from "../pages/app/JobMatching";
import LayoffRisk from "../pages/app/LayoffRisk";
import SkillsLearning from "../pages/app/SkillsLearning";
import Community from "../pages/app/comunity";
import ResumeBuilder from "../pages/app/ResumeBuilder";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  const { user } = useContext(authContext);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = () => {
      const savedUser = localStorage.getItem('user');
      let userId = null;
      
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        userId = parsedUser.id;
      } else if (user && user.id) {
        userId = user.id;
      }
      
      if (userId) {
        const completionFlag = localStorage.getItem(`onboarding_complete_${userId}`);
        const hasCompletedOnboarding = completionFlag === 'true';
        console.log(`Onboarding check for user ${userId}:`, hasCompletedOnboarding);
        setHasCompleted(hasCompletedOnboarding);
      } else {
        setHasCompleted(false);
      }
      
      setIsLoading(false);
    };
    
    checkOnboardingStatus();
    
    const handleStorageChange = () => {
      checkOnboardingStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    return !!(token && savedUser);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes - Anyone can access */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Onboarding Route - Only for authenticated users who haven't completed onboarding */}
      <Route
        path="/onboarding"
        element={
          isAuthenticated() ? (
            !hasCompleted ? (
              <Onboarding />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Protected Routes - Require authentication AND completed onboarding */}
      <Route
        element={
          <ProtectedRoute>
            {isAuthenticated() && hasCompleted ? (
              <AppLayout />
            ) : (
              <Navigate to={isAuthenticated() ? "/onboarding" : "/"} replace />
            )}
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/job-matching" element={<JobMatching />} />
        <Route path="/resume" element={<ResumeBuilder />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/transition-hub" element={<TransitionHub />} />
        <Route path="/skills-learning" element={<SkillsLearning />} />
        <Route path="/layoff-risk" element={<LayoffRisk />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route element={<CommunityLayout />} />

      <Route path="*" element={<h1 className="flex-center bg-white p-8">404 NOT FOUND</h1>} />
    </Routes>
  );
}