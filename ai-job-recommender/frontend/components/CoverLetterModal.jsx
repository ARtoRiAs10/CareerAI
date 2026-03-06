"use client";

import { useState } from "react";
import { X, Copy, Check, Download, Sparkles, Loader } from "lucide-react";
import { aiApi } from "../lib/api";

export default function CoverLetterModal({ job, onClose }) {
  const [notes, setNotes] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await aiApi.generateCoverLetter({
        jobId: job.id,
        additionalNotes: notes,
        saveLetter: true,
      });
      setCoverLetter(data.coverLetter);
      setGenerated(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([coverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${job.company.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">AI Cover Letter</h2>
            <p className="text-sm text-gray-500">{job.title} at {job.company}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!generated ? (
            <>
              <div>
                <label className="label">Additional Notes (optional)</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Any specific points to emphasize? Achievements, specific experience, why you're excited about this company..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div className="bg-indigo-50 rounded-xl p-4 text-sm text-indigo-700">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>Claude AI will generate a personalized cover letter based on your profile and the job requirements. Make sure your profile is complete for the best results.</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Generated Cover Letter</span>
                <div className="flex gap-2">
                  <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={download} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-serif border border-gray-100 min-h-48">
                {coverLetter}
              </div>
              <button
                onClick={() => { setGenerated(false); setCoverLetter(""); }}
                className="text-sm text-indigo-600 hover:underline"
              >
                Regenerate with different notes
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        {!generated && (
          <div className="p-6 border-t border-gray-100">
            <button
              onClick={generate}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Cover Letter
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
