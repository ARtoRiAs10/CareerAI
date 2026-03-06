"use client";

import { MapPin, Briefcase, DollarSign, Clock, ExternalLink, FileText } from "lucide-react";

const JOB_TYPE_COLORS = {
  Remote: "bg-green-100 text-green-700",
  Hybrid: "bg-blue-100 text-blue-700",
  Onsite: "bg-orange-100 text-orange-700",
};

const CATEGORY_COLORS = {
  Engineering: "bg-purple-100 text-purple-700",
  "Data Science": "bg-cyan-100 text-cyan-700",
  "AI/ML": "bg-pink-100 text-pink-700",
  Design: "bg-yellow-100 text-yellow-700",
  Product: "bg-indigo-100 text-indigo-700",
  DevOps: "bg-orange-100 text-orange-700",
  default: "bg-gray-100 text-gray-700",
};

export default function JobCard({ job, onGenerateCoverLetter, onViewDetails, compact = false }) {
  const typeColor = JOB_TYPE_COLORS[job.jobType] || "bg-gray-100 text-gray-700";
  const catColor = CATEGORY_COLORS[job.category] || CATEGORY_COLORS.default;
  const postedDate = job.postedAt
    ? new Date(job.postedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Recently";

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-700 font-bold text-sm">{job.company?.[0] || "?"}</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">{job.title}</h3>
            <p className="text-gray-500 text-xs mt-0.5 truncate">{job.company}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${typeColor}`}>
          {job.jobType}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {job.location}
        </span>
        {job.salary && (
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            {job.salary}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {postedDate}
        </span>
      </div>

      {/* Category */}
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit mb-3 ${catColor}`}>
        {job.category}
      </span>

      {/* Description preview */}
      {!compact && (
        <p className="text-gray-600 text-xs leading-relaxed mb-4 line-clamp-2 flex-1">
          {job.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-50 mt-auto">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(job)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Details
          </button>
        )}
        {onGenerateCoverLetter && (
          <button
            onClick={() => onGenerateCoverLetter(job)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Cover Letter
          </button>
        )}
      </div>
    </div>
  );
}
