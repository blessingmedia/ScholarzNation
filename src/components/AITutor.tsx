import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function AITutor() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const userSessions = useQuery(api.ai.getUserSessions);
  const activeSession = useQuery(
    api.ai.getSession,
    activeSessionId ? { sessionId: activeSessionId as any } : "skip"
  );

  const startTutoring = useAction(api.ai.startAITutoring);
  const continueTutoring = useAction(api.ai.continueAITutoring);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    setIsLoading(true);
    try {
      if (activeSessionId) {
        await continueTutoring({
          sessionId: activeSessionId as any,
          message: currentMessage,
        });
      }
      setCurrentMessage("");
      toast.success("Message sent!");
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Tutor - Kwame</h2>
          <p className="text-gray-600">Get personalized academic help from our AI tutor</p>
        </div>
        <button
          onClick={() => setShowNewSessionModal(true)}
          className="bg-gradient-to-r from-orange-500 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-green-700 transition-all"
        >
          🧠 New Session
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sessions Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Sessions</h3>
            <div className="space-y-2">
              {userSessions?.map((session) => (
                <button
                  key={session._id}
                  onClick={() => setActiveSessionId(session._id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeSessionId === session._id
                      ? "bg-orange-100 border-orange-200 border"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium text-sm">{session.topic}</div>
                  <div className="text-xs text-gray-500">{session.subject}</div>
                </button>
              ))}
              {(!userSessions || userSessions.length === 0) && (
                <p className="text-gray-500 text-sm">No sessions yet. Start your first one!</p>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
            {activeSession ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">{activeSession.topic}</h3>
                  <p className="text-sm text-gray-600">{activeSession.subject}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {activeSession.messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <div className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Ask Kwame anything..."
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !currentMessage.trim()}
                      className="bg-gradient-to-r from-orange-500 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "..." : "Send"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🧠</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Meet Kwame</h3>
                  <p className="text-gray-600 mb-4">Your AI tutor ready to help you excel</p>
                  <button
                    onClick={() => setShowNewSessionModal(true)}
                    className="bg-gradient-to-r from-orange-500 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-green-700"
                  >
                    Start Learning
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Session Modal */}
      {showNewSessionModal && (
        <NewSessionModal
          onClose={() => setShowNewSessionModal(false)}
          onSessionCreated={(sessionId) => {
            setActiveSessionId(sessionId);
            setShowNewSessionModal(false);
          }}
        />
      )}
    </div>
  );
}

function NewSessionModal({ 
  onClose, 
  onSessionCreated 
}: { 
  onClose: () => void;
  onSessionCreated: (sessionId: string) => void;
}) {
  const [formData, setFormData] = useState({
    subject: "",
    topic: "",
    initialQuestion: "",
  });

  const startTutoring = useAction(api.ai.startAITutoring);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.topic || !formData.initialQuestion) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await startTutoring({
        subject: formData.subject,
        topic: formData.topic,
        initialQuestion: formData.initialQuestion,
      });
      
      toast.success("Session started with Kwame! 🧠");
      onSessionCreated(result.sessionId);
    } catch (error) {
      toast.error("Failed to start session");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Start AI Tutoring Session</h3>
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
                Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., Mathematics, Physics, Chemistry"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic *
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., Calculus, Organic Chemistry, Linear Algebra"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to learn? *
              </label>
              <textarea
                value={formData.initialQuestion}
                onChange={(e) => setFormData({ ...formData, initialQuestion: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                placeholder="Describe what you're struggling with or what you'd like to understand better..."
                required
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
                {isSubmitting ? "Starting..." : "Start Session"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
