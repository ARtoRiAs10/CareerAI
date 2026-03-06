"use client";

import { useRouter } from "next/navigation";
import { MapPin, TrendingUp, ChevronRight, Sparkles } from "lucide-react";

function ScoreBadge({ score }) {
  const pct = Math.min(100, Math.round(score));
  const color = pct >= 70 ? "text-green-600 bg-green-50" : pct >= 40 ? "text-yellow-600 bg-yellow-50" : "text-gray-600 bg-gray-50";
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${color} flex items-center gap-1`}>
      <TrendingUp className="w-3 h-3" />
      {pct}% match
    </span>
  );
}

export default function RecommendedJobCard({ recommendation, onSelect }) {
  const { job, matchScore, matchReasons } = recommendation;
  const router = useRouter();

  return (
    <div
      className="card hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={() => onSelect && onSelect(recommendation)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-700 font-bold text-sm">{job.company?.[0] || "?"}</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors truncate">
              {job.title}
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">{job.company}</p>
          </div>
        </div>
        <ScoreBadge score={matchScore} />
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-medium">{job.jobType}</span>
      </div>

      {matchReasons && matchReasons.length > 0 && (
        <div className="bg-indigo-50/50 rounded-lg p-2.5 mb-3">
          <div className="flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-0.5">
              {matchReasons.slice(0, 2).map((reason, i) => (
                <p key={i} className="text-xs text-indigo-700">{reason}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{job.salary || "Salary not specified"}</span>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
      </div>
    </div>
  );
}
