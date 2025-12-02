import { useState } from 'react';
import { ConnectButton, useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { client, wallets } from '../config/thirdweb';
import { buildCreateSurveyTransaction } from '../utils/blockchain';
import { useStatusMessages } from '../hooks/useStatusMessages';
import { Link, useNavigate } from 'react-router-dom';
import { StatusDisplay } from '../components/StatusDisplay';

export default function CreateSurvey() {
  const activeAccount = useActiveAccount();
  const [surveyDescription, setSurveyDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { messages: statusMessages, addMessage: addStatusMessage, updateMessage } = useStatusMessages();
  const { mutateAsync: sendTransactionAsync } = useSendTransaction();
  const [latestSurveyId, setLatestSurveyId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreateSurvey = async () => {
    if (!activeAccount || !surveyDescription.trim()) return;

    setIsCreating(true);
    const genId = addStatusMessage('Generating AI plan...', 'info');

    try {
      // Call AI Agent API
      const response = await fetch('https://surveysensei-agent.rahmandana08.workers.dev/agent/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `${surveyDescription} Wallet saya: ${activeAccount.address}`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate survey parameters');
      }

      const data = await response.json();
      const { surveyId, totalReward, targetResponses } = data.survey;

      updateMessage(genId, { type: 'success', text: 'AI plan generated successfully!' });
      addStatusMessage('Survey parameters generated successfully!', 'success');
      addStatusMessage(`Survey ID: ${surveyId}`, 'info');
      addStatusMessage(`Total Reward: ${totalReward}`, 'info');
      addStatusMessage(`Target Responses: ${targetResponses}`, 'info');
      setLatestSurveyId(surveyId);
      try { localStorage.setItem('latestSurveyId', surveyId); } catch {}

      const prepId = addStatusMessage('Preparing blockchain transaction...', 'info');
      
      if (activeAccount) {
        const tx = buildCreateSurveyTransaction(activeAccount, {
          surveyId,
          totalReward,
          targetResponses,
        });

        const result = await sendTransactionAsync(tx);
        updateMessage(prepId, { type: 'success', text: 'Blockchain transaction prepared' });
        addStatusMessage('Blockchain transaction submitted!', 'success');
        addStatusMessage(`Transaction hash: ${result.transactionHash}`, 'info');
      }

      addStatusMessage('Survey created successfully!', 'success');
      
      // Optional: navigate to detail page CTA can remain here
      // Provide quick actions below the button
      
      setIsCreating(false);

    } catch (error) {
      addStatusMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">SurveySensei</h1>
          <p className="text-base sm:text-lg text-gray-600">Create blockchain-based surveys with crypto rewards</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          {/* Wallet Connection */}
          <div className="mb-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Connect Your Wallet</h2>
            <ConnectButton
              client={client}
              wallets={wallets}
              theme="light"
              connectModal={{ size: 'wide' }}
            />
          </div>

          {/* Survey Description Input */}
          <div className="mb-6">
            <label htmlFor="survey-description" className="block text-sm font-medium text-gray-700 mb-2">
              Survey Description
            </label>
            <textarea
              id="survey-description"
              value={surveyDescription}
              onChange={(e) => setSurveyDescription(e.target.value)}
              placeholder="Describe your survey requirements... (e.g., Make a survey about hoodies for crypto enthusiasts with 100 responses and 1 BNB total reward)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
              maxLength={500}
              disabled={!activeAccount || isCreating}
            />
            <div className="mt-1 text-right text-sm text-gray-500">
              {surveyDescription.length}/500 characters
            </div>
          </div>

          {/* Create Survey Button */}
          <div className="mb-6">
            <button
              onClick={handleCreateSurvey}
              disabled={!activeAccount || !surveyDescription.trim() || isCreating}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Survey...
                </div>
              ) : (
                'Create Survey'
              )}
            </button>
          </div>

          {latestSurveyId && (
            <div className="mb-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={async () => {
                  const shareUrl = `${window.location.origin}/survey/${latestSurveyId}`;
                  await navigator.clipboard.writeText(shareUrl);
                  addStatusMessage('Share link copied to clipboard', 'success');
                }}
                className="w-full sm:w-auto bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200"
              >
                Copy Share Link
              </button>
              <Link
                to={`/survey/${latestSurveyId}`}
                className="w-full sm:w-auto text-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                View Survey Details
              </Link>
              <Link
                to={`/surveys`}
                className="w-full sm:w-auto text-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
              >
                My Surveys
              </Link>
            </div>
          )}

          {/* Status Messages */}
          <StatusDisplay messages={statusMessages} />
        </div>
      </div>
    </div>
  );
}
