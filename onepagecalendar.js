const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const monthIndices = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};
const monthDays = {
  Jan: 31,
  Feb: 28,
  Mar: 31,
  Apr: 30,
  May: 31,
  Jun: 30,
  Jul: 31,
  Aug: 31,
  Sep: 30,
  Oct: 31,
  Nov: 30,
  Dec: 31,
};
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Set current year on page load
const currentYear = new Date().getFullYear();
document.getElementById("year-label").textContent = currentYear;
document.getElementById("year").value = currentYear;

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// Group months by their starting weekday for the given year
function groupMonthsByStartWeekday(year) {
  let leap = isLeapYear(year);
  monthDays.Feb = leap ? 29 : 28;
  let groups = Array.from({ length: 7 }, () => []);
  for (let m = 0; m < 12; m++) {
    let firstDay = new Date(year, m, 1).getDay(); // 0=Sun, 1=Mon,...
    groups[firstDay].push(months[m]);
  }
  return groups;
}

// Build the 5x7 day grid: columns are 1-7, 8-14, 15-21, 22-28, 29-31
function buildDayNumGrid() {
  let grid = Array.from({ length: 7 }, () => Array(5).fill(""));
  let n = 1;
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 7; row++) {
      if (n <= 31) {
        grid[row][col] = n++;
      }
    }
  }
  return grid;
}

// Build the 7x7 day name grid (right), starting with Sunday
function buildDayNameGrid() {
  let grid = Array.from({ length: 7 }, () => Array(7).fill(""));
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 7; col++) {
      let dayIndex = (row + col) % 7;
      grid[row][col] = weekdays[dayIndex];
    }
  }
  return grid;
}

function generateCalendar(year) {
  const leap = isLeapYear(year);
  monthDays.Feb = leap ? 29 : 28;

  // Group months by starting weekday (0=Sun, ..., 6=Sat)
  const monthGroups = groupMonthsByStartWeekday(year);

  // Build the 7x3 month header grid (columns = weekday, rows = up to 3 months per group)
  let monthHeaderRows = Array.from({ length: 3 }, () => Array(7).fill(""));
  for (let wd = 0; wd < 7; wd++) {
    for (let i = 0; i < monthGroups[wd].length; i++) {
      monthHeaderRows[i][wd] = monthGroups[wd][i];
    }
  }

  // Build the 5x7 day number grid (left side)
  const dayNumGrid = buildDayNumGrid();
  // Build the 7x7 day name grid (right side)
  const dayNameGrid = buildDayNameGrid();

  // Build table header: 5 empty cells, then 7 weekday columns
  let html = '<table class="calendar-table"><thead><tr>';
  html += "</tr>";

  // Add 3 rows of month names (7 columns)
  for (let row = 0; row < 3; row++) {
    html += "<tr>";
    html += `<th colspan="5"></th>`; // 5 empty cells for date blocks
    for (let wd = 0; wd < 7; wd++) {
      const m = monthHeaderRows[row][wd];
      html += `<th class="month-header">${m ? m : ""}</th>`;
    }
    html += "</tr>";
  }
  html += "</thead><tbody>";

  // For each row (7 rows for days)
  for (let row = 0; row < 7; row++) {
    html += "<tr>";
    // Five day number columns
    for (let col = 0; col < 5; col++) {
      let dayNum = dayNumGrid[row][col];
      html += `<td class="date-block">${dayNum ? dayNum : ""}</td>`;
    }
    // For each weekday column (7)
    for (let col = 0; col < 7; col++) {
      const dayName = dayNameGrid[row][col];
      const cellClass =
        dayName === "Sun" ? "weekday-cell sunday" : "weekday-cell";
      html += `<td class="${cellClass}">${dayName}</td>`;
    }
    html += "</tr>";
  }
  html += "</tbody></table>";
  return html;
}

function updateCalendar() {
  const year = parseInt(document.getElementById("year").value, 10);
  document.getElementById("year-label").textContent = year;
  const leap = isLeapYear(year);
  document.getElementById("leap-indicator").textContent = leap
    ? "Leap Year"
    : "";
  document.getElementById("calendar-container").innerHTML =
    generateCalendar(year);
}

document.getElementById("year").addEventListener("input", updateCalendar);

// Dark mode functionality
document.addEventListener("DOMContentLoaded", function () {
  const darkModeToggle = document.getElementById("dark-mode-toggle");

  // Check for saved dark mode preference
  const darkMode = localStorage.getItem("darkMode") === "enabled";
  if (darkMode) {
    document.body.classList.add("dark-mode");
    darkModeToggle.querySelector(".toggle-text").textContent = "☀️";
  }

  // Toggle dark mode
  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDarkMode = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
    darkModeToggle.querySelector(".toggle-text").textContent = isDarkMode
      ? "☀️"
      : "🌙";
  });
});

// Initial render
updateCalendar();
