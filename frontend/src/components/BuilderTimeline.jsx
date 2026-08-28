import { getBuilderActivities } from "../services/builderEngine";

function BuilderTimeline({ wallet }) {
    const timelineEvents =
    wallet
      ? getBuilderActivities(wallet)
      : [];
  return (
    <div className="builder-timeline-page">

      <div className="timeline-header">

        <h2>📜 Builder Timeline</h2>

        <p>
          Every milestone, deployment, and achievement
          becomes part of your builder story.
        </p>

      </div>

      <div className="timeline-card">

        <h3>Your Builder Journey</h3>

<p>
  Every milestone becomes part of your
  permanent builder history.
</p>

<div className="timeline-list">

  {timelineEvents.length > 0 ? (
    timelineEvents.map((event) => (
      <div key={event.id} className="timeline-item">

        <div className="timeline-icon">
          {event.icon || "📜"}
        </div>

        <div className="timeline-content">

          <small>
            {event.date || ""}
          </small>

          <h4>
            {event.title}
          </h4>

          <p>
            {event.description ||
              event.message ||
              "Breen Web3 activity completed."}
          </p>

        </div>

      </div>
    ))
  ) : (

    <div className="timeline-empty-state">
      <div className="timeline-empty-icon">
        📜
      </div>

      <h4>
        {wallet
          ? "No Builder history yet"
          : "Connect Wallet to View Timeline"}
      </h4>

      <p>
        {wallet
          ? "Your Builder milestones and onchain activity will appear here."
          : "Your Builder history will appear here after connecting your wallet."}
      </p>
    </div>

  )}

</div>

        {wallet && (
          <small>
            Builder: {wallet.slice(0, 6)}
            ...
            {wallet.slice(-4)}
          </small>
        )}

      </div>

    </div>
  );
}

export default BuilderTimeline;