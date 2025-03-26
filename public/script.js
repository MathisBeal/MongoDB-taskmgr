document.addEventListener("DOMContentLoaded", () => {
    const taskForm = document.getElementById("taskForm");
    const taskList = document.getElementById("taskList");
    const filterStatut = document.getElementById("filterStatut");
    const filterPriorite = document.getElementById("filterPriorite");
    const applyFiltersBtn = document.getElementById("applyFilters");

    let currentEditingTaskId = null;  // Track the task being edited

    // 🟢 Handle task form submission (Create or Update)
    taskForm.addEventListener("submit", async (e) => {
        e.preventDefault();  // Prevent the form from submitting the traditional way

        const taskData = {
            titre: taskForm.titre.value,
            description: taskForm.description.value,
            echeance: taskForm.echeance.value,
            statut: taskForm.statut.value,
            priorite: taskForm.priorite.value,
            auteurNom: taskForm.auteurNom.value,
            auteurPrenom: taskForm.auteurPrenom.value,
            auteurEmail: taskForm.auteurEmail.value,
            categorie: taskForm.categorie.value,
            etiquettes: taskForm.etiquettes.value.split(',').map(tag => tag.trim()),  // Convert comma-separated tags to an array
        };

        if (currentEditingTaskId) {
            // 🟢 Update existing task
            const res = await fetch(`/tasks/${currentEditingTaskId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(taskData),
            });

            if (res.ok) {
                fetchTasks();  // Refresh task list
                taskForm.reset();  // Reset form
                currentEditingTaskId = null;  // Reset the editing task
            } else {
                console.error("Failed to update task");
            }
        } else {
            // 🟢 Create new task
            const res = await fetch("/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(taskData),
            });

            if (res.ok) {
                fetchTasks();  // Refresh task list
                taskForm.reset();  // Reset the form
            } else {
                console.error("Failed to create task");
            }
        }
    });

    // 🟢 Fetch tasks (with filters)
    async function fetchTasks() {
        let filters = [];
        if (filterStatut.value) filters.push(`statut=${encodeURIComponent(filterStatut.value)}`);
        if (filterPriorite.value) filters.push(`priorite=${encodeURIComponent(filterPriorite.value)}`);

        const queryString = filters.length ? `?${filters.join("&")}` : "";
        const res = await fetch(`/tasks${queryString}`);
        const tasks = await res.json();

        taskList.innerHTML = "";
        tasks.forEach(task => renderTask(task));
    }

    // 🟢 Apply filters when clicking the button
    applyFiltersBtn.addEventListener("click", () => {
        fetchTasks();
    });

    // 🟢 Render task item
    function renderTask(task) {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${task.titre}</strong> - ${task.statut} - ${task.priorite}
            <button class="edit" data-id="${task._id}">✏️</button>
            <button class="delete" data-id="${task._id}">❌</button>
        `;

        // Add event listeners for edit and delete buttons
        li.querySelector(".edit").addEventListener("click", () => {
            editTask(task);
        });

        li.querySelector(".delete").addEventListener("click", () => {
            deleteTask(task._id);
        });

        taskList.appendChild(li);
    }

    // 🟢 Edit task (populate form with task data)
    function editTask(task) {
        taskForm.titre.value = task.titre;
        taskForm.description.value = task.description;
        taskForm.echeance.value = task.echeance ? new Date(task.echeance).toISOString().split('T')[0] : '';
        taskForm.statut.value = task.statut;
        taskForm.priorite.value = task.priorite;
        taskForm.auteurNom.value = task.auteurNom;
        taskForm.auteurPrenom.value = task.auteurPrenom;
        taskForm.auteurEmail.value = task.auteurEmail;
        taskForm.categorie.value = task.categorie;
        taskForm.etiquettes.value = task.etiquettes ? task.etiquettes.join(', ') : '';

        currentEditingTaskId = task._id;  // Track the task being edited
    }

    // 🟢 Delete task
    async function deleteTask(taskId) {
        const res = await fetch(`/tasks/${taskId}`, { method: "DELETE" });

        if (res.ok) {
            fetchTasks();  // Refresh task list
        } else {
            console.error("Failed to delete task");
        }
    }

    fetchTasks(); // Initial fetch
});
