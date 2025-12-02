import { useEffect, useState, useContext, createContext } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { Loader2, CopyCheck } from 'lucide-react';
import Container from '@/components/Container';

interface SurveyItem {
  id: string;
  title?: string;
  createdAt?: number | string;
  totalReward?: string;
  targetResponses?: number;
  totalResponses?: number;
  totalValidWallets?: number;
  avgScore?: number | null;
}

const ToastCtx = createContext<{ show: (msg: string) => void } | null>(null);

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const show = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 2000);
  };
  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      {msg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded shadow flex items-center gap-2">
          <CopyCheck className="w-4 h-4" />
          <span className="text-sm">{msg}</span>
        </div>
      )}
    </ToastCtx.Provider>
  );
}

function formatDate(input: string) {
  const d = new Date(input);
  if (isNaN(d.getTime())) return input;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatId(id: string) {
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}…${id.slice(-6)}`;
}

export default function Surveys() {
  const account = useActiveAccount();
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      if (!account) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('https://surveysensei-agent.rahmandana08.workers.dev/agent/surveys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'list', creatorWallet: account.address }),
        });
        if (!res.ok) throw new Error('Failed to fetch surveys');
        const data = await res.json();
        const list: SurveyItem[] = (data.surveys || data.list || []).map((s: any) => ({
          id: s.surveyId || s.id,
          title: s.title || s.description || undefined,
          createdAt: s.createdAt ?? s.created_at ?? s.created ?? undefined,
          totalReward: s.totalReward,
          targetResponses: s.targetResponses,
          totalResponses: s.stats?.totalResponses,
          totalValidWallets: s.stats?.totalValidWallets,
          avgScore: s.stats?.avgScore ?? null,
        })).sort((a, b) => Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0));
        setSurveys(list);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, [account]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">My Surveys</h1>
          {loading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
        </div>
        {error && surveys.length === 0 && <p className="text-red-600 mb-3">{error}</p>}
        <ToastProvider>
          {loading ? (
            <ul className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="bg-white p-4 rounded shadow">
                  <div className="h-4 w-56 bg-gray-200 rounded animate-pulse"></div>
                  <div className="mt-2 h-3 w-64 bg-gray-200 rounded animate-pulse"></div>
                  <div className="mt-2 h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-3">
              {surveys.map((s) => (
                <li key={s.id} className="bg-white p-4 rounded shadow flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-gray-900 truncate">{s.title ?? 'Untitled survey'}</p>
                    <p className="font-mono text-xs text-gray-600 truncate">{formatId(s.id)}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5">Reward: {s.totalReward ?? '-'}</span>
                      <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5">Target: {s.targetResponses ?? '-'}</span>
                      {typeof s.totalResponses === 'number' && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-0.5">Responses: {s.totalResponses}</span>
                      )}
                      {typeof s.totalValidWallets === 'number' && (
                        <span className="inline-flex items-center rounded-full bg-purple-50 text-purple-700 text-xs font-semibold px-2 py-0.5">Valid: {s.totalValidWallets}</span>
                      )}
                      {typeof s.avgScore === 'number' && (
                        <span className="inline-flex items-center rounded-full bg-yellow-50 text-yellow-700 text-xs font-semibold px-2 py-0.5">Avg: {s.avgScore}</span>
                      )}
                    </div>
                    {s.createdAt !== undefined && (
                      <p className="text-xs text-gray-400">Created: {formatDate(s.createdAt as any)}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex gap-2">
                    <a href={`/survey/${s.id}`} className="bg-blue-600 text-white py-1 px-3 rounded">Details</a>
                    <CopyLink surveyId={s.id} />
                  </div>
                </li>
              ))}
              {surveys.length === 0 && (
                <li className="bg-white p-4 rounded shadow text-gray-500">No surveys yet</li>
              )}
            </ul>
          )}
        </ToastProvider>
      </Container>
    </div>
  );
}

function CopyLink({ surveyId }: { surveyId: string }) {
  const ctx = useContext(ToastCtx);
  return (
    <button
      onClick={async () => {
        const share = `${window.location.origin}/survey/${surveyId}`;
        await navigator.clipboard.writeText(share);
        ctx?.show('Link copied');
      }}
      className="bg-gray-100 text-gray-800 py-1 px-3 rounded"
    >Copy Link</button>
  );
}
