// frontend/src/components/ExportButton.jsx
// Triggers a CSV download of the current expense list.

import { useState } from 'react';
import { downloadExpensesCsv } from '../api/exportApi';
import { getErrorMessage } from '../utils/getErrorMessage';

function ExportButton({ filters = {} }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleExport() {
    setLoading(true);
    setError('');
    try {
      await downloadExpensesCsv(filters);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="export-btn-wrapper">
      <button
        id="export-csv-btn"
        type="button"
        onClick={handleExport}
        disabled={loading}
        className="btn btn--outline btn--sm"
        title="Download filtered expenses as CSV"
      >
        {loading ? (
          <>
            <span className="export-btn__spinner" aria-hidden="true" />
            Exporting…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </>
        )}
      </button>
      {error && <p className="export-btn__error">{error}</p>}
    </div>
  );
}

export default ExportButton;
