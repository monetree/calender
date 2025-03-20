import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { RRule } from "rrule";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { scheduleReminder, requestNotificationPermission } from "../utils/notification";

const CalendarApp = () => {
  const defaultEvents = [
    { 
      id: 1, 
      title: "Meeting with Team",
      description: "Weekly sync meeting with development team to discuss project progress",
      agenda: ["Sprint review", "Blockers discussion", "Next sprint planning"],
      location: "Conference Room A",
      start: new Date(), 
      recurring: false, 
      freq: null 
    },
    { 
      id: 2, 
      title: "Doctor Appointment",
      description: "Annual health checkup with Dr. Smith",
      location: "City Medical Center",
      notes: "Bring previous medical reports and insurance card",
      start: new Date("2025-03-22T10:00:00"), 
      recurring: false, 
      freq: null 
    },
    { 
      id: 3, 
      title: "Gym Session",
      description: "Personal training session with Coach Mike",
      routine: ["Cardio", "Weight training", "Core exercises"],
      location: "FitLife Gym",
      start: new Date("2025-03-23T07:00:00"), 
      recurring: true, 
      freq: "daily" 
    },
    { 
      id: 4, 
      title: "Yoga Class",
      description: "Beginner's yoga class with instructor Sarah",
      type: "Hatha Yoga",
      location: "Peaceful Mind Studio",
      equipment: ["Yoga mat", "Water bottle", "Towel"],
      start: new Date("2025-03-20T06:00:00"), 
      recurring: true, 
      freq: "weekly" 
    },
  ];

  const defaultReminders = [
    { 
      id: 5, 
      title: "Pay Electricity Bill",
      description: "Monthly electricity bill payment",
      amount: "$120",
      provider: "City Power Corp",
      paymentMethod: "Online banking",
      start: new Date("2025-03-21T18:00:00"), 
      recurring: false 
    },
    { 
      id: 6, 
      title: "Buy Groceries",
      description: "Weekly grocery shopping",
      list: ["Fruits", "Vegetables", "Milk", "Bread", "Eggs"],
      store: "Walmart Supermarket",
      budget: "$200",
      start: new Date("2025-03-22T15:00:00"), 
      recurring: false 
    },
  ];

  // Function to parse local storage data
  const parseStoredData = (key, defaultValue) => {
    const storedData = JSON.parse(localStorage.getItem(key));
    return storedData
      ? storedData.map(item => ({ ...item, start: new Date(item.start) }))
      : defaultValue;
  };

  // States
  const [events, setEvents] = useState(() => parseStoredData("events", defaultEvents));
  const [reminders, setReminders] = useState(() => parseStoredData("reminders", defaultReminders));
  const [showForm, setShowForm] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFreq, setRecurringFreq] = useState("daily");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);


  // Save to local storage when state updates
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }, [events, reminders]);

  // Request notification permission and schedule reminders
  useEffect(() => {
    requestNotificationPermission();
    [...events, ...reminders].forEach(scheduleReminder);
  }, [events, reminders]);

  // Generate recurring events
  const generateRecurringEvents = (event) => {
    if (!event.recurring || !event.freq) return [event];

    const rule = new RRule({
      freq: event.freq === "daily" ? RRule.DAILY : event.freq === "weekly" ? RRule.WEEKLY : RRule.MONTHLY,
      dtstart: event.start,
      count: 1, // Generate next 5 occurrences
    });

    return rule.all().map((date, index) => ({
      id: `${event.id}-${index}`, // Unique ID for each occurrence
      title: event.title,
      start: date,
      recurring: true,
      freq: event.freq,
    }));
  };

  // Flatten all events, including recurring ones
  const allEvents = events.flatMap(event => generateRecurringEvents(event));

  // Add new event
  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!eventTitle || !eventDate) {
      toast.error("Please enter event details!");
      return;
    }

    const newEvent = {
      id: Date.now(),
      title: eventTitle,
      start: new Date(eventDate),
      recurring: isRecurring,
      freq: isRecurring ? recurringFreq : null,
    };

    setEvents([...events, newEvent]);
    toast.success("Event Created! 🎉");

    setShowForm(false);
    setEventTitle("");
    setEventDate("");
    setIsRecurring(false);
  };

  // Delete event (removes all occurrences)
  const handleDeleteEvent = (id) => {
    const updatedEvents = events.filter(event => event.id !== id);
    setEvents(updatedEvents);
    toast.error("Event Deleted! ❌");
  };

  // Delete reminder
  const handleDeleteReminder = (id) => {
    const updatedReminders = reminders.filter(reminder => reminder.id !== id);
    setReminders(updatedReminders);
    toast.error("Reminder Deleted! ❌");
  };


  const handleEventClick = (clickInfo) => {
    const event = events.find(e => e.title === clickInfo.event.title);
    if (event) {
      setSelectedEvent(event);
      setShowEventDetails(true);
    }
  };

  // Close event details modal
  const closeEventDetails = () => {
    setShowEventDetails(false);
    setSelectedEvent(null);
  };


  return (
    <div className="app-container">
      {/* Events List */}
      <div className="events-list">
        <h2>Upcoming Events</h2>
        <ul>
          {allEvents.map((event, index) => (
            <li key={index} className={event.recurring ? "recurring-event" : "normal-event"}>
              {event.title} - {event.recurring && event.freq === "daily" ? 
                <><strong>Daily at:</strong> {event.start.toLocaleTimeString()}</> :
               event.recurring && event.freq === "weekly" ? 
                <><strong>Weekly on {event.start.toLocaleDateString('en-US', {weekday: 'long'})} at:</strong> {event.start.toLocaleTimeString()}</> : 
               event.recurring && event.freq === "monthly" ? 
                <><strong>Monthly at:</strong> {event.start.toLocaleString()}</> : 
                event.start.toLocaleString()
              } {event.recurring && "(Recurring)"}
              <button className="delete-btn" onClick={() => handleDeleteEvent(event.id)}>❌</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Calendar Section */}
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
              min={new Date().toISOString().slice(0, 16)} 
              required 
            />
            <label>
              <div className="checkbox-container">
                <input type="checkbox" id="recurringEvent" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
                <label htmlFor="recurringEvent">Recurring Event</label>
              </div>
              
              Recurring Event
            </label>
            {isRecurring && (
              <select value={recurringFreq} onChange={(e) => setRecurringFreq(e.target.value)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                {/* <option value="monthly">Monthly</option> */}
              </select>
            )}
            <button type="submit">Add Event</button>
          </form>
        )}

        {/* FullCalendar Display */}
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={[
            ...allEvents.map(event => ({ title: event.title, start: event.start, color: event.recurring ? "#FF5F6D" : "#00B894" })),
            ...reminders.map(reminder => ({ title: `Reminder: ${reminder.title}`, start: reminder.start, color: "#FF9800" })),
          ]}
          height="600px"
          eventClick={handleEventClick} 
        />
      </div>

      {/* Reminders List */}
  
        <div className="reminders-list" style={{ width: "200px" }}>
          <h2>Event Details</h2>
          {selectedEvent && (
            <div className="event-details">
              <p><strong>Title:</strong> {selectedEvent.title}</p>
              <p><strong>Date:</strong> {new Date(selectedEvent.start).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {new Date(selectedEvent.start).toLocaleTimeString()}</p>
              <p><strong>Type:</strong> {selectedEvent.recurring ? 'Recurring' : 'One-time'}</p>
            </div>
          )}
          {!selectedEvent && (
            <p>Select an event to view details</p>
          )}
        </div>
        
        <div className="reminders-list">
          <h2>Reminders</h2>
          <ul>
            {reminders.map((reminder, index) => (
              <li key={index} className="reminder-item">
                {reminder.title} - {reminder.start.toTimeString().split(" ")[0]}
                <button className="delete-btn" onClick={() => handleDeleteReminder(reminder.id)}>❌</button>
              </li>
            ))}
          </ul>
        </div>



    </div>
  );
};

export default CalendarApp;
