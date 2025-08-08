import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface Profile {
  _id: string;
  displayName: string;
  university: string;
  course: string;
  year: number;
  country: string;
  bio?: string;
  reputation: number;
  documentsShared: number;
  helpfulAnswers: number;
  studyStreak: number;
  achievements: string[];
}

export function ProfileCard({ profile }: { profile: Profile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile.displayName,
    university: profile.university,
    course: profile.course,
    year: profile.year,
    country: profile.country,
    bio: profile.bio || "",
  });

  const updateProfile = useMutation(api.profiles.updateProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully! ✨");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: profile.displayName,
      university: profile.university,
      course: profile.course,
      year: profile.year,
      country: profile.country,
      bio: profile.bio || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-orange-500 to-green-600 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl font-bold">
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profile.displayName}</h1>
              <p className="text-orange-100">
                {profile.course} • Year {profile.year}
              </p>
              <p className="text-orange-100">
                {profile.university} • {profile.country}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 text-center border border-orange-100">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {profile.reputation}
          </div>
          <div className="text-sm text-gray-600">Reputation Points</div>
        </div>
        <div className="bg-white rounded-lg p-6 text-center border border-green-100">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {profile.documentsShared}
          </div>
          <div className="text-sm text-gray-600">Documents Shared</div>
        </div>
        <div className="bg-white rounded-lg p-6 text-center border border-blue-100">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {profile.helpfulAnswers}
          </div>
          <div className="text-sm text-gray-600">Helpful Answers</div>
        </div>
        <div className="bg-white rounded-lg p-6 text-center border border-purple-100">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {profile.studyStreak}
          </div>
          <div className="text-sm text-gray-600">Study Streak</div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University
                </label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course
                </label>
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year of Study
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                  <option value={5}>5th Year</option>
                  <option value={6}>Graduate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                placeholder="Tell us about your academic interests and goals..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-orange-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-green-700 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
            {profile.bio ? (
              <p className="text-gray-700 mb-6">{profile.bio}</p>
            ) : (
              <p className="text-gray-500 italic mb-6">No bio added yet.</p>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Academic Details</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div><span className="font-medium">University:</span> {profile.university}</div>
                  <div><span className="font-medium">Course:</span> {profile.course}</div>
                  <div><span className="font-medium">Year:</span> {profile.year}</div>
                  <div><span className="font-medium">Country:</span> {profile.country}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Achievements</h4>
                {profile.achievements.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.achievements.map((achievement, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-orange-100 to-green-100 text-orange-700 text-xs px-3 py-1 rounded-full"
                      >
                        🏆 {achievement}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No achievements yet. Keep contributing!</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              📚
            </div>
            <div>
              <span className="text-gray-900">Shared {profile.documentsShared} documents</span>
              <div className="text-gray-500">Helping fellow students learn</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              💡
            </div>
            <div>
              <span className="text-gray-900">Provided {profile.helpfulAnswers} helpful answers</span>
              <div className="text-gray-500">Contributing to the community</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              ⭐
            </div>
            <div>
              <span className="text-gray-900">Earned {profile.reputation} reputation points</span>
              <div className="text-gray-500">Building academic credibility</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
