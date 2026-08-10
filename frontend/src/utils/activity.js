export function addActivity(type, title, description) {
  const activities =
    JSON.parse(localStorage.getItem("breenActivities")) || [];

  activities.unshift({
  id: Date.now(),
  type,
  icon: type === "staking" ? "🏦" : "📜",
  title,
  message: description,
  description,
  time: new Date().toLocaleString(),
});

  localStorage.setItem(
    "breenActivities",
    JSON.stringify(activities)
  );
}

export function getActivities() {
  return (
    JSON.parse(localStorage.getItem("breenActivities")) || []
  );
}