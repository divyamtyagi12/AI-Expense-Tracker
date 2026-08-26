// frontend/src/pages/AiInsights.jsx
// AI-powered spending analysis page.
// — "Analyze My Spending" generates a Gemini summary
// — Chat input lets users ask custom questions
// — History panel shows past interactions

import { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { analyzeSpending, askQuestion, getAiHistory, clearAiHistory } from '../api/aiApi';
import { getErrorMessage } from '../utils/getErrorMessage';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// Renders Markdown-ish text: bold **text**, bullet - text
function MarkdownText({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="ai-markdown">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <br key={i} />;

        // Heading: **Title** or ### Title
        if (/^\*\*(.+)\*\*$/.test(trimmed)) {
          const heading = trimmed.replace(/^\*\*(.+)\*\*$/, '$1');
          return <p key={i} className="ai-markdown__heading">{heading}</p>;
        }
        if (/^#{1,3}\s+(.+)/.test(trimmed)) {
          const heading = trimmed.replace(/^#{1,3}\s+/, '');
          return <p key={i} className="ai-markdown__heading">{heading}</p>;
        }
        // Bullet
        if (/^[-*]\s+/.test(trimmed)) {
          const content = trimmed.replace(/^[-*]\s+/, '');
          return (
            <div key={i} className="ai-markdown__bullet">
              <span className="ai-markdown__dot" aria-hidden="true">•</span>
              <span dangerouslySetInnerHTML={{ __html: renderInline(content) }} />
            </div>
          );
        }
        // Numbered
        if (/^\d+\.\s+/.test(trimmed)) {
          const content = trimmed.replace(/^\d+\.\s+/, '');
          return (
            <div key={i} className="ai-markdown__bullet">
              <span className="ai-markdown__dot" aria-hidden="true">→</span>
              <span dangerouslySetInnerHTML={{ __html: renderInline(content) }} />
            </div>
          );
        }
        return (
          <p key={i} className="ai-markdown__para"
             dangerouslySetInnerHTML={{ __html: renderInline(trimmed) }} />
        );
      })}
    </div>
  );
}

function renderInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

// A single history card
function HistoryCard({ item, onDelete }) {
  const date = new Date(item.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
  return (
    <div className={`ai-history-card ai-history-card--${item.type}`}>
      <div className="ai-history-card__header">
        <span className={`ai-history-card__badge ai-history-card__badge--${item.type}`}>
          {item.type === 'summary' ? '📊 Summary' : '💬 Q&A'}
        </span>
        <span className="ai-history-card__date">{date}</span>
      </div>
      {item.type === 'question' && item.request_text && (
        <p className="ai-history-card__question">"{item.request_text}"</p>
      )}
      <div className="ai-history-card__body">
        <MarkdownText text={item.response_text} />
      </div>
    </div>
  );
}

// Month/year picker (reused from Dashboard-style)
function PeriodPicker({ month, year, onChange }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentYear - i);
  return (
    <div className="month-picker">
      <select
        value={month}
        onChange={(e) => onChange(Number(e.target.value), year)}
        className="input month-picker__select"
        aria-label="Select month"
      >
        {MONTH_NAMES.map((name, i) => (
          <option key={name} value={i + 1}>{name}</option>
        ))}
      </select>
      <select
        value={year}
        onChange={(e) => onChange(month, Number(e.target.value))}
        className="input month-picker__select"
        aria-label="Select year"
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}

function AiInsights() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');
  const [latestSummary, setLatestSummary] = useState('');

  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState('');
  const [latestAnswer, setLatestAnswer] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const answerRef = useRef(null);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await getAiHistory(15);
      setHistory(res.data.data.history);
    } catch {
      // history is optional — don't block the page on failure
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  function handlePeriodChange(m, y) {
    setMonth(m);
    setYear(y);
    setLatestSummary('');
    setLatestAnswer(null);
    setAnalyzeError('');
    setAskError('');
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    setAnalyzeError('');
    setLatestSummary('');
    try {
      const res = await analyzeSpending(month, year);
      setLatestSummary(res.data.data.responseText);
      loadHistory();
    } catch (err) {
      setAnalyzeError(getErrorMessage(err));
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleAsk(e) {
    e.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    setAskError('');
    setLatestAnswer(null);
    try {
      const res = await askQuestion(question.trim(), month, year);
      setLatestAnswer({ question: question.trim(), answer: res.data.data.responseText });
      setQuestion('');
      loadHistory();
      setTimeout(() => answerRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setAskError(getErrorMessage(err));
    } finally {
      setAsking(false);
    }
  }

  async function handleClearHistory() {
    if (!window.confirm('Clear all AI insight history? This cannot be undone.')) return;
    setClearing(true);
    try {
      await clearAiHistory();
      setHistory([]);
    } catch {
      // silent
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="ai-page">
      <Navbar />
      <div className="ai-container">

        {/* Header */}
        <div className="ai-header">
          <div>
            <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>AI Insights ✨</h1>
            <p className="dashboard-subtitle">
              Gemini-powered analysis of your spending habits
            </p>
          </div>
          <PeriodPicker month={month} year={year} onChange={handlePeriodChange} />
        </div>

        {/* Analyze panel */}
        <div className="ai-panel">
          <div className="ai-panel__header">
            <h2 className="ai-panel__title">📊 Spending Analysis</h2>
            <p className="ai-panel__desc">
              Get a personalised AI summary for {MONTH_NAMES[month - 1]} {year}.
            </p>
          </div>
          <button
            id="ai-analyze-btn"
            className="btn btn--primary"
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing ? (
              <><span className="export-btn__spinner" aria-hidden="true" /> Analysing…</>
            ) : (
              '✨ Analyse My Spending'
            )}
          </button>

          {analyzeError && (
            <div className="ai-panel__error">{analyzeError}</div>
          )}

          {latestSummary && (
            <div className="ai-result">
              <div className="ai-result__label">AI Response</div>
              <MarkdownText text={latestSummary} />
            </div>
          )}
        </div>

        {/* Q&A panel */}
        <div className="ai-panel">
          <div className="ai-panel__header">
            <h2 className="ai-panel__title">💬 Ask About Your Expenses</h2>
            <p className="ai-panel__desc">
              Ask anything about your {MONTH_NAMES[month - 1]} {year} spending.
            </p>
          </div>

          <div className="ai-suggestions">
            {[
              'Which category did I overspend on?',
              'How can I save ₹2000 this month?',
              'What were my top 3 expenses?',
              'Am I on track with my budget?',
            ].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="ai-suggestion-chip"
                onClick={() => setQuestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form className="ai-ask-form" onSubmit={handleAsk}>
            <input
              id="ai-question-input"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How much did I spend on food this month?"
              className="input ai-ask-form__input"
              aria-label="Ask AI a question"
            />
            <button
              type="submit"
              className="btn btn--primary"
              disabled={asking || !question.trim()}
            >
              {asking ? <span className="export-btn__spinner" aria-hidden="true" /> : 'Ask →'}
            </button>
          </form>

          {askError && <div className="ai-panel__error">{askError}</div>}

          {latestAnswer && (
            <div className="ai-result" ref={answerRef}>
              <div className="ai-result__label">Your question</div>
              <p className="ai-result__question">"{latestAnswer.question}"</p>
              <div className="ai-result__label" style={{ marginTop: '0.75rem' }}>AI Answer</div>
              <MarkdownText text={latestAnswer.answer} />
            </div>
          )}
        </div>

        {/* History panel */}
        <div className="ai-history-section">
          <div className="ai-history-header">
            <h2 className="chart-card__title">History</h2>
            {history.length > 0 && (
              <button
                className="btn btn--xs btn--ghost btn--danger-text"
                onClick={handleClearHistory}
                disabled={clearing}
              >
                {clearing ? 'Clearing…' : 'Clear all'}
              </button>
            )}
          </div>

          {historyLoading ? (
            <Loader label="Loading history…" />
          ) : history.length === 0 ? (
            <div className="ai-history-empty">
              No AI interactions yet. Run an analysis or ask a question above!
            </div>
          ) : (
            <div className="ai-history-list">
              {history.map((item) => (
                <HistoryCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default AiInsights;
