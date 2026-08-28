function AnalyticsCard({
  title,
  value,
  icon,
  color = "#4F7CFF",
  progress = null,
  subtitle = "",
  details = null,
}) {
  return (
    <div className="analytics-card">
      <div
        className="analytics-icon"
        style={{ color }}
      >
        {icon}
      </div>

      <div className="analytics-content">
        <small>{title}</small>

        <h2>{value}</h2>

        {subtitle && (
          <p className="analytics-subtitle">
            {subtitle}
          </p>
        )}

        {progress !== null && (
          <div className="analytics-progress">
            <div
              className="analytics-progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        )}

        {details && (
          <div className="analytics-details visible">
            {details}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsCard;