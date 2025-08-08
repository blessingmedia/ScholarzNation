import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

const AFRICAN_COUNTRIES = [
  "Nigeria", "South Africa", "Kenya", "Ghana", "Egypt", "Morocco", "Ethiopia", 
  "Uganda", "Tanzania", "Zimbabwe", "Botswana", "Rwanda", "Senegal", "Tunisia",
  "Algeria", "Cameroon", "Ivory Coast", "Zambia", "Mozambique", "Madagascar"
];

const UNIVERSITIES = [
  "University of Cape Town", "University of the Witwatersrand", "Makerere University",
  "University of Nairobi", "Cairo University", "University of Ghana", "Addis Ababa University",
  "University of Lagos", "Stellenbosch University", "American University in Cairo",
  "University of Pretoria", "Rhodes University", "Kwame Nkrumah University", "Other"
];

export function ProfileSetup() {
  const [formData, setFormData] = useState({
    displayName: "",
    university: "",
    course: "",
    year: 1,
    country: "",
    bio: "",
  });

  const createProfile = useMutation(api.profiles.createProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName.trim() || !formData.university || !formData.course.trim() || !formData.country) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.displayName.trim().length < 2) {
      toast.error("Display name must be at least 2 characters long");
      return;
    }

    setIsSubmitting(true);
    try {
      await createProfile(formData);
      toast.success("Welcome to Scholarz Nation! 🎉");
    } catch (error) {
      toast.error("Failed to create profile. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-2">
            Complete Your Profile
          </h2>
          <p className="text-gray-600">
            Let's set up your academic profile to connect you with the right community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name *
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="How should we call you?"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select your country</option>
                {AFRICAN_COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University *
              </label>
              <select
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select your university</option>
                {UNIVERSITIES.map(uni => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course/Major *
              </label>
              <input
                type="text"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., Computer Science, Medicine"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year of Study
              </label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
                <option value={5}>5th Year</option>
                <option value={6}>Graduate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio (Tell us about yourself)
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Tell us about your academic interests and goals..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating Profile..." : "Join Scholarz Nation"}
          </button>
        </form>
      </div>
    </div>
  );
}
