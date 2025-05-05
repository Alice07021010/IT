document.addEventListener('DOMContentLoaded', () => {
    // Элементы DOM
    const tasksContainer = document.getElementById('tasks-container');
    const addTaskBtn = document.getElementById('add-task-btn');
    const editModal = document.getElementById('edit-modal');
    const modalTitle = document.querySelector('.edit-content h3');
    const prevDayBtn = document.querySelector('.prev-day');
    const nextDayBtn = document.querySelector('.next-day');
    const emptyState = document.getElementById('empty-state');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const circleProgress = document.getElementById('circle-progress');
    const circlePercent = document.getElementById('circle-percent');

    // Обновляем содержимое модального окна
    const editContent = document.querySelector('.edit-content');
    editContent.innerHTML = `
        <h3>Редактировать задачу</h3>
        <input type="text" id="task-edit-input" class="task-edit-input" placeholder="Текст задачи">
        
        <div class="datetime-picker">
            <div class="form-group">
                <label for="task-date-input">Дата</label>
                <input type="date" id="task-date-input" class="task-date-input">
            </div>
            <div class="form-group">
                <label for="task-time-input">Время</label>
                <input type="time" id="task-time-input" class="task-time-input">
            </div>
        </div>
        
        <div class="edit-actions">
            <button class="save-edit">Сохранить</button>
            <button class="cancel-edit">Отмена</button>
        </div>
    `;

    // Получаем элементы формы
    const taskInput = document.getElementById('task-edit-input');
    const taskDateInput = document.getElementById('task-date-input');
    const taskTimeInput = document.getElementById('task-time-input');
    const saveBtn = document.querySelector('.save-edit');
    const cancelBtn = document.querySelector('.cancel-edit');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let editingTaskId = null;
    let currentDate = new Date();

    // Инициализация
    initEventListeners();
    updateDateDisplay();
    renderTasks();
    updateProgress();

    function initEventListeners() {
        addTaskBtn.addEventListener('click', showAddTaskUI);
        saveBtn.addEventListener('click', saveTask);
        cancelBtn.addEventListener('click', closeEditModal);
        prevDayBtn.addEventListener('click', goToPrevDay);
        nextDayBtn.addEventListener('click', goToNextDay);
        
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                closeEditModal();
            }
        });
    }

    function showAddTaskUI() {
        editingTaskId = null;
        taskInput.value = '';
        
        // Устанавливаем текущую дату и время по умолчанию
        const now = new Date();
        taskDateInput.value = formatDateInput(now);
        taskTimeInput.value = formatTimeInput(now);
        
        modalTitle.textContent = 'Новая задача';
        openEditModal();
    }

    function openEditModal() {
        editModal.classList.add('active');
        taskInput.focus();
    }

    function closeEditModal() {
        editModal.classList.remove('active');
    }

    function saveTask() {
        const text = taskInput.value.trim();
        if (!text) {
            alert('Введите текст задачи');
            return;
        }

        const dateStr = taskDateInput.value;
        const timeStr = taskTimeInput.value || '00:00';

        if (editingTaskId) {
            const task = tasks.find(t => t.id === editingTaskId);
            if (task) {
                task.text = text;
                task.date = dateStr;
                task.time = timeStr;
            }
        } else {
            tasks.push({
                id: Date.now().toString(),
                text,
                date: dateStr,
                time: timeStr,
                completed: false
            });
        }
        
        saveTasks();
        renderTasks();
        updateProgress();
        closeEditModal();
    }

    function deleteTask(taskId) {
        if (confirm('Удалить эту задачу?')) {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            renderTasks();
            updateProgress();
        }
    }

    function goToPrevDay() {
        currentDate.setDate(currentDate.getDate() - 1);
        updateDateDisplay();
        renderTasks();
    }

    function goToNextDay() {
        currentDate.setDate(currentDate.getDate() + 1);
        updateDateDisplay();
        renderTasks();
    }

    function updateDateDisplay() {
        const dateElement = document.getElementById('current-date');
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        
        if (currentDate.toDateString() === today.toDateString()) {
            dateElement.textContent = 'Сегодня';
        } else if (currentDate.toDateString() === tomorrow.toDateString()) {
            dateElement.textContent = 'Завтра';
        } else {
            const options = { weekday: 'long', day: 'numeric', month: 'long' };
            dateElement.textContent = currentDate.toLocaleDateString('ru-RU', options);
        }
    }

    function renderTasks() {
        const dateStr = formatDateInput(currentDate);
        const dayTasks = tasks.filter(t => t.date === dateStr);
        tasksContainer.innerHTML = '';
    
        if (dayTasks.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            dayTasks.sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
            
            dayTasks.forEach(task => {
                const taskEl = document.createElement('div');
                taskEl.className = `task-card ${task.completed ? 'completed' : ''}`;
                taskEl.dataset.id = task.id;
                
                taskEl.innerHTML = `
                    <div class="task-content">
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <div class="task-time">${task.time || ''}</div>
                        <div class="task-text">${task.text}</div>
                        <div class="task-actions">
                            <button class="task-btn edit-btn">✏️</button>
                            <button class="task-btn delete-btn">🗑️</button>
                        </div>
                    </div>
                `;
                
                tasksContainer.appendChild(taskEl);
                
                // Обработчики для элементов задачи
                const checkbox = taskEl.querySelector('.task-checkbox');
                const editBtn = taskEl.querySelector('.edit-btn');
                const deleteBtn = taskEl.querySelector('.delete-btn');
                
                checkbox.addEventListener('change', function() {
                    task.completed = this.checked;
                    saveTasks();
                    renderTasks();
                    updateProgress();
                });
                
                editBtn.addEventListener('click', () => {
                    editingTaskId = task.id;
                    taskInput.value = task.text;
                    taskDateInput.value = task.date;
                    taskTimeInput.value = task.time || '00:00';
                    modalTitle.textContent = 'Редактировать задачу';
                    openEditModal();
                });
                
                deleteBtn.addEventListener('click', () => deleteTask(task.id));
            });
        }
    }

    function updateProgress() {
        const dateStr = formatDateInput(currentDate);
        const dayTasks = tasks.filter(t => t.date === dateStr);
        
        if (dayTasks.length === 0) {
            progressBar.style.width = '0%';
            progressText.textContent = '0%';
            circleProgress.style.strokeDashoffset = '113';
            circlePercent.textContent = '0%';
            return;
        }
        
        const completedCount = dayTasks.filter(t => t.completed).length;
        const percent = Math.round((completedCount / dayTasks.length) * 100);
        
        // Линейный прогресс-бар
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;
        
        // Круговой прогресс
        const circumference = 113; // 2 * π * r (r = 18)
        const offset = circumference - (percent / 100) * circumference;
        circleProgress.style.strokeDashoffset = offset;
        circlePercent.textContent = `${percent}%`;
    }

    function formatDateInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function formatTimeInput(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});