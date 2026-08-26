// frontend/src/components/SummaryCard.jsx
// Reusable stat card used in the dashboard summary row.

function SummaryCard({ icon, label, value, subtext, accent, danger }) {
  return (
    <div
      className="summary-card"
      style={accent ? { borderTop: `3px solid ${accent}` } : {}}
    >
      <div className="summary-card__icon" style={{ color: accent || 'var(--color-primary)' }}>
        {icon}
      </div>
      <div className="summary-card__body">
        <p className="summary-card__label">{label}</p>
        <p
          className="summary-card__value"
          style={danger ? { color: 'var(--color-danger)' } : {}}
        >
          {value}
        </p>
        {subtext && <p className="summary-card__subtext">{subtext}</p>}
      </div>
    </div>
  );
}

export default SummaryCard;
