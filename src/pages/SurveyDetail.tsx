import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Container from '@/components/Container';
import { useActiveAccount } from 'thirdweb/react';
import { Loader2 } from 'lucide-react';
import { Copy } from 'lucide-react';

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

interface SurveyResponseItem {
  id: string;
  wallet: string;
  status?: string;
  score?: number;
  explanation?: string;
  answers?: string[];
  createdAt?: number | string;
}

export default function SurveyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const account = useActiveAccount();
  const [detail, setDetail] = useState<SurveyDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState<boolean | null>(null);
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [responses, setResponses] = useState<SurveyResponseItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const loadDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const attempt = async () => {
      const res = await fetch('https://surveysensei-agent.rahmandana08.workers.dev/agent/survey-detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'detail', surveyId: id }),
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to fetch survey detail');
      const text = await res.text();
      const data = JSON.parse(text);
      const d = data.survey || data.detail || data;
      const nextDetail: SurveyDetail = {
        surveyId: d.surveyId || d.id || id,
        creator: d.creatorWallet || d.creator,
        totalReward: String(d.totalReward ?? ''),
        targetResponses: d.targetResponses,
        description: d.description,
        title: d.title,
        createdAt: d.createdAt,
      };
      setDetail(nextDetail);
      if ('stats' in data && data.stats) {
        setStats({
          totalResponses: data.stats.totalResponses ?? 0,
          totalValidWallets: data.stats.totalValidWallets ?? 0,
          avgScore: data.stats.avgScore ?? null,
          wallets: data.stats.wallets ?? [],
        });
      }
      if ('responses' in data) {
        const src = Array.isArray(data.responses)
          ? data.responses
          : Array.isArray(data.responses?.items)
            ? data.responses.items
            : Array.isArray(data.responses?.data)
              ? data.responses.data
              : null;
        if (src) {
          setResponses(
            src.map((r: any) => ({
              id: r.id,
              wallet: r.wallet,
              status: r.status,
              score: r.score,
              explanation: r.explanation,
              answers: r.answers,
              createdAt: r.createdAt,
            }))
          );
        } else if (!responses.length) {
          setResponses([]);
        }
      }
      if ((d.creatorWallet || d.creator) && account?.address) {
        const creatorAddr = String(d.creatorWallet || d.creator);
        setIsCreator(creatorAddr.toLowerCase() === account.address.toLowerCase());
      }
    };
    try {
      const delays = [400, 1000, 2000];
      for (let i = 0; i < delays.length; i++) {
        try {
          await attempt();
          setError(null);
          break;
        } catch (err) {
          if (i === delays.length - 1) throw err;
          await new Promise((r) => setTimeout(r, delays[i]));
        }
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

  const creatorMatch = !!(
    detail?.creator && account?.address &&
    detail.creator.toLowerCase() === account.address.toLowerCase()
  );

function shortWallet(addr?: string) {
  if (!addr) return '-';
  const s = String(addr);
  return s.length <= 12 ? s : `${s.slice(0, 6)}…${s.slice(-4)}`;
}

function shortId(id?: string) {
  if (!id) return '-';
  return id.length <= 12 ? id : `${id.slice(0, 6)}…${id.slice(-6)}`;
}

function formatDate(input?: number | string) {
  if (!input) return '-';
  const d = new Date(typeof input === 'number' ? input : input);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

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
            {id && !loading && detail && (!account?.address || !detail?.creator || String(detail.creator).toLowerCase() !== account.address.toLowerCase()) && (
              <Link to={`/answer/${id}`} className="bg-blue-600 text-white py-1 px-3 rounded">Answer Survey</Link>
            )}
          </div>
        </div>
        {loading && <p className="text-gray-600">Loading...</p>}
        {error && !detail && (
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
            {creatorMatch && stats && (
              <div className="mt-4 rounded border p-4">
                <p className="text-sm font-semibold mb-2">Stats</p>
                <p className="text-sm">Total Responses: {stats.totalResponses}</p>
                <p className="text-sm">Total Valid Wallets: {stats.totalValidWallets}</p>
                <p className="text-sm">Average Score: {stats.avgScore ?? '-'}</p>
              </div>
            )}
            {creatorMatch && responses.length > 0 && (
              <div className="mt-4 rounded border p-4">
                <p className="text-sm font-semibold mb-2">Responses</p>
                <ul className="space-y-3">
                  {responses.map((r) => (
                    <li key={r.id} className="rounded bg-gray-50 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-700 font-mono">{shortId(r.id)}</p>
                        <p className="text-xs text-gray-600">{formatDate(r.createdAt)}</p>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5">
                          <button
                            onClick={async () => { await navigator.clipboard.writeText(r.wallet); setToast('Wallet Copied'); setTimeout(() => setToast(null), 2000); }}
                            className="mr-1 text-gray-700 hover:text-gray-900"
                            aria-label="Copy wallet"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          Wallet: {shortWallet(r.wallet)}
                        </span>
                        {r.status && (
                          <span className={`inline-flex items-center rounded-full text-xs font-semibold px-2 py-0.5 ${r.status === 'VALID' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>Status: {r.status}</span>
                        )}
                        {typeof r.score === 'number' && (
                          <span className="inline-flex items-center rounded-full bg-yellow-50 text-yellow-700 text-xs font-semibold px-2 py-0.5">Score: {r.score}</span>
                        )}
                      </div>
                      {r.explanation && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-gray-800">AI Answer Reasoning</p>
                          <p className="text-xs text-gray-700 mt-1">{r.explanation}</p>
                        </div>
                      )}
                      {Array.isArray(r.answers) && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-gray-800">Answers</p>
                          <ol className="mt-1 list-decimal list-inside space-y-1">
                          {r.answers.map((a, idx) => (
                            <li key={idx} className="text-xs text-gray-800">{a}</li>
                          ))}
                          </ol>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded shadow text-sm">{toast}</div>
        )}
      </Container>
    </div>
  );
}
