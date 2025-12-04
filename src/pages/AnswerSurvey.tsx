import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useActiveAccount } from 'thirdweb/react';
import Container from '@/components/Container';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface VerdictResponse {
  verdict?: string;
  reason?: string;
  txHash?: string;
  rewardTxHash?: string;
  score?: number;
  explanation?: string;
}

export default function AnswerSurveyPage() {
  const { id } = useParams<{ id: string }>();
  const account = useActiveAccount();
  const [title, setTitle] = useState<string>('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<VerdictResponse | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('https://surveysensei-agent.rahmandana08.workers.dev/agent/survey-detail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'detail', surveyId: id })
        });
        if (!res.ok) throw new Error('Failed to load survey');
        const data = await res.json();
        const qs = extractQuestions(data);
        setQuestions(qs);
        setAnswers(qs.map(() => ''));
        setTitle(data?.detail?.title || data?.survey?.title || data?.title || '');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const onSubmit = async () => {
    if (!id || !account) return;
    setSubmitting(true);
    setError(null);
    setVerdict(null);
    try {
      const body = {
        surveyId: id,
        wallet: account.address,
        questions,
        answers,
      };
      const res = await fetch('https://surveysensei-agent.rahmandana08.workers.dev/agent/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to submit answers');
      const data: VerdictResponse = await res.json();
      const next: VerdictResponse = {
        verdict: (data as any).verdict ?? data.verdict,
        reason: (data as any).reason ?? data.reason,
        explanation: (data as any).explanation ?? data.explanation,
        score: (data as any).score ?? data.score,
        rewardTxHash: (data as any).rewardTxHash ?? (data as any).reward_tx_hash,
        txHash: (data as any).txHash || (data as any).transactionHash || (data as any).hash,
      };
      setVerdict(next);
      setSubmitted(String(next.verdict || '').toLowerCase() === 'valid');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = account && questions.length > 0 && answers.every((a) => a.trim().length > 0) && !submitting && !submitted;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Answer Survey</h1>
            {(loading || submitting) && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
          </div>
          <Link to={`/survey/${id}`} className="text-blue-600">Back to Survey</Link>
        </div>

        {loading ? (
          <div className="bg-white p-6 rounded shadow">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="mt-4 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                  <div className="mt-2 h-20 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded shadow">
            {title && <h2 className="text-lg font-semibold mb-2">{title}</h2>}
            {error && questions.length === 0 && (
              <p className="text-red-600">{error}</p>
            )}
            <div className="space-y-5">
              {questions.map((q, idx) => (
                <div key={idx}>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-medium">{idx + 1}.</span>
                    <p className="text-sm text-gray-800">{q}</p>
                  </div>
                  <textarea
                    value={answers[idx]}
                    onChange={(e) => {
                      const next = [...answers];
                      next[idx] = e.target.value;
                      setAnswers(next);
                    }}
                    rows={4}
                    maxLength={2000}
                    placeholder="Type your answer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-y"
                  />
                  <div className="mt-1 text-xs text-gray-500 text-right">
                    {answers[idx]?.length || 0}/2000 characters
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={onSubmit}
                disabled={!canSubmit}
                className="w-full sm:w-auto bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</span>
                ) : (
                  submitted ? 'Submitted' : 'Submit Answers'
                )}
              </button>
              {!account && (
                <p className="mt-2 text-sm text-gray-600">Please connect your wallet to submit answers and receive rewards.</p>
              )}
            </div>

            {verdict && (
              <div className="mt-6 rounded border p-4">
                <div className="flex items-center gap-2 mb-2">
                  {verdict.verdict?.toLowerCase() === 'valid' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-semibold">Verdict: {verdict.verdict ?? '-'}</span>
                </div>
                {verdict.reason && (
                  <p className="text-sm text-gray-700">{verdict.reason}</p>
                )}
                {verdict.explanation && (
                  <p className="text-sm text-gray-700 mt-2">{verdict.explanation}</p>
                )}
                {typeof verdict.score === 'number' && (
                  <p className="text-sm text-gray-700 mt-1">Score: {verdict.score}</p>
                )}
                {submitted && verdict.verdict?.toLowerCase() === 'valid' && (
                  <div className="mt-3 bg-green-50 text-green-800 text-sm rounded px-3 py-2">
                    🎉 Answer submitted! You’re eligible for the reward — check your wallet soon.
                  </div>
                )}
                {(verdict.rewardTxHash || verdict.txHash) && (
                  <p className="mt-2 text-sm">
                    Transaction: <TxLink hash={(verdict.rewardTxHash || verdict.txHash) as string} />
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}

function extractQuestions(data: any): string[] {
  const tryPaths = [
    (d: any) => d?.detail?.questions,
    (d: any) => d?.survey?.questions,
    (d: any) => d?.questions,
    (d: any) => d?.plan?.questions,
  ];
  for (const getter of tryPaths) {
    const v = getter(data);
    if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean);
  }
  return [];
}

function TxLink({ hash }: { hash: string }) {
  const chainId = Number(import.meta.env.VITE_BNB_CHAIN_ID || 97);
  const base = chainId === 56 ? 'https://bscscan.com/tx/' : 'https://testnet.bscscan.com/tx/';
  return (
    <a href={`${base}${hash}`} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">
      {hash}
    </a>
  );
}
