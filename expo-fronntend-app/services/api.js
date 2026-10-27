const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.14.68.175:5000";

console.log("[api] Backend API_URL:", API_URL);

async function request(path, options = {}) {
  const url = `${API_URL}${path}`;
  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      const error = new Error(data.message || `HTTP error: ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.status) {
      throw error;
    }
    // Network-level failure (DNS, timeout, refused connection)
    const netError = new Error(
      error.message || `Cannot reach backend at ${API_URL}`
    );
    netError.network = true;
    netError.url = url;
    throw netError;
  }
}

export function getApiUrl() {
  return API_URL;
}

export async function testBackend() {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  return await response.text();
}

// ---------- Auth ----------
export async function registerUser(username, password) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function loginUser(username, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

// ---------- Events ----------
export async function fetchEvents(search) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return request(`/api/events${query}`);
}

export async function fetchEventById(id) {
  return request(`/api/events/${id}`);
}

export async function createEvent(eventDetails) {
  return request("/api/events", {
    method: "POST",
    body: JSON.stringify(eventDetails),
  });
}

// ---------- Bookings ----------
export async function createBooking(eventId, username) {
  return request("/api/bookings", {
    method: "POST",
    body: JSON.stringify({ eventId, username }),
  });
}

export async function fetchBookingsForUser(username) {
  return request(`/api/bookings/user/${encodeURIComponent(username)}`);
}

export async function verifyTicket(bookingId) {
  return request(`/api/bookings/${encodeURIComponent(bookingId)}/checkin`, {
    method: "PATCH",
  });
}

// ---------- Users ----------
export async function fetchUsers() {
  return request("/api/users");
}
