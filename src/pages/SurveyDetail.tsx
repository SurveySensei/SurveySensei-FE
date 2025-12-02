import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

interface SurveyDetail {
  surveyId: string;
  creator?: string;
  totalReward?: string;
  targetResponses?: number;
  description?: string;
}

export default function SurveyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<SurveyDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('https://surveysensei-agent.rahmandana08.workers.dev/agent/survey-detail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'detail', surveyId: id }),
        });
        if (!res.ok) throw new Error('Failed to fetch survey detail');
        const data = await res.json();
        const d = data.detail || data.survey || data;
        setDetail({
          surveyId: d.surveyId || id,
          creator: d.creator,
          totalReward: d.totalReward,
          targetResponses: d.targetResponses,
          description: d.description,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const shareUrl = `${window.location.origin}/survey/${id}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Survey Detail</h1>
          <Link to="/surveys" className="text-blue-600">Back to My Surveys</Link>
        </div>
        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {detail && (
          <div className="bg-white p-6 rounded shadow space-y-3">
            <p className="font-mono text-sm">ID: {detail.surveyId}</p>
            {detail.creator && <p className="text-sm">Creator: {detail.creator}</p>}
            <p className="text-sm">Total Reward: {detail.totalReward ?? '-'}</p>
            <p className="text-sm">Target Responses: {detail.targetResponses ?? '-'}</p>
            {detail.description && <p className="text-sm text-gray-700">{detail.description}</p>}
            <div className="pt-2 flex gap-2">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(shareUrl);
                }}
                className="bg-gray-100 text-gray-800 py-2 px-4 rounded hover:bg-gray-200"
              >Copy Share Link</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
