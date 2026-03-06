"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { jobsApi, profileApi } from "../../lib/api";
import Navbar from "../../components/Navbar";
import RecommendedJobCard from "../../components/RecommendedJobCard";
import CoverLetterModal from "../../components/CoverLetterModal";
import { Sparkles, Briefcase, User, TrendingUp, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/");
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([
        jobsApi.getRecommended(6).catch(() => []),
        profileApi.get().catch(() => null),
      ]).then(([recs, prof]) => {
        setRecommendations(recs || []);
        setProfile(prof);
        setLoading(false);
      });
    }
  }, [isAuthenticated]);

  const profileScore = profile ? (
    [profile.title, profile.skills, profile.experience, profile.education, profile.resume, profile.location]
      .filter(Boolean).length / 6 * 100
  ) : 0;

  const stats = [
    { label: "Recommended Jobs", value: recommendations.length, icon: Briefcase, color: "text-indigo-600 bg-indigo-50" },
    { label: "Profile Score", value: `${Math.round(profileScore)}%`, icon: User, color: "text-purple-600 bg-purple-50" },
    { label: "Top Match", value: recommendations[0] ? `${Math.round(recommendations[0].matchScore)}%` : "N/A", icon: TrendingUp, color: "text-green-600 bg-green-50" },
  ];

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen">
        <Navbar />
        <main className="flex-1 md:ml-64 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="grid grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-gray-200 rounded-xl" />)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <main className="flex-1 md:ml-64 p-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here are your AI-powered job recommendations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Profile Completion Warning */}
        {profileScore < 60 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Complete your profile for better recommendations</p>
              <p className="text-xs text-amber-600 mt-0.5">Add your skills, experience and resume to improve match accuracy</p>
            </div>
            <Link href="/profile" className="btn-primary text-sm py-2 px-4 flex-shrink-0 whitespace-nowrap">
              Complete Profile
            </Link>
          </div>
        )}

        {/* Recommendations */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Recommendations</h2>
          </div>
          <Link href="/jobs" className="flex items-center gap-1 text-sm text-indigo-600 hover:underline font-medium">
            View all jobs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recommendations.length === 0 ? (
          <div className="card text-center py-12">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No recommendations yet</p>
            <p className="text-gray-400 text-sm mt-1">Complete your profile to get personalized recommendations</p>
            <Link href="/profile" className="btn-primary inline-flex mt-4">Build Profile</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, i) => (
              <RecommendedJobCard
                key={i}
                recommendation={rec}
                onSelect={(r) => setSelectedJob(r.job)}
              />
            ))}
          </div>
        )}
      </main>

      {selectedJob && (
        <CoverLetterModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
