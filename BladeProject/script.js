// script.js
const taskGroupsData = {
    taskGroups: [
        {
            name: "Cortes",
            totalTimeSpent: 0,
            startTime: null,
            endTime: null,
            tasks: [
                { id: 1, name: "Corte LE", duration: 0, pauseTime: 0, maxDuration: 10, isRunning: false, isPaused: false, pauseStartTime: null, startTime: null, endTime: null, isPauseCounting: false },
                { id: 2, name: "Corte TE", duration: 0, pauseTime: 0, maxDuration: 15, isRunning: false, isPaused: false, pauseStartTime: null, startTime: null, endTime: null, isPauseCounting: false },
                { id: 3, name: "Corte de régua", duration: 0, pauseTime: 0, maxDuration: 20, isRunning: false, isPaused: false, pauseStartTime: null, startTime: null, endTime: null, isPauseCounting: false }
            ]
        },
        {
            name: "Limpeza",
            totalTimeSpent: 0,
            startTime: null,
            endTime: null,
            tasks: [
                { id: 1, name: "Limpeza de sala", duration: 0, pauseTime: 0, maxDuration: 30, isRunning: false, isPaused: false, pauseStartTime: null, startTime: null, endTime: null, isPauseCounting: false },
                { id: 2, name: "Limpeza de banheiro", duration: 0, pauseTime: 0, maxDuration: 25, isRunning: false, isPaused: false, pauseStartTime: null, startTime: null, endTime: null, isPauseCounting: false }
            ]
        },
        {
            name: "Manutenção",
            totalTimeSpent: 0,
            startTime: null,
            endTime: null,
            tasks: [
                { id: 1, name: "Troca de lâmpada", duration: 0, pauseTime: 0, maxDuration: 15, isRunning: false, isPaused: false, pauseStartTime: null, startTime: null, endTime: null, isPauseCounting: false },
                { id: 2, name: "Verificação de encanamento", duration: 0, pauseTime: 0, maxDuration: 30, isRunning: false, isPaused: false, pauseStartTime: null, startTime: null, endTime: null, isPauseCounting: false }
            ]
        }
    ]
};

// Renderizar grupos de tarefas no HTML
const renderTaskGroups = () => {
    const container = document.getElementById("taskGroupsContainer");
    container.innerHTML = ""; // Limpar container antes de renderizar

    taskGroupsData.taskGroups.forEach(group => {
        const groupDiv = document.createElement("div");
        groupDiv.classList.add("task-group");

        // Calcular o tempo total se o grupo tiver tempo de início e de término
        if (group.startTime && group.endTime) {
            const totalTime = Math.floor((group.endTime - group.startTime) / 1000); // Total em segundos
            const totalMinutes = Math.floor(totalTime / 60);
            const totalSeconds = totalTime % 60;
            group.totalTimeSpent = totalTime; // Armazenar total em segundos
            groupDiv.innerHTML = `<h2>${group.name} - Tempo Total: ${totalMinutes} min ${totalSeconds} seg</h2>`;
        } else {
            groupDiv.innerHTML = `<h2>${group.name} - Tempo Total: 0 min 0 seg</h2>`;
        }

        group.tasks.forEach(task => {
            const taskDiv = document.createElement("div");
            taskDiv.classList.add("task");
            const minutes = Math.floor(task.duration / 60);
            const seconds = task.duration % 60;
            const pauseMinutes = Math.floor(task.pauseTime / 60);
            const pauseSeconds = task.pauseTime % 60;
            const startTimeFormatted = task.startTime ? task.startTime.toLocaleTimeString() : "N/A";
            const endTimeFormatted = task.endTime ? task.endTime.toLocaleTimeString() : "N/A";

            // Calcular a porcentagem do tempo gasto
            const totalDuration = task.maxDuration * 60; // Tempo máximo em segundos
            const workPercentage = totalDuration > 0 ? Math.min((task.duration / totalDuration) * 100, 100) : 0; // Percentual de trabalho
            const pausePercentage = totalDuration > 0 ? Math.min((task.pauseTime / totalDuration) * 100, 100) : 0; // Percentual de pausa

            taskDiv.innerHTML = `
                <p>${task.name} - Tempo Gasto: ${minutes} min ${seconds} seg (Pausa: ${pauseMinutes} min ${pauseSeconds} seg)</p>
                <p>Início: ${startTimeFormatted} | Fim: ${endTimeFormatted}</p>
                <div class="progress-bar">
                    <div class="progress work" style="width: ${workPercentage}%;"></div>
                    <div class="progress pause" style="width: ${pausePercentage}%;"></div>
                </div>
                <div class="task-buttons">
                    <button class="start ${task.isRunning ? 'disabled' : ''}" onclick="startTask('${group.name}', ${task.id})" ${task.isRunning ? 'disabled' : ''}>Iniciar</button>
                    <button class="pause ${!task.isRunning ? 'disabled' : ''}" onclick="pauseTask('${group.name}', ${task.id})" ${!task.isRunning ? 'disabled' : ''}>Pausar</button>
                    <button class="complete" onclick="completeTask('${group.name}', ${task.id})">Concluído</button>
                    <button class="remove" onclick="removeTask('${group.name}', ${task.id})">Remover</button>
                </div>
            `;
            groupDiv.appendChild(taskDiv);
        });

        container.appendChild(groupDiv);
    });
};

// Variável para controlar o intervalo
let intervals = {};
let pauseIntervals = {};

// Função para iniciar a tarefa
const startTask = (groupName, taskId) => {
    const group = taskGroupsData.taskGroups.find(g => g.name === groupName);
    const task = group.tasks.find(t => t.id === taskId);

    if (!task.isRunning) {
        task.isRunning = true;

        // Registrar o tempo de início da tarefa se ainda não tiver sido registrado
        if (!task.startTime) {
            task.startTime = new Date();
        }

        // Registrar o tempo de início do grupo, se ainda não tiver sido registrado
        if (!group.startTime) {
            group.startTime = new Date();
        }

        // Iniciar o contador de trabalho
        intervals[taskId] = setInterval(() => {
            task.duration += 1; // Incrementar a duração em segundos
            renderTaskGroups();
        }, 1000); // Atualiza a cada segundo

        // Se estava em pausa, para a contagem de pausa
        if (task.isPaused) {
            clearInterval(pauseIntervals[taskId]);
            task.isPaused = false;
        }

        renderTaskGroups();
    }
};

// Função para pausar a tarefa
const pauseTask = (groupName, taskId) => {
    const group = taskGroupsData.taskGroups.find(g => g.name === groupName);
    const task = group.tasks.find(t => t.id === taskId);

    if (task.isRunning) {
        clearInterval(intervals[taskId]); // Para o intervalo da tarefa
        task.isRunning = false; // Tarefa não está mais em andamento

        // Iniciar o contador de pausa
        task.isPaused = true;
        task.pauseStartTime = new Date();
        pauseIntervals[taskId] = setInterval(() => {
            task.pauseTime += 1; // Incrementar o tempo de pausa
            renderTaskGroups();
        }, 1000); // Atualiza a cada segundo

        renderTaskGroups();
    }
};

// Função para marcar tarefa como concluída
const completeTask = (groupName, taskId) => {
    const group = taskGroupsData.taskGroups.find(g => g.name === groupName);
    const task = group.tasks.find(t => t.id === taskId);
    task.isRunning = false; // Para a tarefa
    clearInterval(intervals[taskId]); // Para o intervalo

    if (task.isPaused) {
        clearInterval(pauseIntervals[taskId]); // Para o contador de pausa, se estiver pausado
    }

    // Registrar o tempo de término da tarefa
    if (!task.endTime) {
        task.endTime = new Date();
    }

    // Se todas as tarefas do grupo foram concluídas, registrar o tempo de término do grupo
    if (group.tasks.every(t => t.endTime !== null)) {
        group.endTime = new Date();
    }

    renderTaskGroups();
};

// Função para remover a tarefa
const removeTask = (groupName, taskId) => {
    const group = taskGroupsData.taskGroups.find(g => g.name === groupName);
    const taskIndex = group.tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
        group.tasks.splice(taskIndex, 1);
        renderTaskGroups();
    }
};

// Renderizar as tarefas na inicialização
renderTaskGroups();
