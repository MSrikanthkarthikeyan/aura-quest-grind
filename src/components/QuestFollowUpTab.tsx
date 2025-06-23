
import React, { useState } from 'react';
import { MessageCircle, ExternalLink, Lightbulb, Send, Loader2 } from 'lucide-react';
import { QuestSubtask, QuestFollowUp } from '../types/quest';
import { generateFollowUpResponse } from '../services/questFollowUpService';

interface QuestFollowUpTabProps {
  questTitle: string;
  category: string;
  subtasks: QuestSubtask[];
  followUps: QuestFollowUp[];
  onAddFollowUp: (followUp: QuestFollowUp) => void;
}

const QuestFollowUpTab: React.FC<QuestFollowUpTabProps> = ({
  questTitle,
  category,
  subtasks,
  followUps,
  onAddFollowUp
}) => {
  const [selectedSubtask, setSelectedSubtask] = useState<string>('');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedFollowUp, setExpandedFollowUp] = useState<string | null>(null);

  const handleSubmitQuery = async () => {
    if (!selectedSubtask || !query.trim()) return;

    const subtask = subtasks.find(s => s.id === selectedSubtask);
    if (!subtask) return;

    setIsLoading(true);
    try {
      const response = await generateFollowUpResponse({
        questTitle,
        subtaskTitle: subtask.title,
        subtaskDescription: subtask.description,
        userQuery: query,
        category
      });

      const newFollowUp: QuestFollowUp = {
        questId: questTitle, // Using title as ID for now
        subtaskId: selectedSubtask,
        query,
        response: response.response,
        resources: response.resources,
        timestamp: new Date().toISOString()
      };

      onAddFollowUp(newFollowUp);
      setQuery('');
      setExpandedFollowUp(newFollowUp.timestamp);
    } catch (error) {
      console.error('Error generating follow-up response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFollowUpsForSubtask = (subtaskId: string) => {
    return followUps.filter(f => f.subtaskId === subtaskId);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      {/* Query Section */}
      <div className="bg-gradient-to-br from-gray-900/90 to-purple-900/40 rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold mb-4 text-purple-300">Ask for Help & Resources</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Select Subtask</label>
            <select
              value={selectedSubtask}
              onChange={(e) => setSelectedSubtask(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white"
            >
              <option value="">Choose a subtask...</option>
              {subtasks.map(subtask => (
                <option key={subtask.id} value={subtask.id}>
                  {subtask.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Your Question</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about resources, strategies, or specific help you need..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white h-24 resize-none"
            />
          </div>

          <button
            onClick={handleSubmitQuery}
            disabled={!selectedSubtask || !query.trim() || isLoading}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            <span>{isLoading ? 'Getting Help...' : 'Get AI Assistance'}</span>
          </button>
        </div>
      </div>

      {/* Follow-ups by Subtask */}
      <div className="space-y-4">
        {subtasks.map(subtask => {
          const subtaskFollowUps = getFollowUpsForSubtask(subtask.id);
          if (subtaskFollowUps.length === 0) return null;

          return (
            <div key={subtask.id} className="bg-gradient-to-br from-gray-900/80 to-cyan-900/30 rounded-xl p-5 border border-cyan-500/30">
              <h4 className="text-lg font-semibold mb-3 text-cyan-300">{subtask.title}</h4>
              
              <div className="space-y-3">
                {subtaskFollowUps.map(followUp => (
                  <div key={followUp.timestamp} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <MessageCircle size={16} className="text-purple-400" />
                        <span className="text-sm font-medium text-purple-300">Your Question:</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatTimestamp(followUp.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 mb-3 italic">"{followUp.query}"</p>
                    
                    <button
                      onClick={() => setExpandedFollowUp(
                        expandedFollowUp === followUp.timestamp ? null : followUp.timestamp
                      )}
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                    >
                      {expandedFollowUp === followUp.timestamp ? 'Hide Response' : 'View AI Response'}
                    </button>

                    {expandedFollowUp === followUp.timestamp && followUp.response && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <h5 className="text-sm font-semibold text-green-400 mb-2">AI Response:</h5>
                          <p className="text-gray-300 text-sm leading-relaxed">{followUp.response}</p>
                        </div>

                        {followUp.resources && followUp.resources.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold text-blue-400 mb-2 flex items-center space-x-1">
                              <ExternalLink size={14} />
                              <span>Recommended Resources:</span>
                            </h5>
                            <ul className="space-y-1">
                              {followUp.resources.map((resource, index) => (
                                <li key={index} className="text-xs text-gray-400 flex items-start space-x-1">
                                  <span className="text-blue-400">•</span>
                                  <span>{resource}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {followUps.length === 0 && (
        <div className="text-center py-8">
          <Lightbulb className="mx-auto mb-3 text-gray-500" size={32} />
          <p className="text-gray-400">No follow-up queries yet.</p>
          <p className="text-gray-500 text-sm">Ask questions about your subtasks to get AI-powered help and resources!</p>
        </div>
      )}
    </div>
  );
};

export default QuestFollowUpTab;
