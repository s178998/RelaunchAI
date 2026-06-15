// pages/public/Landing.jsx

import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className=" text-white min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-bold mb-4">
        Recover Faster After Layoffs
      </h1>

      <p className="max-w-xl mb-8">
        AI-powered career recovery platform helping
        professionals rebuild resumes, practice
        interviews, and find jobs faster.
      </p>

      <Link
        to="/register"
        className="bg-blue-600 text-white px-6 py-3 rounded"
      >
        Get Started
      </Link>
    </div>
  );
}