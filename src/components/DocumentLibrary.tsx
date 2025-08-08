import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function DocumentLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const documents = useQuery(api.documents.searchDocuments, {
    searchTerm: searchTerm || undefined,
    subject: selectedSubject || undefined,
  });

  const subjects = [
    "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science",
    "Engineering", "Medicine", "Business", "Economics", "Law", "Literature"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Document Library</h2>
          <p className="text-gray-600">Discover and share academic resources</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-gradient-to-r from-orange-500 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-green-700 transition-all"
        >
          📤 Upload Document
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search documents, courses, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents?.map((doc) => (
          <DocumentCard key={doc._id} document={doc} />
        ))}
      </div>

      {documents?.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">Try adjusting your search or be the first to upload!</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </div>
  );
}

function DocumentCard({ document }: { document: any }) {
  const incrementDownloads = useMutation(api.documents.incrementDownloads);

  const handleDownload = async () => {
    try {
      await incrementDownloads({ documentId: document._id });
      // In a real app, you'd trigger the actual download here
      toast.success("Download started!");
    } catch (error) {
      toast.error("Failed to download document");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "notes": return "📝";
      case "assignment": return "📋";
      case "exam": return "📊";
      case "textbook": return "📖";
      case "research": return "🔬";
      default: return "📄";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="text-2xl">{getTypeIcon(document.documentType)}</div>
        {document.isPremium && (
          <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs px-2 py-1 rounded-full">
            Premium
          </span>
        )}
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{document.title}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{document.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <span className="font-medium">{document.subject}</span>
          <span className="mx-2">•</span>
          <span>{document.university}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span>By {document.uploaderName}</span>
          <span className="mx-2">•</span>
          <span>⭐ {document.rating.toFixed(1)}</span>
          <span className="mx-2">•</span>
          <span>📥 {document.downloads}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {document.tags.slice(0, 3).map((tag: string) => (
          <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>

      <button
        onClick={handleDownload}
        className="w-full bg-gradient-to-r from-orange-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-green-700 transition-all"
      >
        Download
      </button>
    </div>
  );
}

function UploadModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    course: "",
    university: "",
    documentType: "notes" as const,
    tags: "",
    isPremium: false,
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const uploadDocument = useMutation(api.documents.uploadDocument);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    // Check file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Validate required fields
    if (!formData.title.trim() || !formData.description.trim() || !formData.subject.trim() || !formData.course.trim() || !formData.university.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsUploading(true);
    try {
      // Get upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });
      
      if (!result.ok) throw new Error("Upload failed");
      
      const { storageId } = await result.json();
      
      // Save document metadata
      await uploadDocument({
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        course: formData.course,
        university: formData.university,
        documentType: formData.documentType,
        fileId: storageId,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
        isPremium: formData.isPremium,
      });
      
      toast.success("Document uploaded successfully! 🎉");
      onClose();
    } catch (error) {
      toast.error("Failed to upload document");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Upload Document</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course *
                </label>
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University *
                </label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type *
                </label>
                <select
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="notes">Notes</option>
                  <option value="assignment">Assignment</option>
                  <option value="exam">Exam/Test</option>
                  <option value="textbook">Textbook</option>
                  <option value="research">Research Paper</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., calculus, derivatives, mathematics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File *
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 10 * 1024 * 1024) {
                      toast.error("File size must be less than 10MB");
                      e.target.value = "";
                      return;
                    }
                    setSelectedFile(file);
                  } else {
                    setSelectedFile(null);
                  }
                }}
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Supported formats: PDF, DOC, DOCX, PPT, PPTX (Max 10MB)
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPremium"
                checked={formData.isPremium}
                onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="isPremium" className="text-sm text-gray-700">
                Mark as premium content
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-green-700 disabled:opacity-50"
              >
                {isUploading ? "Uploading..." : "Upload Document"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
