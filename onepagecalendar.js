const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const monthIndices = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

const monthDays = {
  Jan: 31, Feb: 28, Mar: 31, Apr: 30, May: 31, Jun: 30,
  Jul: 31, Aug: 31, Sep: 30, Oct: 31, Nov: 30, Dec: 31,
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  const currentYear = new Date().getFullYear();
  
  // Set initial year
  document.getElementById("year-label").textContent = currentYear;
  document.getElementById("year").value = currentYear;
  
  // Initialize event listeners
  setupEventListeners();
  
  // Load saved preferences
  loadUserPreferences();
  
  // Generate initial calendar
  updateCalendar();
  
  // Add fade-in animation
  document.body.classList.add('fade-in-up');
}

function setupEventListeners() {
  // Year input change
  document.getElementById("year").addEventListener("input", debounce(updateCalendar, 300));
  
  // Print button
  document.getElementById("print-button").addEventListener("click", handlePrint);
  
  // Dark mode toggle
  document.getElementById("dark-mode-toggle").addEventListener("click", toggleDarkMode);
  
  // Instructions toggle
  document.getElementById("instructions-toggle-btn").addEventListener("click", toggleInstructions);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

function loadUserPreferences() {
  // Load dark mode preference
  const darkMode = localStorage.getItem("darkMode") === "enabled";
  if (darkMode) {
    document.body.classList.add("dark-mode");
    updateDarkModeToggle(true);
  }
  
  // Load instructions state
  const instructionsExpanded = localStorage.getItem("instructionsExpanded") === "true";
  if (instructionsExpanded) {
    expandInstructions();
  }
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function groupMonthsByStartWeekday(year) {
  const leap = isLeapYear(year);
  monthDays.Feb = leap ? 29 : 28;
  
  const groups = Array.from({ length: 7 }, () => []);
  
  for (let m = 0; m < 12; m++) {
    const firstDay = new Date(year, m, 1).getDay(); // 0=Sun, 1=Mon,...
    groups[firstDay].push(months[m]);
  }
  
  return groups;
}

function buildDayNumGrid() {
  const grid = Array.from({ length: 7 }, () => Array(5).fill(""));
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

function buildDayNameGrid() {
  const grid = Array.from({ length: 7 }, () => Array(7).fill(""));
  
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 7; col++) {
      const dayIndex = (row + col) % 7;
      grid[row][col] = weekdays[dayIndex];
    }
  }
  
  return grid;
}

function generateCalendar(year) {
  const leap = isLeapYear(year);
  monthDays.Feb = leap ? 29 : 28;

  // Group months by starting weekday
  const monthGroups = groupMonthsByStartWeekday(year);

  // Build the month header grid
  const monthHeaderRows = Array.from({ length: 3 }, () => Array(7).fill(""));
  for (let wd = 0; wd < 7; wd++) {
    for (let i = 0; i < monthGroups[wd].length; i++) {
      monthHeaderRows[i][wd] = monthGroups[wd][i];
    }
  }

  // Build grids
  const dayNumGrid = buildDayNumGrid();
  const dayNameGrid = buildDayNameGrid();

  // Generate HTML
  let html = '<table class="calendar-table"><thead>';

  // Add month header rows
  for (let row = 0; row < 3; row++) {
    html += "<tr>";
    html += '<th colspan="5"></th>'; // Empty cells for date blocks
    
    for (let wd = 0; wd < 7; wd++) {
      const month = monthHeaderRows[row][wd];
      html += `<th class="month-header">${month || ""}</th>`;
    }
    
    html += "</tr>";
  }
  
  html += "</thead><tbody>";

  // Add data rows
  for (let row = 0; row < 7; row++) {
    html += "<tr>";
    
    // Day number columns
    for (let col = 0; col < 5; col++) {
      const dayNum = dayNumGrid[row][col];
      html += `<td class="date-block" ${dayNum ? `data-date="${dayNum}"` : ''}>${dayNum || ""}</td>`;
    }
    
    // Weekday columns
    for (let col = 0; col < 7; col++) {
      const dayName = dayNameGrid[row][col];
      const cellClass = dayName === "Sun" ? "weekday-cell sunday" : "weekday-cell";
      html += `<td class="${cellClass}" data-day="${dayName}">${dayName}</td>`;
    }
    
    html += "</tr>";
  }
  
  html += "</tbody></table>";
  return html;
}

function updateCalendar() {
  const yearInput = document.getElementById("year");
  const year = parseInt(yearInput.value, 10);
  
  // Validate year
  if (isNaN(year) || year < 1900 || year > 2100) {
    return;
  }
  
  // Update year display
  document.getElementById("year-label").textContent = year;
  
  // Update leap year indicator
  const leap = isLeapYear(year);
  const leapIndicator = document.getElementById("leap-indicator");
  leapIndicator.textContent = leap ? "Leap Year" : "";
  
  // Generate and display calendar
  const calendarContainer = document.getElementById("calendar-container");
  calendarContainer.innerHTML = generateCalendar(year);
  
  // Add interaction effects
  addCalendarInteractions();
}

function addCalendarInteractions() {
  const dateCells = document.querySelectorAll('.date-block[data-date]');
  const weekdayCells = document.querySelectorAll('.weekday-cell[data-day]');
  
  // Add hover effects for better UX
  dateCells.forEach(cell => {
    cell.addEventListener('mouseenter', () => {
      cell.style.transform = 'scale(1.05)';
      cell.style.zIndex = '10';
    });
    
    cell.addEventListener('mouseleave', () => {
      cell.style.transform = '';
      cell.style.zIndex = '';
    });
  });
  
  weekdayCells.forEach(cell => {
    cell.addEventListener('mouseenter', () => {
      cell.style.transform = 'scale(1.02)';
    });
    
    cell.addEventListener('mouseleave', () => {
      cell.style.transform = '';
    });
  });
}

function handlePrint() {
  // Add print-specific styling
  document.body.classList.add('printing');
  
  // Trigger print
  window.print();
  
  // Remove print styling after a delay
  setTimeout(() => {
    document.body.classList.remove('printing');
  }, 1000);
}

function toggleDarkMode() {
  const isDarkMode = document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
  updateDarkModeToggle(isDarkMode);
  
  // Add smooth transition effect
  document.body.style.transition = 'all 0.3s ease-in-out';
  setTimeout(() => {
    document.body.style.transition = '';
  }, 300);
}

function updateDarkModeToggle(isDarkMode) {
  const toggleIcon = document.querySelector(".toggle-icon");
  toggleIcon.textContent = isDarkMode ? "☀️" : "🌙";
  
  // Add rotation animation
  toggleIcon.style.transform = 'rotate(180deg)';
  setTimeout(() => {
    toggleIcon.style.transform = '';
  }, 300);
}

function toggleInstructions() {
  const content = document.getElementById("instructions-content");
  const button = document.getElementById("instructions-toggle-btn");
  const isExpanded = content.classList.contains("expanded");
  
  if (isExpanded) {
    collapseInstructions();
  } else {
    expandInstructions();
  }
  
  // Save state
  localStorage.setItem("instructionsExpanded", (!isExpanded).toString());
}

function expandInstructions() {
  const content = document.getElementById("instructions-content");
  const button = document.getElementById("instructions-toggle-btn");
  
  content.classList.add("expanded");
  button.classList.add("active");
  button.querySelector(".toggle-text").textContent = "Hide Instructions";
}

function collapseInstructions() {
  const content = document.getElementById("instructions-content");
  const button = document.getElementById("instructions-toggle-btn");
  
  content.classList.remove("expanded");
  button.classList.remove("active");
  button.querySelector(".toggle-text").textContent = "How to Use This Calendar";
}

function handleKeyboardShortcuts(event) {
  // Ctrl/Cmd + P for print
  if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
    event.preventDefault();
    handlePrint();
  }
  
  // Ctrl/Cmd + D for dark mode toggle
  if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
    event.preventDefault();
    toggleDarkMode();
  }
  
  // Arrow keys for year navigation
  if (event.target === document.getElementById('year')) {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      changeYear(1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      changeYear(-1);
    }
  }
}

function changeYear(delta) {
  const yearInput = document.getElementById('year');
  const currentYear = parseInt(yearInput.value, 10);
  const newYear = currentYear + delta;
  
  if (newYear >= 1900 && newYear <= 2100) {
    yearInput.value = newYear;
    updateCalendar();
  }
}

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Add smooth scrolling for anchor links
document.addEventListener('click', function(event) {
  if (event.target.matches('a[href^="#"]')) {
    event.preventDefault();
    const target = document.querySelector(event.target.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
});

// Add loading animation
function showLoading() {
  const container = document.getElementById('calendar-container');
  container.style.opacity = '0.5';
  container.style.transition = 'opacity 0.2s ease-in-out';
}

function hideLoading() {
  const container = document.getElementById('calendar-container');
  container.style.opacity = '1';
}

// Performance optimization: Use requestAnimationFrame for smooth animations
function smoothUpdate(callback) {
  requestAnimationFrame(() => {
    callback();
  });
}