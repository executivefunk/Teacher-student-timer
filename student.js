// JavaScript for student timer functionality

// Global Timer State Variables
let currentSchedule = null;
let currentSegmentIndex = 0;
let timeLeftInSegment = 0; // in seconds
let timerIntervalId = null;

// Create Audio Object
const alertSound = new Audio('notification.mp3');
alertSound.load(); // Preload the sound

const schedules = [
  {
    name: "Work Hard, Take a Break",
    description: "📝 50 min → Get work done\n☕ 10 min → Break\n📝 50 min → Get work done\n✅ 10 min → Break & plan next steps\n\nGreat for: Staying focused with just one break!",
    times: [
      { label: "Work", duration: 50 },
      { label: "Break", duration: 10 },
      { label: "Work", duration: 50 },
      { label: "Wrap Up", duration: 10 },
    ],
  },
  {
    name: "Work a Little, Rest a Little",
    description: "💡 30 min → Work time\n⏸️ 10 min → Break\n💡 30 min → Work time\n⏸️ 10 min → Break\n💡 30 min → Work time\n✅ 10 min → Break & plan next steps\n\nGreat for: Working in short bursts with more breaks!",
    times: [
      { label: "Work", duration: 30 },
      { label: "Break", duration: 10 },
      { label: "Work", duration: 30 },
      { label: "Break", duration: 10 },
      { label: "Work", duration: 30 },
      { label: "Wrap Up", duration: 10 },
    ],
  },
  {
    name: "Power Hour & Chill",
    description: "⚡ 60 min → Get in the zone!\n🌿 15 min → Break\n📝 35 min → Work again\n✅ 10 min → Break & plan next steps\n\nGreat for: Getting a lot done first, then taking a longer break!",
    times: [
      { label: "Work", duration: 60 },
      { label: "Break", duration: 15 },
      { label: "Work", duration: 35 },
      { label: "Wrap Up", duration: 10 },
    ],
  },
  {
    name: "Short Work & Quick Breaks",
    description: "💻 25 min → Work\n🔄 5 min → Break\n📖 25 min → Work\n🌟 10 min → Break\n🖊️ 25 min → Work\n🔄 5 min → Break\n🏁 15 min → Work\n✅ 10 min → Break & plan next steps\n\nGreat for: If you like to take lots of small breaks!",
    times: [
      { label: "Work", duration: 25 },
      { label: "Break", duration: 5 },
      { label: "Work", duration: 25 },
      { label: "Break", duration: 10 },
      { label: "Work", duration: 25 },
      { label: "Break", duration: 5 },
      { label: "Work", duration: 15 },
      { label: "Wrap Up", duration: 10 },
    ],
  },
];

// Get references to DOM elements
const scheduleOptionsContainer = document.getElementById('schedule-options');
const fullscreenTimerContainer = document.getElementById('fullscreen-timer-container');
const segmentLabel = document.getElementById('segment-label');
const timeDisplay = document.getElementById('time-display');
const exitTimerButton = document.getElementById('exit-timer-button');

// Modal DOM Element References
const exitModal = document.getElementById('exit-modal');
const exitConfirmInput = document.getElementById('exit-confirm-input');
const confirmExitModalButton = document.getElementById('confirm-exit-modal-button');
const cancelExitModalButton = document.getElementById('cancel-exit-modal-button');


function updateTimerDisplay() {
  if (!currentSchedule || currentSegmentIndex >= currentSchedule.times.length) {
    return;
  }
  const segment = currentSchedule.times[currentSegmentIndex];
  if (segmentLabel) segmentLabel.textContent = segment.label;
  
  const minutes = Math.floor(timeLeftInSegment / 60);
  const seconds = timeLeftInSegment % 60;
  if (timeDisplay) {
    timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

function tick() {
  timeLeftInSegment--;
  if (timeLeftInSegment < 0) {
    currentSegmentIndex++;
    if (currentSegmentIndex >= currentSchedule.times.length) {
      if (timerIntervalId) clearInterval(timerIntervalId);
      timerIntervalId = null; 
      if (segmentLabel) segmentLabel.textContent = "Finished!";
      if (timeDisplay) timeDisplay.textContent = "00:00";
      // Play sound for final finish
      alertSound.play().catch(error => console.error("Error playing sound for finish:", error));
      return;
    }
    // This is a segment transition (not the very end)
    const newSegment = currentSchedule.times[currentSegmentIndex];
    timeLeftInSegment = newSegment.duration * 60;
    // Play sound for segment change
    alertSound.play().catch(error => console.error("Error playing sound for segment change:", error));
  }
  updateTimerDisplay();
}

function startTimer(schedule) {
  currentSchedule = schedule;
  currentSegmentIndex = 0;
  if (!currentSchedule || !currentSchedule.times || currentSchedule.times.length === 0) {
      console.error("Cannot start timer: schedule is invalid or has no time segments.", schedule);
      if (segmentLabel) segmentLabel.textContent = "Error: Invalid Schedule";
      if (timeDisplay) timeDisplay.textContent = "00:00";
      return;
  }
  const firstSegment = currentSchedule.times[0];
  timeLeftInSegment = firstSegment.duration * 60;
  
  updateTimerDisplay(); 

  if (timerIntervalId) {
    clearInterval(timerIntervalId); 
  }
  timerIntervalId = setInterval(tick, 1000);
}

function stopTimerAndResetUI() { 
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
  currentSchedule = null; 
  currentSegmentIndex = 0; 
  timeLeftInSegment = 0; 
}

function displayScheduleOptions() {
  if (!scheduleOptionsContainer) {
    console.error("Error: Could not find element with ID 'schedule-options'");
    return;
  }
  scheduleOptionsContainer.innerHTML = ''; 

  schedules.forEach(scheduleData => { 
    const button = document.createElement('button');
    button.className = 'schedule-button';

    const h4 = document.createElement('h4');
    h4.textContent = scheduleData.name;
    button.appendChild(h4);

    const p = document.createElement('p');
    p.textContent = scheduleData.description;
    button.appendChild(p);

    button.addEventListener('click', () => { 
      // Attempt to play and immediately pause the sound to enable future plays.
      alertSound.play().then(() => {
          alertSound.pause();
          alertSound.currentTime = 0;
      }).catch(error => console.warn("Initial sound play for enabling audio failed (this is common):", error));

      if (scheduleOptionsContainer) {
        scheduleOptionsContainer.style.display = 'none';
      }
      if (fullscreenTimerContainer) {
        fullscreenTimerContainer.style.display = 'flex';
      }
      startTimer(scheduleData); 
    });

    scheduleOptionsContainer.appendChild(button);
  });
}

// Event listener for the main exit button (opens the modal)
if (exitTimerButton) {
  exitTimerButton.addEventListener('click', () => {
    if (exitModal) {
        exitModal.style.display = 'block'; 
        if (exitConfirmInput) exitConfirmInput.focus(); 
    }
  });
} else {
    console.error("Error: Could not find element with ID 'exit-timer-button'");
}

// Event Listener for "Cancel" button in modal
if (cancelExitModalButton) {
    cancelExitModalButton.addEventListener('click', () => {
      if (exitModal) exitModal.style.display = 'none'; 
      if (exitConfirmInput) exitConfirmInput.value = ''; 
    });
} else {
    console.error("Error: Could not find element with ID 'cancel-exit-modal-button'");
}

// Event Listener for "Confirm Exit" button in modal
if (confirmExitModalButton) {
    confirmExitModalButton.addEventListener('click', () => {
      const inputText = exitConfirmInput.value.trim().toLowerCase();
      if (inputText === 'exit') {
        if (exitModal) exitModal.style.display = 'none'; 
        if (exitConfirmInput) exitConfirmInput.value = ''; 

        stopTimerAndResetUI(); 

        if (fullscreenTimerContainer) fullscreenTimerContainer.style.display = 'none'; 
        if (scheduleOptionsContainer) scheduleOptionsContainer.style.display = 'flex'; 

        if (segmentLabel) segmentLabel.textContent = "Segment Label"; 
        if (timeDisplay) timeDisplay.textContent = "00:00"; 
        
      } else {
        if (exitConfirmInput) exitConfirmInput.value = ''; 
        alert("Incorrect word typed. Please type 'exit' to confirm."); 
        if (exitConfirmInput) exitConfirmInput.focus(); 
      }
    });
} else {
    console.error("Error: Could not find element with ID 'confirm-exit-modal-button'");
}

// Handle clicks outside modal to close it
window.addEventListener('click', (event) => {
  if (event.target == exitModal) { 
    if (exitModal) exitModal.style.display = 'none';
    if (exitConfirmInput) exitConfirmInput.value = ''; 
  }
});

document.addEventListener('DOMContentLoaded', () => {
  displayScheduleOptions();
  if (fullscreenTimerContainer) {
      fullscreenTimerContainer.style.display = 'none';
  }
  // Initial check for all elements
  if (!scheduleOptionsContainer) console.error("DOM Ready: schedule-options not found.");
  if (!fullscreenTimerContainer) console.error("DOM Ready: fullscreen-timer-container not found.");
  if (!segmentLabel) console.error("DOM Ready: segment-label not found.");
  if (!timeDisplay) console.error("DOM Ready: time-display not found.");
  if (!exitTimerButton) console.error("DOM Ready: exit-timer-button not found.");
  if (!exitModal) console.error("DOM Ready: exit-modal not found.");
  if (!exitConfirmInput) console.error("DOM Ready: exit-confirm-input not found.");
  if (!confirmExitModalButton) console.error("DOM Ready: confirm-exit-modal-button not found.");
  if (!cancelExitModalButton) console.error("DOM Ready: cancel-exit-modal-button not found.");
});
