import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { defaultEventImage, initialEvents, initialBookings } from "../data/events";
import {
  getApiUrl,
  loginUser,
  registerUser,
  fetchEvents,
  fetchEventById,
  createEvent,
  createBooking,
  fetchBookingsForUser,
  verifyTicket as verifyTicketRequest,
  fetchUsers,
} from "../services/api";

const ADMIN_USERNAME = "admin123";
const ADMIN_PASSWORD = "adminadmin";

const AppStoreContext = createContext(null);

export function AppStoreProvider({ children }) {
  const [events, setEvents] = useState(initialEvents);
  const [bookings, setBookings] = useState(initialBookings);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [backendStatus, setBackendStatus] = useState("connecting"); // connecting | connected | offline

  // ---------- Bootstrap from backend (fall back to local seeds) ----------
  useEffect(() => {
    let mounted = true;
    const apiUrl = getApiUrl();
    console.log("[AppStore] Bootstrap. API_URL:", apiUrl);

    (async () => {
      let connected = false;
      try {
        const { events: apiEvents } = await fetchEvents();
        if (mounted && Array.isArray(apiEvents) && apiEvents.length > 0) {
          setEvents(apiEvents);
          connected = true;
        }
      } catch (err) {
        console.warn("[AppStore] fetchEvents failed:", err.message);
      }
      try {
        const { users: apiUsers } = await fetchUsers();
        if (mounted && Array.isArray(apiUsers)) {
          setUsers(apiUsers);
          connected = true;
        }
      } catch (err) {
        console.warn("[AppStore] fetchUsers failed:", err.message);
      }
      if (mounted) {
        setBackendStatus(connected ? "connected" : "offline");
        console.log(
          "[AppStore] Backend status:",
          connected ? "CONNECTED" : "OFFLINE (using local data)"
        );
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ---------- Local fallback helpers (offline mode) ----------
  const localBookEvent = useCallback(
    (eventId, username) => {
      const existingBooking = bookings.find(
        (b) => b.eventId === eventId && b.username === username
      );
      if (existingBooking) return existingBooking;

      const event = events.find((e) => e.id === eventId);
      if (!event) return null;

      const newBooking = {
        id: `BK-${event.id.toUpperCase().slice(0, 4)}-${Date.now()
          .toString()
          .slice(-5)}`,
        eventId,
        username,
        status: "Registered",
      };
      setBookings((existing) => [...existing, newBooking]);
      setEvents((existingEvents) =>
        existingEvents.map((item) =>
          item.id === eventId
            ? { ...item, registered: Math.min(item.registered + 1, item.capacity) }
            : item
        )
      );
      return newBooking;
    },
    [bookings, events]
  );

  const localVerifyTicket = useCallback(
    (bookingId) => {
      const booking = bookings.find((item) => item.id === bookingId);
      if (!booking) {
        return {
          ok: false,
          title: "Invalid ticket",
          message: "No booking was found for this QR code.",
        };
      }
      const event = events.find((e) => e.id === booking.eventId);
      const eventTitle = event?.title || "this event";
      if (booking.status === "Attended") {
        return {
          ok: true,
          title: "Already scanned",
          message: `${booking.username} was already checked in for ${eventTitle}.`,
          already: true,
        };
      }
      setBookings((existing) =>
        existing.map((item) =>
          item.id === bookingId ? { ...item, status: "Attended" } : item
        )
      );
      setEvents((existingEvents) =>
        existingEvents.map((item) =>
          item.id === booking.eventId
            ? { ...item, checkedIn: Math.min(item.checkedIn + 1, item.registered) }
            : item
        )
      );
      return {
        ok: true,
        title: "Valid ticket",
        message: `${booking.username} checked in for ${eventTitle}.`,
      };
    },
    [bookings, events]
  );

  const localAddEvent = useCallback(
    (eventDetails, organizer) => {
      const id = `${eventDetails.title}-${Date.now()}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const newEvent = {
        id,
        title: eventDetails.title,
        category: eventDetails.category || "General",
        date: eventDetails.date,
        time: eventDetails.time,
        venue: eventDetails.venue,
        city: eventDetails.city,
        organizer: organizer || "Admin",
        capacity: Number(eventDetails.capacity) || 50,
        registered: 0,
        checkedIn: 0,
        price: eventDetails.price || "Free",
        image: defaultEventImage,
        description: eventDetails.description || "New event added by the organizer.",
        locationUrl: `https://maps.google.com/?q=${encodeURIComponent(
          `${eventDetails.venue} ${eventDetails.city}`
        )}`,
      };
      setEvents((existingEvents) => [newEvent, ...existingEvents]);
      return newEvent;
    },
    []
  );

  // ---------- Auth ----------
  const login = useCallback(
    async (username, password) => {
      const cleanUsername = (username || "").trim();

      // Backend first
      try {
        const result = await loginUser(cleanUsername, password);
        setCurrentUser({
          id: result.user?.id || cleanUsername,
          username: cleanUsername,
          role: result.role,
        });
        // refresh the users list (organizer dashboard) and this user's bookings
        try {
          const { users: apiUsers } = await fetchUsers();
          if (Array.isArray(apiUsers)) {
            setUsers(apiUsers);
          }
        } catch (err) {
          console.warn("Could not refresh users list:", err.message);
        }
        try {
          const { bookings: userBookings } = await fetchBookingsForUser(cleanUsername);
          if (Array.isArray(userBookings)) {
            setBookings(userBookings);
          }
        } catch (err) {
          console.warn("Could not load user bookings:", err.message);
        }
        return { ok: true, role: result.role };
      } catch (err) {
        // Demo organizer account works even when the backend is offline.
        if (cleanUsername === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          setCurrentUser({ id: "admin", username: ADMIN_USERNAME, role: "admin" });
          return { ok: true, role: "admin" };
        }

        if (err.status === 401) {
          return { ok: false, message: "Invalid username or password." };
        }

        // Login only — accounts are never created from this screen.
        return {
          ok: false,
          message: "Can't reach the server. Check your connection and try again.",
        };
      }
    },
    []
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    setBookings([]);
    setUsers([]);
  }, []);

  // ---------- Auth: register ----------
  const register = useCallback(
    async (username, password) => {
      const cleanUsername = (username || "").trim();
      const cleanPassword = password || "";

      try {
        await registerUser(cleanUsername, cleanPassword);
        return { ok: true };
      } catch (err) {
        if (err.status === 400 || err.status === 409) {
          return { ok: false, message: err.message || "Username already taken." };
        }
        return {
          ok: false,
          message: "Can't reach the server. Check your connection and try again.",
        };
      }
    },
    []
  );

  // ---------- Events ----------
  const fetchEventsData = useCallback(async (search) => {
    try {
      const { events: apiEvents } = await fetchEvents(search);
      if (Array.isArray(apiEvents)) {
        setEvents(apiEvents);
        return apiEvents;
      }
    } catch (err) {
      console.warn("fetchEvents failed, keeping local events:", err.message);
    }
    return events;
  }, [events]);

  const getEventById = useCallback(
    (id) => events.find((event) => event.id === id) || null,
    [events]
  );

  const fetchEventByIdAsync = useCallback(async (id) => {
    // Try backend first
    try {
      const { event } = await fetchEventById(id);
      setEvents((existing) =>
        existing.some((e) => e.id === id) ? existing : [event, ...existing]
      );
      return event;
    } catch (err) {
      return getEventById(id);
    }
  }, [getEventById]);

  const addEvent = useCallback(
    async (eventDetails) => {
      try {
        const { event } = await createEvent(eventDetails);
        setEvents((existing) => [event, ...existing]);
        return event;
      } catch (err) {
        // Local fallback
        return localAddEvent(eventDetails, currentUser?.username || "Admin");
      }
    },
    [currentUser, localAddEvent]
  );

  // ---------- Bookings ----------
  const bookEvent = useCallback(
    async (eventId) => {
      if (!currentUser) return null;

      const existingBooking = bookings.find((b) => b.eventId === eventId);
      if (existingBooking) {
        return existingBooking;
      }

      try {
        const { booking } = await createBooking(eventId, currentUser.username);
        const isNewBooking = !bookings.some((b) => b.id === booking.id);

        setBookings((existing) => {
          if (existing.some((b) => b.id === booking.id)) return existing;
          return [booking, ...existing];
        });

        if (isNewBooking) {
          setEvents((existingEvents) =>
            existingEvents.map((item) =>
              item.id === eventId
                ? {
                    ...item,
                    registered: Math.min((item.registered || 0) + 1, item.capacity),
                  }
                : item
            )
          );
        }

        return booking;
      } catch (err) {
        // Local fallback
        return localBookEvent(eventId, currentUser.username);
      }
    },
    [bookings, currentUser, localBookEvent]
  );

  const getBookingsForCurrentUser = useCallback(() => {
    if (!currentUser) return [];
    return bookings.filter((b) => b.username === currentUser.username);
  }, [currentUser, bookings]);

  const verifyTicket = useCallback(
    async (bookingId) => {
      try {
        const result = await verifyTicketRequest(bookingId);

        // Update local state to reflect check-in
        setBookings((existing) =>
          existing.map((item) =>
            item.id === bookingId
              ? { ...item, status: "Attended" }
              : item
          )
        );
        if (result.event) {
          setEvents((existingEvents) =>
            existingEvents.map((item) =>
              item.id === result.event.id ? result.event : item
            )
          );
        }

        const booking = bookings.find((b) => b.id === bookingId);
        const event = events.find((e) => e.id === booking?.eventId);
        const eventTitle = event?.title || result.event?.title || "this event";
        if (result.already) {
          return {
            ok: true,
            title: "Already scanned",
            message: `${booking?.username || "This attendee"} was already checked in for ${eventTitle}.`,
            already: true,
          };
        }
        return {
          ok: true,
          title: "Valid ticket",
          message: `${booking?.username || "Attendee"} checked in for ${eventTitle}.`,
        };
      } catch (err) {
        // Local fallback
        return localVerifyTicket(bookingId);
      }
    },
    [bookings, events, localVerifyTicket]
  );

  const value = useMemo(
    () => ({
      addEvent,
      bookEvent,
      bookings,
      backendStatus,
      currentUser,
      events,
      fetchEvents: fetchEventsData,
      getBookingsForCurrentUser,
      getEventById,
      fetchEventById: fetchEventByIdAsync,
      login,
      logout,
      register,
      users,
      verifyTicket,
    }),
    [
      addEvent,
      bookEvent,
      bookings,
      backendStatus,
      currentUser,
      events,
      fetchEventsData,
      getBookingsForCurrentUser,
      getEventById,
      fetchEventByIdAsync,
      login,
      logout,
      register,
      users,
      verifyTicket,
    ]
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const value = useContext(AppStoreContext);
  if (!value) {
    throw new Error("useAppStore must be used inside AppStoreProvider");
  }
  return value;
}
