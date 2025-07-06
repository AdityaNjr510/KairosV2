import React, { useState, useEffect } from 'react';
import { ChevronDown, Send, Loader2, Sunrise, Sparkles } from 'lucide-react';

export default function SidebarMorningPulse() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Energy-based emojis from 1 (low energy) to 5 (high energy)
  const emojis = [
    { emoji: '😴', level: 1, label: 'Low Energy' },
    { emoji: '😌', level: 2, label: 'Calm' },
    { emoji: '😊', level: 3, label: 'Good' },
    { emoji: '💪', level: 4, label: 'Strong' },
    { emoji: '🔥', level: 5, label: 'High Energy' }
  ];

  // Get user email on component mount
  useEffect(() => {
    if (window.google?.script?.run) {
      google.script.run
        .withSuccessHandler((email) => {
          setUserEmail(email || '');
        })
        .withFailureHandler((err) => {
          console.error('Error fetching email:', err);
          setUserEmail('');
        })
        .getUserEmail();
    }
  }, []);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const handleSubmit = async () => {
    if (!selectedEmoji || !textInput.trim() || !userEmail) return;

    setIsLoading(true);

    const payload = {
      student_id: userEmail,
      emoji: selectedEmoji,
      text_input: textInput.trim(),
      timestamp: new Date().toISOString()
    };

    try {
      // Using Google Apps Script to make the API call
      google.script.run
        .withSuccessHandler((result) => {
        console.log(payload)
          console.log('Daily check-in submitted:', result);
          setIsSubmitted(true);
          setIsLoading(false);
          // Reset form after successful submission
          setTimeout(() => {
            setSelectedEmoji('');
            setTextInput('');
            setIsSubmitted(false);
          }, 2000);
        })
        .withFailureHandler((error) => {
          console.error('Error submitting daily check-in:', error);
          setIsLoading(false);
          // Handle error state here
        })
        .processDailyCheckin(payload);
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getStatusClass = () => {
    if (isSubmitted) return 'text-green-600';
    if (isLoading) return 'text-blue-600';
    return 'text-orange-600';
  };

  const getStatusDot = () => {
    if (isSubmitted) return 'bg-green-500';
    if (isLoading) return 'bg-blue-500';
    return 'bg-orange-500';
  };

  return (
    <div className="w-full font-sans">
      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-200">
        {/* Header Area */}
        <div
          onClick={toggleExpanded}
          className="p-3 cursor-pointer hover:bg-gray-50 transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Sunrise className={`w-6 h-6 ${getStatusClass()}`} />
                <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${getStatusDot()}`}></div>
              </div>
              <div>
                <div className="font-medium text-gray-900 text-base">Morning Pulse</div>
                <div className="text-sm text-gray-500">
                  {isLoading ? 'Submitting...' : 
                   isSubmitted ? 'Submitted today' : 
                   'Start your day!'}
                </div>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Expanded Section */}
        {isExpanded && (
          <div className="p-4 border-t border-gray-100">
            {/* Header Message */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">Ignite Your Spark — One Goal at a Time!</h3>
              </div>
              <p className="text-sm text-gray-600 font-medium">It's time to start your day!</p>
            </div>

            {/* Emoji Selection */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">How are you feeling today?</h4>
              <div className="flex justify-center space-x-2">
                {emojis.map((item) => (
                  <div key={item.level} className="text-center">
                    <button
                      onClick={() => setSelectedEmoji(item.emoji)}
                      className={`w-12 h-12 rounded-full text-2xl transition-all duration-200 ${
                        selectedEmoji === item.emoji
                          ? 'bg-orange-100 ring-2 ring-orange-500 scale-110'
                          : 'hover:bg-gray-100 hover:scale-105'
                      }`}
                      disabled={isLoading}
                    >
                      {item.emoji}
                    </button>
                    <div className="text-xs text-gray-500 mt-1">{item.level}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
                <span>Low Energy</span>
                <span>High Energy</span>
              </div>
            </div>

            {/* Daily Reflection */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Daily Reflection</h4>
              <h5 className="text-sm font-medium text-gray-700 mb-3">What Matters Most to You Today?</h5>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Today I want to focus on... / My main priority is... / I'm excited about..."
                rows="4"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mb-4">
              <button
                onClick={handleSubmit}
                disabled={!selectedEmoji || !textInput.trim() || !userEmail || isLoading}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  !selectedEmoji || !textInput.trim() || !userEmail || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Daily Pulse</span>
                  </>
                )}
              </button>
            </div>

            {/* Status Message */}
            <div className="text-center">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                isSubmitted
                  ? 'bg-green-100 text-green-800'
                  : isLoading
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {isSubmitted ? '✨ Daily pulse submitted!' : 
                 isLoading ? '⏰ Submitting...' : 
                 '🌅 Ready to capture your morning pulse'}
              </div>
            </div>

            {/* Tips */}
            {!isSubmitted && !isLoading && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h6 className="text-xs font-semibold text-gray-700 mb-2">💡 Tips for a great daily pulse:</h6>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Be honest about how you're feeling</li>
                  <li>• Focus on 1-2 key priorities for the day</li>
                  <li>• Think about what energizes you most</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}