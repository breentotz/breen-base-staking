const LEGACY_BUILDER_WALLET =
  "0x06d71eed44d152d88e6769afbb7cb3bbba2471d0";

function getActivityKey(wallet) {
  if (!wallet) {
    return null;
  }

  return `breenActivities_${wallet.toLowerCase()}`;
}

function migrateLegacyActivities(wallet) {
  if (!wallet) {
    return;
  }

  const normalizedWallet = wallet.toLowerCase();

  // Only Wallet A should inherit the old shared activity history.
  if (normalizedWallet !== LEGACY_BUILDER_WALLET) {
    return;
  }

  const activityKey = getActivityKey(wallet);
  const migrationKey =
    "breen_activities_migrated";

  const oldActivities =
    localStorage.getItem("breenActivities");

  if (
    localStorage.getItem(activityKey) === null &&
    oldActivities !== null &&
    localStorage.getItem(migrationKey) !== "true"
  ) {
    localStorage.setItem(
      activityKey,
      oldActivities
    );

    localStorage.setItem(
      migrationKey,
      "true"
    );
  }
}

export function addActivity(
  type,
  title,
  description,
  xp = 0,
  txHash = null,
  wallet = null,
  metadata = null
) {
  const activityKey = getActivityKey(wallet);

  if (!activityKey) {
    console.warn(
      "Activity not saved: wallet is required."
    );
    return;
  }

  const activities =
    JSON.parse(
      localStorage.getItem(activityKey)
    ) || [];

  activities.unshift({
  id: `${Date.now()}-${Math.random()}`,
  type,

  icon:
    type === "staking"
      ? "🔒"
      : "📜",

  title,
  message: description,
  description,
  xp,
  txHash,

  metadata:
    metadata &&
    typeof metadata === "object"
      ? metadata
      : null,

  date: new Date().toLocaleString(),
  time: new Date().toLocaleString(),
});

  localStorage.setItem(
    activityKey,
    JSON.stringify(activities)
  );
}

export function getActivities(wallet = null) {
  if (!wallet) {
    return [];
  }

  migrateLegacyActivities(wallet);

  const activityKey = getActivityKey(wallet);

  return (
    JSON.parse(
      localStorage.getItem(activityKey)
    ) || []
  );
}