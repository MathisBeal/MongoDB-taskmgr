document.addEventListener("DOMContentLoaded", () => {
    const taskForm = document.getElementById("taskForm");
    const taskList = document.getElementById("taskList");

    // Fetch tasks from backend
    async function fetchTasks() {
        const res = await fetch("/tasks");
        const tasks = await res.json();
        taskList.innerHTML = ""; // Clear list before rendering
        tasks.forEach(task => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${task.titre}</strong> - ${task.statut} - ${task.priorite}
                <button class="delete" data-id="${task._id}">❌</button>
            `;
            taskList.appendChild(li);
        });
    }

    // Handle form submission (Add task)
    taskForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newTask = {
            titre: document.getElementById("titre").value,
            description: document.getElementById("description").value,
            echeance: document.getElementById("echeance").value,
            statut: document.getElementById("statut").value,
            priorite: document.getElementById("priorite").value,
            auteur: {
                nom: document.getElementById("auteurNom").value,
                prénom: document.getElementById("auteurPrenom").value,
                email: document.getElementById("auteurEmail").value
            },
            categorie: document.getElementById("categorie").value,
            etiquettes: document.getElementById("etiquettes").value.split(",").map(tag => tag.trim())
        };

        await fetch("/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTask)
        });

        taskForm.reset();
        fetchTasks(); // Refresh task list
    });

    // Handle task deletion
    taskList.addEventListener("click", async (e) => {
        if (e.target.classList.contains("delete")) {
            const taskId = e.target.dataset.id;
            await fetch(`/tasks/${taskId}`, { method: "DELETE" });
            fetchTasks();
        }
    });

    fetchTasks(); // Load tasks on page load
});
