class Subject {
    constructor(id, nombre, ubication, conditions_01, conditions_02, status) {
        this._id = id;
        this._nombre = nombre;
        this._ubication = ubication;
        this._conditions_01 = conditions_01; // Requisitos para cursar
        this._conditions_02 = conditions_02; // Requisitos para aprobar
        this._status = status; // 0: Sin cursar, 1: Regular, 2: Aprobada
    }

    // --- Getters y Setters (sin cambios) ---
    getId() { return this._id; }
    getNombre() { return this._nombre; }
    getUbication() { return this._ubication; }
    getConditions_01() { return this._conditions_01; }
    getConditions_02() { return this._conditions_02; }
    getStatus() { return this._status; }
    setStatus(status) { this._status = status; }

    // --- Lógica de Correlatividades (sin cambios) ---
    puede_cursar() {
        if (!this._conditions_01 || this._conditions_01 === 0) return true;
        return this._conditions_01.every(cond => {
            const reqSubject = subjects.find(s => s.getId() === cond[0]);
            return reqSubject && reqSubject.getStatus() >= cond[1];
        });
    }

    puede_aprobar() {
        if (!this._conditions_02 || this._conditions_02 === 0) return true;
        return this._conditions_02.every(reqId => {
            const reqSubject = subjects.find(s => s.getId() === reqId);
            return reqSubject && reqSubject.getStatus() === 2;
        });
    }

    // --- Lógica de Renderizado (Reescrita) ---
    create() {
        const mainContainer = document.getElementById('main-content');
        
        // Crear contenedor del año si no existe
        let yearContainer = document.getElementById(`year-${this._ubication[0]}`);
        if (!yearContainer) {
            yearContainer = document.createElement('div');
            yearContainer.className = 'year-container';
            yearContainer.id = `year-${this._ubication[0]}`;
            yearContainer.innerHTML = `<h2 class="year-title">Año ${this._ubication[0]}</h2>`;
            mainContainer.appendChild(yearContainer);
        }

        // Crear contenedor del cuatrimestre si no existe
        let semesterContainer = document.getElementById(`semester-${this._ubication[0]}-${this._ubication[1]}`);
        if (!semesterContainer) {
            semesterContainer = document.createElement('div');
            semesterContainer.className = 'semester-container';
            semesterContainer.id = `semester-${this._ubication[0]}-${this._ubication[1]}`;
            const semesterTitle = this._ubication[1] === 1 ? "1º Cuatrimestre" : "2º Cuatrimestre";
            semesterContainer.innerHTML = `<h3 class="semester-title">${semesterTitle}</h3><div class="subjects-grid" id="grid-${this._ubication[0]}-${this._ubication[1]}"></div>`;
            yearContainer.appendChild(semesterContainer);
        }

        const grid = document.getElementById(`grid-${this._ubication[0]}-${this._ubication[1]}`);
        const subjectDiv = document.createElement('div');
        subjectDiv.id = `subject-${this._id}`;
        subjectDiv.className = 'subject-container';
        subjectDiv.innerText = this._nombre;
        subjectDiv.onclick = () => this.viewDetails();

        grid.appendChild(subjectDiv);
        this.updateVisualState(); // Aplicar estado visual inicial
    }

    updateVisualState() {
        const subjectDiv = document.getElementById(`subject-${this._id}`);
        if (!subjectDiv) return;

        // Reset classes
        subjectDiv.classList.remove('status_0', 'status_1', 'status_2', 'status_available');

        if (this._status === 2) {
            subjectDiv.classList.add('status_2'); // Aprobada
        } else if (this._status === 1) {
            subjectDiv.classList.add('status_1'); // Regular
        } else {
            if (this.puede_cursar()) {
                subjectDiv.classList.add('status_available'); // Disponible para cursar
            } else {
                subjectDiv.classList.add('status_0'); // Bloqueada
            }
        }
    }

   update(newStatus) {
        this._status = newStatus;
        this.updateVisualState();

        // Actualizar visualmente todas las demás materias que puedan haber cambiado de estado
        subjects.forEach(s => s.updateVisualState());
        
        // Actualizar la barra de progreso
        updateProgress();

        // Cerrar el modal si se estaba mostrando
        closeModal(); 
    }

    viewDetails() {
        const subjectDiv = document.getElementById(`subject-${this._id}`);

        // Resaltar materia seleccionada
        const currentlyHighlighted = document.querySelector('.subject_highlight');
        if (currentlyHighlighted) {
            currentlyHighlighted.classList.remove('subject_highlight');
        }
        subjectDiv.classList.add('subject_highlight');
        
        const modal = document.getElementById('subject-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        modalTitle.innerText = this._nombre;
        
        let bodyHtml = '';

        if (!this.puede_cursar()) {
            bodyHtml += `<p>Requisitos para Cursar:</p>`;
            bodyHtml += this.getPrerequisitesHtml(this._conditions_01, true);
        } else {
            bodyHtml += `
                <div class="modal-status-buttons">
                    <button onclick="subject_${this._id}.update(0)" ${this._status === 0 ? 'disabled' : ''}>Sin Cursar</button>
                    <button onclick="subject_${this._id}.update(1)" ${this._status === 1 || !this.puede_cursar() ? 'disabled' : ''}>Regular</button>
                    <button onclick="subject_${this._id}.update(2)" ${this._status === 2 || !this.puede_aprobar() ? 'disabled' : ''}>Aprobada</button>
                </div>
            `;

            if (this._conditions_02 && this._conditions_02.length > 0) {
                 bodyHtml += `<p>Requisitos para Aprobar:</p>`;
                 bodyHtml += this.getPrerequisitesHtml(this._conditions_02, false);
            }
        }
        
        modalBody.innerHTML = bodyHtml;
        modal.classList.remove('hidden');
    }

    getPrerequisitesHtml(conditions, isForCursar) {
        if (!conditions || conditions.length === 0) return '';

        let listHtml = '<div class="prerequisites-list">';
        conditions.forEach(cond => {
            const reqId = isForCursar ? cond[0] : cond;
            const reqStatus = isForCursar ? cond[1] : 2;
            const reqSubject = subjects.find(s => s.getId() === reqId);

            if(reqSubject) {
                const isMet = reqSubject.getStatus() >= reqStatus;
                const statusText = reqStatus === 1 ? 'Regular' : 'Aprobada';
                listHtml += `
                    <button class="req-${isMet ? 'met' : 'not-met'}" disabled>
                        <span>${reqSubject.getNombre()}</span>
                        <span>${statusText}</span>
                    </button>
                `;
            }
        });
        listHtml += '</div>';
        return listHtml;
    }
}