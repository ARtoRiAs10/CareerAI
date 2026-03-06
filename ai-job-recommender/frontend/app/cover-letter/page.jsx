"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { jobsApi, aiApi } from "../../lib/api";
import Navbar from "../../components/Navbar";
import { Sparkles, FileText, Copy, Check, Download, Loader, ChevronDown, Clock } from "lucide-react";

export default function CoverLetterPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [savedLetters, setSavedLetters] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [notes, setNotes] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/");
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      jobsApi.getAll().then(data => setJobs(data || [])).catch(() => {});
      aiApi.getMyCoverLetters().then(data => setSavedLetters(data || [])).catch(() => {});
    }
  }, [isAuthenticated]);

  const generate = async () => {
    if (!selectedJobId) { setError("Please select a job"); return; }
    setGenerating(true);
    setError("");
    setCoverLetter("");
    try {
      const data = await aiApi.generateCoverLetter({
        jobId: Number(selectedJobId),
        additionalNotes: notes,
        saveLetter: true,
      });
      setCoverLetter(data.coverLetter);
      // Refresh saved letters
      aiApi.getMyCoverLetters().then(d => setSavedLetters(d || [])).catch(() => {});
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = (text, name) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const selectedJob = jobs.find(j => j.id === Number(selectedJobId));

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <main className="flex-1 md:ml-64 p-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Cover Letter Generator</h1>
          <p className="text-gray-500 text-sm mt-1">Generate personalized cover letters powered by Claude AI</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 w-fit mb-6">
          {["generate", "saved"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "generate" ? "Generate New" : `Saved Letters (${savedLetters.length})`}
            </button>
          ))}
        </div>

        {activeTab === "generate" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Generator */}
            <div className="space-y-4">
              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Generate Cover Letter
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="label">Select Job *</label>
                    <div className="relative">
                      <select
                        className="input-field appearance-none pr-8"
                        value={selectedJobId}
                        onChange={e => setSelectedJobId(e.target.value)}
                      >
                        <option value="">Choose a job position...</option>
                        {jobs.map(j => (
                          <option key={j.id} value={j.id}>{j.title} — {j.company}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {selectedJob && (
                    <div className="bg-indigo-50 rounded-lg p-3 text-sm">
                      <p className="font-medium text-indigo-900">{selectedJob.title}</p>
                      <p className="text-indigo-600">{selectedJob.company} · {selectedJob.location} · {selectedJob.jobType}</p>
                      {selectedJob.salary && <p className="text-indigo-500 text-xs mt-1">{selectedJob.salary}</p>}
                    </div>
                  )}

                  <div>
                    <label className="label">Additional Notes (optional)</label>
                    <textarea
                      className="input-field resize-none"
                      rows={4}
                      placeholder="Specific achievements to mention, why you're excited about this company, any special circumstances to highlight..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={generate}
                    disabled={generating || !selectedJobId}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <><Loader className="w-4 h-4 animate-spin" />Generating with AI...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" />Generate Cover Letter</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Result */}
            <div>
              {coverLetter ? (
                <div className="card h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Generated Letter</h3>
                    <div className="flex gap-2">
                      <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                      <button
                        onClick={() => download(coverLetter, `cover-letter-${selectedJob?.company || "job"}.txt`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-serif border border-gray-100 overflow-y-auto">
                    {coverLetter}
                  </div>
                </div>
              ) : (
                <div className="card h-full flex items-center justify-center text-center min-h-64">
                  <div>
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-indigo-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Your cover letter will appear here</p>
                    <p className="text-gray-400 text-sm mt-1">Select a job and click Generate</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Saved Letters Tab */
          <div className="space-y-4">
            {savedLetters.length === 0 ? (
              <div className="card text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No saved cover letters yet</p>
                <p className="text-gray-400 text-sm mt-1">Generate your first cover letter to see it here</p>
                <button onClick={() => setActiveTab("generate")} className="btn-primary mt-4">
                  Generate Now
                </button>
              </div>
            ) : (
              savedLetters.map((letter, i) => (
                <div key={i} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{letter.jobTitle}</h3>
                      <p className="text-gray-500 text-sm">{letter.company}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { navigator.clipboard.writeText(letter.coverLetter); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>
                      <button
                        onClick={() => download(letter.coverLetter, `cover-letter-${letter.company}.txt`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed line-clamp-4 font-serif">
                    {letter.coverLetter}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
