"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { profileApi } from "../../lib/api";
import Navbar from "../../components/Navbar";
import { User, Save, CheckCircle, Loader } from "lucide-react";

const JOB_TYPES = ["Remote", "Hybrid", "Onsite"];
const SECTIONS = [
  { key: "title", label: "Current / Target Job Title", placeholder: "e.g. Senior React Developer", type: "input" },
  { key: "skills", label: "Skills (comma-separated)", placeholder: "e.g. React, TypeScript, Node.js, Docker", type: "input" },
  { key: "location", label: "Location", placeholder: "e.g. San Francisco, CA or Remote", type: "input" },
  { key: "phone", label: "Phone Number", placeholder: "+1 (555) 000-0000", type: "input" },
  { key: "linkedinUrl", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/yourprofile", type: "input" },
  { key: "githubUrl", label: "GitHub URL", placeholder: "https://github.com/yourusername", type: "input" },
  { key: "experience", label: "Work Experience", placeholder: "Describe your work history and key achievements...", type: "textarea" },
  { key: "education", label: "Education", placeholder: "e.g. B.S. Computer Science, MIT, 2020", type: "textarea" },
  { key: "resume", label: "Resume / Full Bio", placeholder: "Paste your resume text or write a detailed summary of your background...", type: "textarea", rows: 8 },
];

export default function ProfilePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/");
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      profileApi.get().then(data => {
        setForm(data || {});
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [isAuthenticated]);

  const save = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      await profileApi.update(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const completionFields = ["title", "skills", "experience", "education", "resume", "location"];
  const completionPct = Math.round(completionFields.filter(k => form[k]).length / completionFields.length * 100);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen">
        <Navbar />
        <main className="flex-1 md:ml-64 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="card space-y-4">
              {[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-100 rounded" />)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <main className="flex-1 md:ml-64 p-8 max-w-4xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
            <p className="text-gray-500 text-sm mt-1">The more complete your profile, the better your job matches</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600">{completionPct}%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-100 rounded-full mb-8">
          <div
            className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>

        <div className="space-y-6">
          {/* Identity */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Basic Information</h2>
                <p className="text-xs text-gray-500">Your name and contact details</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input-field" value={form.name || ""} disabled placeholder="Your name" />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input-field" value={form.email || ""} disabled placeholder="your@email.com" />
              </div>
              {SECTIONS.slice(0, 6).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <input
                    className="input-field"
                    value={form[key] || ""}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Preference */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Job Preferences</h2>
            <div>
              <label className="label">Preferred Work Type</label>
              <div className="flex gap-3">
                {JOB_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setForm({ ...form, preferredJobType: type })}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg border-2 transition-all ${
                      form.preferredJobType === type
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Experience & Education */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-5">Experience & Education</h2>
            <div className="space-y-4">
              {SECTIONS.slice(6, 8).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <textarea
                    className="input-field resize-none"
                    rows={3}
                    value={form[key] || ""}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Resume */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-2">Resume / Professional Summary</h2>
            <p className="text-xs text-gray-500 mb-4">Paste your resume text or write a detailed professional summary. This is used for AI cover letter generation.</p>
            <textarea
              className="input-field resize-none"
              rows={10}
              value={form.resume || ""}
              onChange={e => setForm({ ...form, resume: e.target.value })}
              placeholder={SECTIONS[8].placeholder}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
          )}

          <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 w-full sm:w-auto">
            {saving ? (
              <><Loader className="w-4 h-4 animate-spin" /> Saving...</>
            ) : success ? (
              <><CheckCircle className="w-4 h-4" /> Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> Save Profile</>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
