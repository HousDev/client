import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface ShareJobModalProps {
  jobId: string;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareJobModal({ jobId, jobTitle, isOpen, onClose }: ShareJobModalProps) {
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      // Generate mock share link
      const link = `${window.location.origin}/jobs/${jobId}`;
      setShareLink(link);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Share Job Posting</h2>
            <p className="text-slate-600 mt-1">{jobTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        <div className="space-y-4">
          {!shareLink ? (
            <div>
              <p className="text-sm text-slate-600 mb-4">
                Generate a shareable link for this job posting that allows candidates to apply directly.
              </p>
              <Button
                onClick={handleGenerateLink}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Generating...' : 'Generate Share Link'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Share Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-slate-50"
                  />
                  <Button
                    onClick={handleCopyLink}
                    size="sm"
                    variant="secondary"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  Share this link with candidates. They can view the job details and submit their applications.
                </p>
              </div>
              <Button
                onClick={() => setShareLink(null)}
                variant="secondary"
                className="w-full"
              >
                Generate New Link
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}