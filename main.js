const { app, BrowserWindow } = require('electron');
const { ipcMain } = require('electron');
const db = require('./database');

const path = require('path');

// Disable hardware acceleration before the app is ready
app.disableHardwareAcceleration();

ipcMain.on('add-fine', async (event, fineData) => {
  try {
    const [student_id] = await db('students').insert({
      name: fineData.studentName,
      class: fineData.studentClass,
      roll_number: fineData.rollNumber,
    });

    await db('fines').insert({
      student_id,
      description: fineData.description,
      amount: fineData.amount,
    });

    event.reply('fine-added');
  } catch (error) {
    console.error('Error adding fine:', error);
  }
});

ipcMain.on('fetch-fines', async (event) => {
  try {
    const fines = await db('fines')
      .join('students', 'fines.student_id', 'students.student_id')
      .select(
        'students.name as studentName',
        'students.class as studentClass',
        'students.roll_number as rollNumber',
        'fines.fine_id',
        'fines.description',
        'fines.amount',
        'fines.fine_date'
      );

    event.reply('fines-fetched', fines);
  } catch (error) {
    console.error('Error fetching fines:', error);
  }
});

ipcMain.on('delete-fine', async (event, fineId) => {
  try {
    await db('fines').where('fine_id', fineId).del();
    event.reply('fine-deleted');
  } catch (error) {
    console.error('Error deleting fine:', error);
  }
});



function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('public/index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
