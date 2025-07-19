let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  displayTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  displayTasks();
}

function filterTasks(filter) {
  currentFilter = filter;
  displayTasks();
}

function isOverdue(task) {
  const today = new Date().toISOString().split("T")[0];
  return task.dueDate && !task.completed && task.dueDate < today;
}

function displayTasks() {
  const list = document.getElementById("task-list");
  list.innerHTML = "";

  let total = 0, completed = 0, pending = 0, overdue = 0;

  tasks.forEach((task, index) => {
    if (currentFilter === "completed" && !task.completed) return;
    if (currentFilter === "pending" && task.completed) return;
    if (currentFilter === "overdue" && !isOverdue(task)) return;

    total++;
    if (task.completed) completed++;
    else pending++;

    if (isOverdue(task)) overdue++;

    const li = document.createElement("li");
    li.className = `${task.priority} ${task.completed ? "completed" : ""}`;
    li.innerHTML = `
      <span onclick="toggleTask(${index})">
        ${task.text} 
        ${task.dueDate ? `📅 ${task.dueDate}` : ""}
      </span>
      <button onclick="deleteTask(${index})">✖</button>
    `;
    list.appendChild(li);
  });

  document.getElementById("total-tasks").textContent = tasks.length;
  document.getElementById("completed-tasks").textContent = completed;
  document.getElementById("pending-tasks").textContent = pending;
  document.getElementById("overdue-tasks").textContent = overdue;

  const percent = tasks.length ? (completed / tasks.length) * 100 : 0;
  document.getElementById("progress-bar-fill").style.width = `${percent}%`;
}

function notifyUser(message) {
  if (Notification.permission === "granted") {
    new Notification("⏰ Task Reminder", {
      body: message
    });
  }
}

function checkDueTasks() {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  tasks.forEach(task => {
    if (!task.dueDate || task.completed) return;

    const dueDate = new Date(task.dueDate);

    // Format due date as string for comparison
    const dueStr = dueDate.toISOString().split("T")[0];

    // 1. Alert if due today
    if (dueStr === todayStr) {
      notifyUser(`"${task.text}" is due today.`);
    }

    // 2. Alert if overdue
    if (dueDate < today) {
      notifyUser(`"${task.text}" is overdue!`);
    }

    // 3. Alert if due tomorrow (from today’s perspective)
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    if (dueStr === tomorrowStr) {
      notifyUser(`Heads up! "${task.text}" is due tomorrow.`);
    }
  });
}

// Check once on load
checkDueTasks();

// Then check every 6 hours (or change to 86400000 for 24 hours)
setInterval(checkDueTasks, 6 * 60 * 60 * 1000); 


// Ask permission for notifications
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}




// Load
displayTasks();
checkDueTasks();
