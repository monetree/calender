export const scheduleReminder = (event) => {
    const eventTime = new Date(event.start).getTime();
    const currentTime = new Date().getTime();
    const delay = eventTime - currentTime - 60000; // 1 min before event
  
    if (delay > 0) {
      setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification(`Reminder: ${event.title}`, {
            body: `Event happening soon!`,
          });
        }
      }, delay);
    }
  };
  
  export const requestNotificationPermission = () => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  };
  