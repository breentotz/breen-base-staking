import { useEffect, useState } from "react";
import { subscribe } from "../services/notificationService";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribe((notification) => {
      setNotifications((current) => [...current, notification]);

      setTimeout(() => {
        setNotifications((current) =>
          current.filter((item) => item.id !== notification.id)
        );
      }, 4000);
    });

    return unsubscribe;
  }, []);

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
}

export default Notifications;