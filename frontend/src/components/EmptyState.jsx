// frontend/src/components/EmptyState.jsx

function EmptyState({ message, icon = '📭' }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">{icon}</span>
      <p className="empty-state__text">{message}</p>
    </div>
  );
}

export default EmptyState;
