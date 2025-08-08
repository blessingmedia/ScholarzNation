import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function StudyGroups() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  
  const studyGroups = useQuery(api.studyGroups.getStudyGroups, {
    subject: selectedSubject || undefined,
  });
  
  const userGroups = useQuery(api.studyGroups.getUserGroups);

  const subjects = [
    "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science",
    "Engineering", "Medicine", "Business", "Economics", "Law", "Literature"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Study Groups</h2>
          <p className="text-gray-600">Collaborate and learn together</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-orange-500 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-green-700 transition-all"
        >
          👥 Create Group
        </button>
      </div>

      {/* My Groups */}
      {userGroups && userGroups.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Study Groups</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {userGroups.map((group) => (
              <div key={group._id} className="bg-gradient-to-r from-orange-100 to-green-100 rounded-lg p-4 border-2 border-orange-200">
                <h4 className="font-semibold text-gray-900 mb-2">{group.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-600 font-medium">{group.subject}</span>
                  <span className="text-gray-500">{group.members.length}/{group.maxMembers} members</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">
              Open Groups
            </button>
            <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
              Active Now
            </button>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studyGroups?.map((group) => (
          <StudyGroupCard key={group._id} group={group} />
        ))}
      </div>

      {studyGroups?.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No study groups found</h3>
          <p className="text-gray-600">Create the first study group for this subject!</p>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

function StudyGroupCard({ group }: { group: any }) {
  const joinGroup = useMutation(api.studyGroups.joinStudyGroup);
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      await joinGroup({ groupId: group._id });
      toast.success("Joined study group! 🎉");
    } catch (error: any) {
      toast.error(error.message || "Failed to join group");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="text-2xl">👥</div>
        {group.isPrivate && (
          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
            🔒 Private
          </span>
        )}
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-2">{group.name}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <span className="font-medium">{group.subject}</span>
          <span className="mx-2">•</span>
          <span>{group.university}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span>Created by {group.creatorName}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span>{group.memberCount}/{group.maxMembers} members</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {group.tags.slice(0, 3).map((tag: string) => (
          <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>

      <button
        onClick={handleJoin}
        disabled={isJoining || group.memberCount >= group.maxMembers}
        className="w-full bg-gradient-to-r from-orange-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isJoining ? "Joining..." : group.memberCount >= group.maxMembers ? "Group Full" : "Join Group"}
      </button>
    </div>
  );
}

function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subject: "",
    university: "",
    maxMembers: 10,
    isPrivate: false,
    tags: "",
  });

  const createGroup = useMutation(api.studyGroups.createStudyGroup);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.subject) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createGroup({
        name: formData.name,
        description: formData.description,
        subject: formData.subject,
        university: formData.university,
        maxMembers: formData.maxMembers,
        isPrivate: formData.isPrivate,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      });
      
      toast.success("Study group created! 🎉");
      onClose();
    } catch (error) {
      toast.error("Failed to create study group");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Create Study Group</h3>
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
                Group Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., Calculus Study Warriors"
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
                placeholder="What will your group focus on? What are your goals?"
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
                  placeholder="e.g., Mathematics, Physics"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University
                </label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                  placeholder="Your university (optional)"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Members
                </label>
                <select
                  value={formData.maxMembers}
                  onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                >
                  <option value={5}>5 members</option>
                  <option value={10}>10 members</option>
                  <option value={15}>15 members</option>
                  <option value={20}>20 members</option>
                  <option value={25}>25 members</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isPrivate" className="text-sm text-gray-700">
                  Private group (invite only)
                </label>
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
                placeholder="e.g., exam prep, homework help, project collaboration"
              />
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
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-orange-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-green-700 disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create Group"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
