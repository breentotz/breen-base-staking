import { timelineData } from "../data/timelineData";

function BuilderTimeline({ wallet }) {
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
  {timelineData.map((event) => (
    <div key={event.id} className="timeline-item">

      <div className="timeline-icon">
        {event.icon}
      </div>

      <div className="timeline-content">

        <small>{event.date}</small>

        <h4>{event.title}</h4>

        <p>{event.description}</p>

      </div>

    </div>
  ))}
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