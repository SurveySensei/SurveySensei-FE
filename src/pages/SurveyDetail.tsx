import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Container from '@/components/Container';
import { useActiveAccount } from 'thirdweb/react';
import { Loader2 } from 'lucide-react';

interface SurveyDetail {
  surveyId: string;
  creator?: string;
  totalReward?: string;
  targetResponses?: number;
  description?: string;
  title?: string;
  createdAt?: number | string;
}

interface SurveyStats {
  totalResponses: number;
  totalValidWallets: number;
  avgScore: number | null;
  wallets: any[];
}

export default function SurveyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const account = useActiveAccount();
  const [detail, setDetail] = useState<SurveyDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState<boolean | null>(null);
  const [stats, setStats] = useState<SurveyStats | null>(null);

  const loadDetail = async () => {
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
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Unexpected response format');
      }
      const d = data.survey || data.detail || data;
      setDetail({
        surveyId: d.surveyId || d.id || id,
        creator: d.creatorWallet || d.creator,
        totalReward: String(d.totalReward ?? ''),
        targetResponses: d.targetResponses,
        description: d.description,
        title: d.title,
        createdAt: d.createdAt,
      });
      if (data.stats) {
        setStats({
          totalResponses: data.stats.totalResponses ?? 0,
          totalValidWallets: data.stats.totalValidWallets ?? 0,
          avgScore: data.stats.avgScore ?? null,
          wallets: data.stats.wallets ?? [],
        });
      }
      if (d.creatorWallet && account?.address) {
        setIsCreator(String(d.creatorWallet).toLowerCase() === account.address.toLowerCase());
      } else if (d.creator && account?.address) {
        setIsCreator(String(d.creator).toLowerCase() === account.address.toLowerCase());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id, account?.address]);

  const shareUrl = `${window.location.origin}/survey/${id}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Survey Detail</h1>
            {loading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
          </div>
          <div className="flex items-center gap-2">
            {detail && account?.address && detail.creator && account.address.toLowerCase() === detail.creator.toLowerCase() && (
              <Link to="/surveys" className="text-blue-600">Back to My Surveys</Link>
            )}
            {id && (!account?.address || !detail?.creator || String(detail.creator).toLowerCase() !== account.address.toLowerCase()) && (
              <Link to={`/answer/${id}`} className="bg-blue-600 text-white py-1 px-3 rounded">Answer Survey</Link>
            )}
          </div>
        </div>
        {loading && <p className="text-gray-600">Loading...</p>}
        {error && (
          <div className="text-sm text-red-600 flex items-center gap-2">
            <span>{error}</span>
            <button onClick={loadDetail} className="text-blue-600 underline">Retry</button>
          </div>
        )}
        {detail && (
          <div className="bg-white p-6 rounded shadow space-y-3">
            {detail.title && <p className="text-sm font-semibold">{detail.title}</p>}
            <p className="font-mono text-sm">ID: {detail.surveyId}</p>
            {detail.creator && <p className="text-sm">Creator: {detail.creator}</p>}
            <p className="text-sm">Total Reward: {detail.totalReward ?? '-'}</p>
            <p className="text-sm">Target Responses: {detail.targetResponses ?? '-'}</p>
            {detail.description && <p className="text-sm text-gray-700">{detail.description}</p>}
            {detail && account?.address && detail.creator && account.address.toLowerCase() === detail.creator.toLowerCase() && (
              <div className="pt-2 flex gap-2">
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(shareUrl);
                  }}
                  className="bg-gray-100 text-gray-800 py-2 px-4 rounded hover:bg-gray-200"
                >Copy Share Link</button>
              </div>
            )}
            {isCreator && stats && (
              <div className="mt-4 rounded border p-4">
                <p className="text-sm font-semibold mb-2">Stats</p>
                <p className="text-sm">Total Responses: {stats.totalResponses}</p>
                <p className="text-sm">Total Valid Wallets: {stats.totalValidWallets}</p>
                <p className="text-sm">Average Score: {stats.avgScore ?? '-'}</p>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
