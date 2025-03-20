import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { RRule } from "rrule";
import { scheduleReminder, requestNotificationPermission } from "../utils/notification";

const CalendarApp = () => {
  // Default events
  const defaultEvents = [
    { title: "Meeting with Team", start: new Date(), recurring: false },
    { title: "Doctor Appointment", start: new Date("2025-03-22T10:00:00"), recurring: false },
    { title: "Gym Session", start: new Date("2025-03-23T07:00:00"), recurring: true },
    { title: "Project Deadline", start: new Date("2025-03-25T23:59:00"), recurring: false },
    { title: "Yoga Class", start: new Date("2025-03-20T06:00:00"), recurring: true },
  ];

  // Default reminders
  const defaultReminders = [
    { title: "Pay Electricity Bill", start: new Date("2025-03-21T18:00:00"), recurring: false },
    { title: "Buy Groceries", start: new Date("2025-03-22T15:00:00"), recurring: false },
  ];

  // Function to parse stored data & convert to Date objects
  const parseStoredData = (key, defaultValue) => {
    const storedData = JSON.parse(localStorage.getItem(key));
    return storedData
      ? storedData.map(item => ({
          ...item,
          start: new Date(item.start), // Convert stored string to Date object
        }))
      : defaultValue;
  };

  // State management
  const [events, setEvents] = useState(() => parseStoredData("events", defaultEvents));
  const [reminders, setReminders] = useState(() => parseStoredData("reminders", defaultReminders));
  const [showForm, setShowForm] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFreq, setRecurringFreq] = useState("daily");

  // Save data to localStorage on change
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }, [events, reminders]);

  // Request notification permission & schedule reminders
  useEffect(() => {
    requestNotificationPermission();
    [...events, ...reminders].forEach(scheduleReminder);
  }, [events, reminders]);

  // Function to handle adding an event
  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!eventTitle || !eventDate) {
      alert("Please enter event details.");
      return;
    }

    const newEvent = { title: eventTitle, start: new Date(eventDate), recurring: isRecurring };

    if (isRecurring) {
      const rule = new RRule({
        freq:
          recurringFreq === "daily"
            ? RRule.DAILY
            : recurringFreq === "weekly"
            ? RRule.WEEKLY
            : RRule.MONTHLY,
        dtstart: new Date(eventDate),
        count: 5, // Generate 5 occurrences
      });

      const recurringEvents = rule.all().map(date => ({
        title: eventTitle,
        start: date,
        recurring: true,
      }));

      setEvents([...events, ...recurringEvents]);
    } else {
      setEvents([...events, newEvent]);
    }

    // Reset form fields
    setShowForm(false);
    setEventTitle("");
    setEventDate("");
    setIsRecurring(false);
  };

  return (
    <div className="app-container">
      {/* Left Side - Upcoming Events */}
      <div className="events-list">
        <h2>Upcoming Events</h2>
        <ul>
          {events.map((event, index) => (
            <li key={index} className={event.recurring ? "recurring-event" : "normal-event"}>
              {event.title} - {event.start.toDateString()} {event.recurring && "(Recurring)"}
            </li>
          ))}
        </ul>
      </div>

      {/* Center - Calendar */}
      <div className="calendar-container">
        <button onClick={() => setShowForm(!showForm)} className="add-event-btn">
          {showForm ? "Close" : "Add Event"}
        </button>

        {/* Event Form */}
        {showForm && (
          <form className="event-form" onSubmit={handleAddEvent}>
            <input
              type="text"
              placeholder="Event Title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              required
            />
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
            <label>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
              />
              Recurring Event
            </label>
            {isRecurring && (
              <select value={recurringFreq} onChange={(e) => setRecurringFreq(e.target.value)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            )}
            <button type="submit">Add Event</button>
          </form>
        )}

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={[
            ...events.map(event => ({
              title: event.title,
              start: event.start,
              color: event.recurring ? "#FF5F6D" : "#00B894", // Recurring (Red), Normal (Green)
            })),
            ...reminders.map(reminder => ({
              title: `Reminder: ${reminder.title}`,
              start: reminder.start,
              color: "#FF9800", // Orange for reminders
            })),
          ]}
          height="600px"
        />
      </div>

      {/* Right Side - Reminders */}
      <div className="reminders-list">
        <h2>Reminders</h2>
        <ul>
          {reminders.map((reminder, index) => (
            <li key={index} className="reminder-item">
              {reminder.title} - {reminder.start.toTimeString().split(" ")[0]}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CalendarApp;
