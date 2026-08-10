import { useEffect, useState } from "react";
import { getActivities } from "../utils/activity";

function ActivityPage({ activities }) {

  return (

    <div className="activity-page">

      <div className="page-title">
        <h2>📜 Recent Activity</h2>

        <p>
          Your latest Breen Web3 actions.
        </p>
      </div>

      <div className="activity-list">

        {activities.length === 0 ? (

          <div className="activity-card">

            <h3>No activity yet</h3>

            <p>
              Connect your wallet and start exploring
              Breen Web3.
            </p>

          </div>

        ) : (

          activities.map((activity, index) => (

            <div
              className="activity-card"
              key={`${activity.title}-${activity.time}-${index}`}
            >

              <div className="activity-icon">

                {activity.icon}

              </div>

              <div>

                <h3>

                  {activity.title}

                </h3>

                <p>

                  {activity.message}

                </p>

                <div className="activity-footer">

  <small>
    {activity.time}
  </small>

  {activity.txHash && (
    <a
      href={`https://sepolia.basescan.org/tx/${activity.txHash}`}
      target="_blank"
      rel="noreferrer"
      className="tx-hash"
    >
      🔗 View Transaction
    </a>
  )}

</div>

              </div>

            </div>

          ))

        )}

      </div>

    </div>

  );

}

export default ActivityPage;