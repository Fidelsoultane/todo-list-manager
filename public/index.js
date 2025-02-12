document.addEventListener('DOMContentLoaded', fetchTasks);

const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;

    const response = await fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
    });

    if (response.ok) {
      showNotification('Tâche ajoutée avec succès !');
      document.getElementById('title').value = '';
      document.getElementById('description').value = '';
      fetchTasks();
  } else {
      showNotification('Erreur lors de l\'ajout de la tâche.', true);
  }
  
});

async function fetchTasks() {
  const response = await fetch('http://localhost:3000/api/tasks');
  const tasks = await response.json();

  // Trier : les tâches non complétées en premier
  tasks.sort((a, b) => a.completed - b.completed);
  
  taskList.innerHTML = '';
  tasks.forEach(task => renderTask(task));
}

let allTasks = [];

async function fetchTasks() {
    const response = await fetch('http://localhost:3000/api/tasks');
    allTasks = await response.json();

    renderFilteredTasks('all'); // Affiche toutes les tâches par défaut
}

function filterTasks(filter) {
    renderFilteredTasks(filter);
}

function renderFilteredTasks(filter) {
    taskList.innerHTML = '';

    let filteredTasks = allTasks;

    if (filter === 'completed') {
        filteredTasks = allTasks.filter(task => task.completed);
    } else if (filter === 'incomplete') {
        filteredTasks = allTasks.filter(task => !task.completed);
    }

    filteredTasks.forEach(task => renderTask(task));
}


function searchTasks() {
  const query = document.getElementById('search-bar').value.toLowerCase();
  const filteredTasks = allTasks.filter(task => 
      task.title.toLowerCase().includes(query) || 
      (task.description && task.description.toLowerCase().includes(query))
  );

  taskList.innerHTML = '';
  filteredTasks.forEach(task => renderTask(task));
}


function renderTask(task) {
  const li = document.createElement('li');
  li.className = task.completed ? 'completed' : '';
  
  li.innerHTML = `
      <span>${task.title} - ${task.description || ''}</span>
      <div class="task-actions">
          <button class="complete-btn ${task.completed ? 'completed' : ''}" 
                  onclick="completeTask('${task._id}')" 
                  ${task.completed ? 'disabled' : ''}>
              ${task.completed ? 'Complétée' : 'Compléter'}
          </button>
          <button class="edit-btn" onclick="editTask('${task._id}', '${task.title}', '${task.description}')"
                  ${task.completed ? 'disabled' : ''}>
              Modifier
          </button>
          <button class="delete-btn" onclick="deleteTask('${task._id}')">Supprimer</button>
      </div>
  `;
  taskList.appendChild(li);
}


async function deleteTask(id) {
  const confirmDelete = confirm("Es-tu sûr de vouloir supprimer cette tâche ?");
  if (confirmDelete) {
    showNotification('Tâche supprimée avec succès !');
      await fetch(`http://localhost:3000/api/tasks/${id}`, { method: 'DELETE' });
      fetchTasks();
  }
}


function editTask(id, currentTitle, currentDescription) {
    const newTitle = prompt("Modifier le titre:", currentTitle);
    const newDescription = prompt("Modifier la description:", currentDescription);

    if (newTitle !== null) {
      showNotification('Tâche modifiée avec succès !');
        updateTask(id, newTitle, newDescription);
    }
}

async function updateTask(id, title, description) {
    await fetch(`http://localhost:3000/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
    });
    fetchTasks();
}

async function completeTask(id) {
  showNotification('Tâche complétée !');
    await fetch(`http://localhost:3000/api/tasks/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
        
    });
    fetchTasks();
}

function showNotification(message, isError = false) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${isError ? 'error' : ''} show`;

  setTimeout(() => {
      notification.classList.remove('show');
  }, 3000);
}

