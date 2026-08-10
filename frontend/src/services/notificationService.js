let listeners = [];

export function subscribe(listener) {
  listeners.push(listener);

  return () => {
    listeners = listeners.filter((item) => item !== listener);
  };
}

export function showNotification(message, type = "info") {
  listeners.forEach((listener) => {
    listener({
      id: Date.now(),
      message,
      type,
    });
  });
}