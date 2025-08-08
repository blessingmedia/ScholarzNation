import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { DocumentLibrary } from "./DocumentLibrary";
import { QASection } from "./QASection";
import { StudyGroups } from "./StudyGroups";
import { AITutor } from "./AITutor";
import { ProfileCard } from "./ProfileCard";

type TabType = "documents" | "questions" | "groups" | "ai" | "profile";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("documents");
  const profile = useQuery(api.profiles.getCurrentProfile);

  const tabs = [
    { id: "documents" as TabType, name: "Documents", icon: "📚" },
    { id: "questions" as TabType, name: "Q&A", icon: "❓" },
    { id: "groups" as TabType, name: "Study Groups", icon: "👥" },
    { id: "ai" as TabType, name: "AI Tutor", icon: "🧠" },
    { id: "profile" as TabType, name: "Profile", icon: "👤" },
  ];

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profile.displayName}! 👋
        </h1>
        <p className="text-gray-600">
          {profile.university} • {profile.course} • Year {profile.year}
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 border border-orange-100">
            <div className="text-2xl font-bold text-orange-600">{profile.reputation}</div>
            <div className="text-sm text-gray-600">Reputation</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="text-2xl font-bold text-green-600">{profile.documentsShared}</div>
            <div className="text-sm text-gray-600">Documents Shared</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-2xl font-bold text-blue-600">{profile.helpfulAnswers}</div>
            <div className="text-sm text-gray-600">Helpful Answers</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <div className="text-2xl font-bold text-purple-600">{profile.studyStreak}</div>
            <div className="text-sm text-gray-600">Study Streak</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[60vh]">
        {activeTab === "documents" && <DocumentLibrary />}
        {activeTab === "questions" && <QASection />}
        {activeTab === "groups" && <StudyGroups />}
        {activeTab === "ai" && <AITutor />}
        {activeTab === "profile" && <ProfileCard profile={profile} />}
      </div>
    </div>
  );
}
