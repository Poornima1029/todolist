document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('todo-form');
    const taskInput = document.getElementById('task-input');
    const dateInput = document.getElementById('date-input');
    const todoList = document.getElementById('todo-list');
  
    // Fetch todos from the backend
    async function fetchTodos() {
      const response = await fetch('/api/todos');
      const todos = await response.json();
      renderTodos(todos);
    }
  
    // Render todos in the UI
    function renderTodos(todos) {
      todoList.innerHTML = '';  // Clear the current list before rendering new ones
      todos.forEach(todo => {
        const todoItem = document.createElement('li');
        const date = new Date(todo.date).toLocaleDateString();  // Format the date to a readable format
        todoItem.innerHTML = `
          <span>${todo.task}</span><span class="date">(${date})</span>
          <button class="delete-btn" data-id="${todo._id}">Delete</button>
        `;
        todoList.appendChild(todoItem);
      });
  
      // Add event listeners to delete buttons
      const deleteButtons = document.querySelectorAll('.delete-btn');
      deleteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
          const todoId = e.target.getAttribute('data-id');
          await deleteTodo(todoId);
        });
      });
    }
  
    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const task = taskInput.value.trim();
      const date = dateInput.value;
  
      if (!task || !date) return;
  
      // Send new todo to the backend
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task, date }),
      });
  
      const newTodo = await response.json();
      taskInput.value = '';  // Clear input fields after submission
      dateInput.value = '';
      fetchTodos();  // Refresh the todo list
    });
  
    // Delete todo
    async function deleteTodo(id) {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        fetchTodos();  // Refresh the todo list after deletion
      } else {
        alert('Error deleting todo');
      }
    }
  
    // Initial fetch to display todos
    fetchTodos();
  });
  // Dark Mode Toggle Functionality
const darkModeButton = document.getElementById("dark-mode-toggle");

// Check if the user has previously selected dark mode
if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark-mode");
}

// Toggle dark mode on button click
darkModeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  
  // Save the dark mode preference in localStorage
  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "enabled");
  } else {
    localStorage.setItem("darkMode", "disabled");
  }
});
