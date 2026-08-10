import {
  getBuilderActivities,
  getActivitySummary,
} from "../services/builderEngine";

function BuilderActivityFeed() {

    const activities = getBuilderActivities();
    const activitySummary = getActivitySummary();

  return (
    <div className="builder-activity-feed">
      <h2>📜 Builder Activity</h2>

      <p>
        Your recent milestones and builder journey.
      </p>

      <div className="builder-activity-summary">
  <div>
    <strong>
      {activitySummary.totalActivities}
    </strong>

    <span>
      Activities
    </span>
  </div>

  <div>
    <strong>
      +{activitySummary.totalXP}
    </strong>

    <span>
      Total XP
    </span>
  </div>
</div>

      <div className="builder-activity-list">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="builder-activity-item"
          >
            <div className="builder-activity-icon">
              {activity.icon}
            </div>

            <div className="builder-activity-content">
              <h3>{activity.title}</h3>

              <p>{activity.description}</p>

              <small>{activity.date}</small>
            </div>

            <strong>
              +{activity.xp} XP
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BuilderActivityFeed;