import { Link } from 'react-router-dom';
import { useActiveAccount } from 'thirdweb/react';
import { Loader2, CopyCheck } from 'lucide-react';
import Container from '@/components/Container';

export default function Home() {
  const account = useActiveAccount();
  const [recent, setRecent] = React.useState<{ id: string; title?: string; createdAt?: number | string; totalReward?: string; targetResponses?: number; totalResponses?: number; totalValidWallets?: number; avgScore?: number | null }[]>([]);
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Create and manage your blockchain surveys</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Create a new survey</h2>
            <p className="text-sm text-gray-600 mb-4">Describe your survey and lock rewards on-chain.</p>
            <Link to="/create" className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Create Survey</Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">My Surveys</h2>
            <p className="text-sm text-gray-600 mb-4">View and share your existing surveys.</p>
            <Link to="/surveys" className="inline-block bg-gray-900 text-white py-2 px-4 rounded hover:bg-black">Open My Surveys</Link>
          </div>
        </div>

        

        <ToastProvider>
          <RecentSurveys accountAddress={account?.address} onLoad={(list) => setRecent(list)} />
        </ToastProvider>
      </Container>
    </div>
  );
}

import React from 'react';

function RecentSurveys({ accountAddress, onLoad }: { accountAddress?: string; onLoad?: (list: { id: string; title?: string; createdAt?: number | string; totalReward?: string; targetResponses?: number; totalResponses?: number; totalValidWallets?: number; avgScore?: number | null }[]) => void }) {
  const [items, setItems] = React.useState<{ id: string; title?: string; createdAt?: number | string; totalReward?: string; targetResponses?: number; totalResponses?: number; totalValidWallets?: number; avgScore?: number | null }[]>([]);
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    const run = async () => {
      if (!accountAddress) return;
      setLoading(true);
      try {
        const res = await fetch('https://surveysensei-agent.rahmandana08.workers.dev/agent/surveys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'list', creatorWallet: accountAddress })
        });
        const data = await res.json();
        const raw = data.surveys || data.list || [];
        const list = raw.map((s: any) => ({
          id: s.surveyId || s.id,
          title: s.title || s.description || undefined,
          createdAt: s.createdAt ?? s.created_at ?? s.created ?? undefined,
          totalReward: s.totalReward,
          targetResponses: s.targetResponses,
          totalResponses: s.stats?.totalResponses,
          totalValidWallets: s.stats?.totalValidWallets,
          avgScore: s.stats?.avgScore ?? null,
        }))
        .sort((a: any, b: any) => Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0))
        .slice(0, 10);
        setItems(list);
        onLoad?.(list);
      } catch {
        // preserve existing items on transient errors
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [accountAddress]);

  if (!accountAddress) {
    return (
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-semibold">Recent Surveys</h3>
          <Link to="/surveys" className="text-blue-600">View all</Link>
        </div>
        <p className="text-sm text-gray-600">Connect your wallet to view recent surveys from your account.</p>
      </div>
    );
  }
  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-md font-semibold">Recent Surveys</h3>
          {loading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
        </div>
        <Link to="/surveys" className="text-blue-600">View all</Link>
      </div>
      {loading ? (
        <ul className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="py-3 flex items-center justify-between">
              <div className="w-full">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                <div className="mt-2 h-3 w-64 bg-gray-200 rounded animate-pulse"></div>
                <div className="mt-2 h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex-shrink-0 flex gap-2">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="divide-y space-y-2">
          {items.length === 0 && <li className="py-2 text-gray-500">No surveys yet</li>}
          {items.map((s) => (
            <li key={s.id} className="py-4 flex items-center justify-between">
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
                {s.createdAt && (
                  <p className="text-xs text-gray-400">Created: {formatDate(s.createdAt)}</p>
                )}
              </div>
              <div className="flex-shrink-0 flex gap-2">
                <Link to={`/survey/${s.id}`} className="bg-blue-600 text-white py-1 px-3 rounded">Details</Link>
                <CopyLinkButton surveyId={s.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
      <Toast />
    </div>
  );
}

function formatDate(input: string | number) {
  const d = new Date(typeof input === 'number' ? input : input);
  if (isNaN(d.getTime())) return input;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatId(id: string) {
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}…${id.slice(-6)}`;
}

const ToastCtx = React.createContext<{ show: (msg: string) => void } | null>(null);

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = React.useState<string | null>(null);
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

function Toast() { return null; }

function CopyLinkButton({ surveyId }: { surveyId: string }) {
  const ctx = React.useContext(ToastCtx);
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
