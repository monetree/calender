export const scheduleReminder = (event) => {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const eventTime = new Date(event.start).getTime();
  const reminderTime = eventTime - 30 * 60 * 1000; // 30 minutes before event

  const now = new Date().getTime();
  const delay = reminderTime - now;

  if (delay > 0) {
    setTimeout(() => {
      new Notification("Upcoming Event Reminder", {
        body: `Reminder: ${event.title} starts at ${new Date(event.start).toLocaleTimeString()}`,
      });
    }, delay);
  }
};

  
  export const requestNotificationPermission = () => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  };
  