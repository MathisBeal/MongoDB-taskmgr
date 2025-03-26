document.addEventListener("DOMContentLoaded", () => {
    const taskForm = document.getElementById("taskForm");
    const taskList = document.getElementById("taskList");
    const filterStatut = document.getElementById("filterStatut");
    const filterPriorite = document.getElementById("filterPriorite");
    const applyFiltersBtn = document.getElementById("applyFilters");

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
        taskList.appendChild(li);
    }

    fetchTasks(); // Initial fetch
});
