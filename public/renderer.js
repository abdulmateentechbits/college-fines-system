const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  loadHomePage();
});

function attachGlobalEventListeners() {
  // Check if elements exist before adding listeners
  const homeLink = document.getElementById('home-link');
  const addFineLink = document.getElementById('add-fine-link');
  const viewFinesLink = document.getElementById('view-fines-link');

  // Remove previous event listeners if they exist
  if (homeLink) homeLink.removeEventListener('click', loadHomePage);
  if (addFineLink) addFineLink.removeEventListener('click', loadAddFinePage);
  if (viewFinesLink) viewFinesLink.removeEventListener('click', loadViewFinesPage);

  if (homeLink) homeLink.addEventListener('click', loadHomePage);
  if (addFineLink) addFineLink.addEventListener('click', loadAddFinePage);
  if (viewFinesLink) viewFinesLink.addEventListener('click', loadViewFinesPage);
}

function loadHomePage() {
  document.getElementById('app').innerHTML = `
    <h2 class="home-title">Welcome to the College Fines System!</h2>
    <div class="table-container">
      <div class="table-header">
        <h2>Fines List</h2>
        <a href="#" id="add-fine-link" class="button">Add Fine</a>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Class</th>
            <th>Roll Number</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="fines-list">
          <!-- Fines will be displayed here -->
        </tbody>
      </table>
    </div>
  `;

  attachGlobalEventListeners();
  fetchFines();
}

function fetchFines() {
  const finesList = document.getElementById('fines-list');
  if (!finesList) return;

  finesList.innerHTML = '<tr><td colspan="7">Loading fines...</td></tr>';

  ipcRenderer.removeAllListeners('fines-fetched'); // Remove existing listeners

  ipcRenderer.send('fetch-fines');

  ipcRenderer.on('fines-fetched', (event, fines) => {
    if (fines.length === 0) {
      finesList.innerHTML = '<tr><td colspan="7">No fines to display.</td></tr>';
    } else {
      finesList.innerHTML = fines.map(fine => `
        <tr>
          <td>${fine.studentName}</td>
          <td>${fine.studentClass}</td>
          <td>${fine.rollNumber}</td>
          <td>${fine.description}</td>
          <td>${fine.amount}</td>
          <td class="date-column">${fine.fine_date}</td>
          <td><button class="delete-button" data-id="${fine.fine_id}">Delete</button></td>
        </tr>
      `).join('');

      // Attach delete event listeners
      document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', handleDeleteFine);
      });
    }
  });
}

function loadAddFinePage() {
  document.getElementById('app').innerHTML = `
      <div class="container">
        <h2>Add New Fine</h2>
        <form id="add-fine-form" class="form">
          <div class="form-group">
            <label for="student-name">Student Name:</label>
            <input type="text" id="student-name" name="student-name" required>
          </div>
          <div class="form-group">
            <label for="student-class">Class:</label>
            <input type="text" id="student-class" name="student-class" required>
          </div>
          <div class="form-group">
            <label for="roll-number">Roll Number:</label>
            <input type="text" id="roll-number" name="roll-number" required>
          </div>
          <div class="form-group">
            <label for="fine-description">Description:</label>
            <textarea id="fine-description" name="fine-description" required></textarea>
          </div>
          <div class="form-group">
            <label for="fine-amount">Fine Amount:</label>
            <input type="number" id="fine-amount" name="fine-amount" required>
          </div>
          <button type="submit" class="submit-button">Submit Fine</button>
        </form>
        <a href="#" id="home-link" class="back-link">Back to Home</a>
      </div>
    `;

  attachGlobalEventListeners();
  const form = document.getElementById('add-fine-form');
  if (form) form.addEventListener('submit', handleAddFine);
}

function loadViewFinesPage() {
  document.getElementById('app').innerHTML = `
      <div class="table-container">
        <h2>View All Fines</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Class</th>
              <th>Roll Number</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody id="fines-list">
            <!-- Fines will be displayed here -->
          </tbody>
        </table>
        <a href="#" id="home-link" class="back-link">Back to Home</a>
      </div>
    `;

  attachGlobalEventListeners();
  fetchFines();
}

function handleAddFine(event) {
  event.preventDefault();

  const fineData = {
    studentName: document.getElementById('student-name').value,
    studentClass: document.getElementById('student-class').value,
    rollNumber: document.getElementById('roll-number').value,
    description: document.getElementById('fine-description').value,
    amount: document.getElementById('fine-amount').value,
  };

  ipcRenderer.send('add-fine', fineData);
}

function handleDeleteFine(event) {
  const fineId = event.target.getAttribute('data-id');
  if (confirm('Are you sure you want to delete this fine?')) {
    ipcRenderer.send('delete-fine', fineId);
  }
}


ipcRenderer.on('fine-deleted', () => {
  alert('Fine deleted successfully!');
  fetchFines(); 
});


ipcRenderer.on('fine-added', () => {
  alert('Fine added successfully!');
  fetchFines();
});
