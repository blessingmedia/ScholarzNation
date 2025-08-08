import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { ProfileSetup } from "./components/ProfileSetup";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SN</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                  Scholarz Nation
                </h1>
                <p className="text-xs text-gray-600">Academic Excellence for Africa</p>
              </div>
            </div>
            <Authenticated>
              <SignOutButton />
            </Authenticated>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Content />
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">SN</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">Scholarz Nation</span>
            </div>
            <p className="text-gray-600 mb-2">Empowering African Students Through Collaborative Learning</p>
            <p className="text-sm text-gray-500">
              Built with ❤️ for the future leaders of Africa
            </p>
          </div>
        </div>
      </footer>
      
      <Toaster position="top-right" />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const profile = useQuery(api.profiles.getCurrentProfile);

  if (loggedInUser === undefined || profile === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <>
      <Unauthenticated>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-600 via-red-500 to-green-600 bg-clip-text text-transparent">
                Scholarz Nation
              </span>
            </h1>
            <p className="text-xl text-gray-700 mb-4">
              Empowering African Students Through Collaborative Learning
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of students sharing knowledge, getting homework help, 
              and building the future of African academic excellence together.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Document Sharing</h3>
              <p className="text-gray-600">Access thousands of study materials, notes, and past papers from top African universities.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Peer Learning</h3>
              <p className="text-gray-600">Connect with study groups, get homework help, and collaborate with brilliant minds.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Tutoring</h3>
              <p className="text-gray-600">Get personalized help from Kwame, our AI tutor designed for African students.</p>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        {!profile ? <ProfileSetup /> : <Dashboard />}
      </Authenticated>
    </>
  );
}
