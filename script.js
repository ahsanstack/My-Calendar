let currentDate = new Date();
let events = JSON.parse(localStorage.getItem("mycalendar_events")) || [];
let searchQuery = "";

const colorClasses = {
  blue: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700",
  green:
    "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700",
  purple:
    "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700",
  amber:
    "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700",
  rose: "bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700",
};

const calendarGrid = document.getElementById("calendarGrid");
const currentMonthYear = document.getElementById("currentMonthYear");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const todayBtn = document.getElementById("todayBtn");

function renderCalendar() {
  calendarGrid.innerHTML = "";
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  currentMonthYear.textContent = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const today = new Date();

  // Prev Month Padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayDiv = document.createElement("div");
    dayDiv.className =
      "bg-slate-50/50 dark:bg-slate-800/40 p-1.5 text-slate-400 dark:text-slate-600 select-none";
    dayDiv.innerHTML = `<span class="text-xs font-medium">${daysInPrevMonth - i}</span>`;
    calendarGrid.appendChild(dayDiv);
  }

  // Active Days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement("div");
    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isToday =
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year;

    dayDiv.className = `bg-white dark:bg-slate-800 p-1.5 flex flex-col justify-start overflow-hidden transition-all hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer ${isToday ? "bg-indigo-50/40 dark:bg-indigo-950/30" : ""}`;

    dayDiv.innerHTML = `
      <div class="flex items-center justify-between pointer-events-none">
        <span class="text-xs font-semibold ${isToday ? "bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center" : "text-slate-700 dark:text-slate-300"}">${day}</span>
      </div>
      <div class="mt-1 space-y-1 overflow-y-auto max-h-[85px] text-xs"></div>
    `;

    const dayEventsContainer = dayDiv.querySelector("div:last-child");

    const filteredEvents = events.filter((e) => {
      const matchesDate = e.date === formattedDate;
      const matchesSearch =
        searchQuery === "" ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesSearch;
    });

    filteredEvents.forEach((evt) => {
      const eventEl = document.createElement("div");
      eventEl.className = `px-1.5 py-0.5 rounded border text-[11px] font-medium truncate shadow-xs ${colorClasses[evt.color] || colorClasses.blue}`;
      eventEl.textContent = evt.title;

      eventEl.onclick = (e) => {
        e.stopPropagation();
        openModal(evt);
      };

      dayEventsContainer.appendChild(eventEl);
    });

    dayDiv.onclick = () => openModal({ date: formattedDate });
    calendarGrid.appendChild(dayDiv);
  }

  // Next Month Padding
  const totalCells = calendarGrid.children.length;
  for (let i = 1; i <= 42 - totalCells; i++) {
    const dayDiv = document.createElement("div");
    dayDiv.className =
      "bg-slate-50/50 dark:bg-slate-800/40 p-1.5 text-slate-400 dark:text-slate-600 select-none";
    dayDiv.innerHTML = `<span class="text-xs font-medium">${i}</span>`;
    calendarGrid.appendChild(dayDiv);
  }

  if (typeof updateStats === "function") updateStats();
}

prevMonthBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
};
nextMonthBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
};
todayBtn.onclick = () => {
  currentDate = new Date();
  renderCalendar();
};

// Modal Elements
const eventModal = document.getElementById("eventModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const eventForm = document.getElementById("eventForm");
const deleteEventBtn = document.getElementById("deleteEventBtn");
const darkModeToggle = document.getElementById("darkModeToggle");
const searchInput = document.getElementById("searchInput");

// LocalStorage & Stats
function saveEvents() {
  localStorage.setItem("mycalendar_events", JSON.stringify(events));
  updateStats();
}

function updateStats() {
  document.getElementById("statTotal").textContent = events.length;
  const currentMonthPrefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  const monthCount = events.filter((e) =>
    e.date.startsWith(currentMonthPrefix),
  ).length;
  document.getElementById("statMonth").textContent = monthCount;
}

// Modal Handlers
function openModal(evt = null) {
  document.getElementById("eventId").value = evt?.id || "";
  document.getElementById("eventTitle").value = evt?.title || "";
  document.getElementById("eventDate").value =
    evt?.date || new Date().toISOString().split("T")[0];
  document.getElementById("eventColor").value = evt?.color || "blue";

  if (evt?.id) {
    document.getElementById("modalTitle").textContent = "Edit Event";
    deleteEventBtn.classList.remove("hidden");
  } else {
    document.getElementById("modalTitle").textContent = "Add Event";
    deleteEventBtn.classList.add("hidden");
  }

  eventModal.classList.remove("hidden");
}

function closeModal() {
  eventModal.classList.add("hidden");
  eventForm.reset();
}

// --- Dark Mode Toggle ---

// Initialize theme on load
if (
  localStorage.getItem("mycalendar_theme") === "dark" ||
  (!("mycalendar_theme" in localStorage) &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

// Click Handler
darkModeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  const isDark = document.documentElement.classList.contains("dark");
  localStorage.setItem("mycalendar_theme", isDark ? "dark" : "light");
});

// Live Search Input
searchInput.oninput = (e) => {
  searchQuery = e.target.value;
  renderCalendar();
};

// Event Listeners
openModalBtn.onclick = () => openModal();
closeModalBtn.onclick = closeModal;

eventForm.onsubmit = (e) => {
  e.preventDefault();
  const id = document.getElementById("eventId").value;
  const title = document.getElementById("eventTitle").value;
  const date = document.getElementById("eventDate").value;
  const color = document.getElementById("eventColor").value;

  if (id) {
    events = events.map((evt) =>
      evt.id === id ? { id, title, date, color } : evt,
    );
  } else {
    events.push({ id: Date.now().toString(), title, date, color });
  }

  saveEvents();
  renderCalendar();
  closeModal();
};

deleteEventBtn.onclick = () => {
  const id = document.getElementById("eventId").value;
  events = events.filter((evt) => evt.id !== id);
  saveEvents();
  renderCalendar();
  closeModal();
};

// Initialize
renderCalendar();
