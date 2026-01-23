import { useState } from "react";
import { X, Upload } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { toast } from "sonner";

interface ReferralModalProps {
  jobId: string;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReferralModal({
  jobId,
  jobTitle,
  isOpen,
  onClose,
  onSuccess,
}: ReferralModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    resume: null as File | null,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (!/^\d*$/.test(value)) {
      toast.warning("Enter Valid Phone Number.");
      return;
    }
    if (value.length > 10) {
      toast.warning("Mobile number must be 10 digit.");
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, resume: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Mock API call simulation
    setTimeout(() => {
      console.log("Referral submitted:", {
        jobId,
        jobTitle,
        ...formData,
      });

      alert("Referral submitted successfully!");
      setSubmitting(false);
      onSuccess();
      onClose();

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        resume: null,
        notes: "",
      });
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Refer Candidate
            </h2>
            <p className="text-slate-600 mt-1">For: {jobTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Candidate Name *
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter candidate name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Email *
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Phone Number
            </label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Resume/CV
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
              <input
                type="file"
                id="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="resume" className="cursor-pointer">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-700">
                  {formData.resume ? (
                    <span className="text-green-600">
                      {formData.resume.name}
                    </span>
                  ) : (
                    <>
                      <span className="font-medium">Click to upload</span> or
                      drag and drop
                    </>
                  )}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  PDF, DOC, DOCX up to 5MB
                </p>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes about this candidate..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Referral"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
