"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { jobsApi } from "../../lib/api";
import Navbar from "../../components/Navbar";
import JobCard from "../../components/JobCard";
import CoverLetterModal from "../../components/CoverLetterModal";
import { Search, Filter, X, MapPin, Briefcase, Tag } from "lucide-react";

const JOB_TYPES = ["", "Remote", "Hybrid", "Onsite"];
const CATEGORIES = ["", "Engineering", "Data Science", "AI/ML", "DevOps", "Design", "Product", "Security", "Architecture", "Management", "QA"];

// Job Detail Panel
function JobDetailPanel({ job, onClose, onCoverLetter }) {
  if (!job) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
            <p className="text-gray-500 text-sm mt-1">{job.company} · {job.location} · {job.jobType}</p>
            {job.salary && <p className="text-indigo-600 font-semibold text-sm mt-1">{job.salary}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Job Description</h3>
            <p className="leading-relaxed">{job.description}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
            <div className="flex flex-wrap gap-2">
              {job.requirements?.split(",").map((r, i) => (
                <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">{r.trim()}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-100">
          <button onClick={() => { onClose(); onCoverLetter(job); }} className="btn-primary w-full">
            Generate AI Cover Letter
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", jobType: "", category: "", location: "" });
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetterJob, setCoverLetterJob] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/");
  }, [authLoading, isAuthenticated]);

  const fetchJobs = useCallback(async (params) => {
    setLoading(true);
    try {
      const data = await jobsApi.getAll(params);
      setJobs(data || []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchJobs({});
  }, [isAuthenticated]);

  const applyFilters = () => {
    const active = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    setActiveFilters(active);
    fetchJobs(active);
  };

  const clearFilters = () => {
    setFilters({ search: "", jobType: "", category: "", location: "" });
    setActiveFilters({});
    fetchJobs({});
  };

  const hasFilters = Object.values(filters).some(Boolean);
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <main className="flex-1 md:ml-64 p-8">
        <div className="max-w-6xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Find Jobs</h1>
            <p className="text-gray-500 text-sm mt-1">{jobs.length} jobs available · Generate AI cover letters instantly</p>
          </div>

          {/* Search & Filters */}
          <div className="card mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative lg:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className="input-field pl-9"
                  placeholder="Search jobs, skills..."
                  value={filters.search}
                  onChange={e => setFilters({ ...filters, search: e.target.value })}
                  onKeyDown={e => e.key === "Enter" && applyFilters()}
                />
              </div>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select className="input-field pl-9 appearance-none" value={filters.jobType} onChange={e => setFilters({ ...filters, jobType: e.target.value })}>
                  {JOB_TYPES.map(t => <option key={t} value={t}>{t || "All Types"}</option>)}
                </select>
              </div>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select className="input-field pl-9 appearance-none" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c || "All Categories"}</option>)}
                </select>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className="input-field pl-9" placeholder="Location..." value={filters.location} onChange={e => setFilters({ ...filters, location: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-3">
              <button onClick={applyFilters} className="btn-primary flex items-center gap-2 py-2">
                <Filter className="w-4 h-4" /> Apply Filters
                {activeFilterCount > 0 && <span className="bg-white/30 text-white text-xs px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>}
              </button>
              {hasFilters && (
                <button onClick={clearFilters} className="btn-secondary flex items-center gap-2 py-2">
                  <X className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Jobs Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card skeleton h-48" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="card text-center py-16">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No jobs found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search filters</p>
              <button onClick={clearFilters} className="btn-secondary mt-4">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onViewDetails={setSelectedJob}
                  onGenerateCoverLetter={setCoverLetterJob}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedJob && (
        <JobDetailPanel
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onCoverLetter={(j) => { setSelectedJob(null); setCoverLetterJob(j); }}
        />
      )}

      {coverLetterJob && (
        <CoverLetterModal job={coverLetterJob} onClose={() => setCoverLetterJob(null)} />
      )}
    </div>
  );
}
