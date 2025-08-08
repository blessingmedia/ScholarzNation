import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function QASection() {
  const [showAskModal, setShowAskModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  
  const questions = useQuery(api.questions.getQuestions, {
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
          <h2 className="text-2xl font-bold text-gray-900">Questions & Answers</h2>
          <p className="text-gray-600">Get help from the community</p>
        </div>
        <button
          onClick={() => setShowAskModal(true)}
          className="bg-gradient-to-r from-orange-500 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-green-700 transition-all"
        >
          ❓ Ask Question
        </button>
      </div>

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
              Unanswered
            </button>
            <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
              Solved
            </button>
            <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
              Bounty
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions?.map((question) => (
          <QuestionCard key={question._id} question={question} />
        ))}
      </div>

      {questions?.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❓</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No questions found</h3>
          <p className="text-gray-600">Be the first to ask a question in this subject!</p>
        </div>
      )}

      {/* Ask Question Modal */}
      {showAskModal && (
        <AskQuestionModal onClose={() => setShowAskModal(false)} />
      )}
    </div>
  );
}

function QuestionCard({ question }: { question: any }) {
  const [showAnswers, setShowAnswers] = useState(false);
  const [answerText, setAnswerText] = useState("");
  
  const answers = useQuery(api.questions.getAnswers, 
    showAnswers ? { questionId: question._id } : "skip"
  );
  const answerQuestion = useMutation(api.questions.answerQuestion);

  const handleAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim()) return;

    try {
      await answerQuestion({
        questionId: question._id,
        content: answerText,
      });
      setAnswerText("");
      toast.success("Answer submitted! 🎉");
    } catch (error) {
      toast.error("Failed to submit answer");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">{question.title}</h3>
          <p className="text-gray-700 mb-3">{question.content}</p>
          
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <span className="font-medium">{question.subject}</span>
            <span className="mx-2">•</span>
            <span>{question.university}</span>
            <span className="mx-2">•</span>
            <span>By {question.askerName}</span>
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            {question.tags.map((tag: string) => (
              <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2">
          {question.isResolved && (
            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
              ✅ Solved
            </span>
          )}
          {question.bounty && (
            <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
              💰 {question.bounty} pts
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>👁️ {question.views} views</span>
          <span>👍 {question.upvotes} upvotes</span>
        </div>
        
        <button
          onClick={() => setShowAnswers(!showAnswers)}
          className="text-orange-600 hover:text-orange-700 font-medium"
        >
          {showAnswers ? "Hide Answers" : "View Answers"}
        </button>
      </div>

      {/* Answers Section */}
      {showAnswers && (
        <div className="mt-6 border-t pt-6">
          {/* Answer Form */}
          <form onSubmit={handleAnswer} className="mb-6">
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Share your knowledge and help a fellow scholar..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!answerText.trim()}
                className="bg-gradient-to-r from-orange-500 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            </div>
          </form>

          {/* Answers List */}
          <div className="space-y-4">
            {answers?.map((answer) => (
              <div key={answer._id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{answer.answererName}</span>
                    <span className="text-sm text-gray-500">
                      ⭐ {answer.answererReputation} reputation
                    </span>
                  </div>
                  {answer.isAccepted && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                      ✅ Accepted
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-3">{answer.content}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>👍 {answer.upvotes}</span>
                  <span>👎 {answer.downvotes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AskQuestionModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    subject: "",
    course: "",
    university: "",
    tags: "",
    bounty: "",
  });

  const askQuestion = useMutation(api.questions.askQuestion);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.subject) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await askQuestion({
        title: formData.title,
        content: formData.content,
        subject: formData.subject,
        course: formData.course,
        university: formData.university,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
        bounty: formData.bounty ? parseInt(formData.bounty) : undefined,
      });
      
      toast.success("Question posted! 🎉");
      onClose();
    } catch (error) {
      toast.error("Failed to post question");
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
            <h3 className="text-xl font-bold">Ask a Question</h3>
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
                Question Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                placeholder="What's your question about?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Details *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                placeholder="Provide more details about your question. Include what you've tried and where you're stuck."
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
                  Course
                </label>
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Calculus I, Organic Chemistry"
                />
              </div>
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
                  placeholder="Your university"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bounty (Optional)
                </label>
                <input
                  type="number"
                  value={formData.bounty}
                  onChange={(e) => setFormData({ ...formData, bounty: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                  placeholder="Reputation points to offer"
                />
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
                placeholder="e.g., calculus, derivatives, limits"
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
                {isSubmitting ? "Posting..." : "Post Question"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
