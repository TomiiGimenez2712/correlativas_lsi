/**
 * Clase que representa una materia dentro de un plan de estudio.
 * Maneja la lógica de correlatividades, manipulación de estados y renderizado en el DOM.
 */
class Subject {
    /**
     * Instancia una nueva materia.
     * @param {number} id - Identificador único numérico de la materia.
     * @param {string} nombre - Nombre descriptivo completo de la materia.
     * @param {number[]} ubication - Arreglo de dos dimensiones `[año, cuatrimestre]`.
     * @param {Array<number[]>|number} conditions_01 - Condición para CURSAR. Una lista de tuplas `[id_materia, estado_requerido]`, o `0` si no pide correlativas.
     * @param {number[]|number} conditions_02 - Condición para APROBAR. Una lista de `ids` que deben estar en estado 2 (Aprobadas), o `0` si no pide correlativas finales.
     * @param {number} status - Estado de la materia: `0` (Sin cursar), `1` (Regular), `2` (Aprobada).
     */
    constructor(id, nombre, ubication, conditions_01, conditions_02, status) {
        this._id = id;
        this._nombre = nombre;
        this._ubication = ubication;
        this._conditions_01 = conditions_01;
        this._conditions_02 = conditions_02;
        this._status = status;
    }

    // --- Getters y Setters (sin cambios) ---
    getId() { return this._id; }
    getNombre() { return this._nombre; }
    getUbication() { return this._ubication; }
    getConditions_01() { return this._conditions_01; }
    getConditions_02() { return this._conditions_02; }
    getStatus() { return this._status; }
    setStatus(status) { this._status = status; }

    // --- Lógica de Correlatividades ---

    /**
     * Verifica iterativamente si la materia actual tiene satisfechas todas las dependencias
     * previas necesarias para poder ser cursada.
     * @returns {boolean} `true` si es apta para cursado, `false` en caso de faltar requisitos.
     */
    puede_cursar() {
        if (!this._conditions_01 || this._conditions_01 === 0) return true;
        return this._conditions_01.every(cond => {
            const reqSubject = subjects.find(s => s.getId() === cond[0]);
            return reqSubject && reqSubject.getStatus() >= cond[1];
        });
    }

    /**
     * Verifica iterativamente si la materia actual tiene satisfechas todas las dependencias
     * previas necesarias para poder presentarse a examen final (Aprobar).
     * @returns {boolean} `true` si es apta para ser aprobada, `false` en caso de faltar finales previos.
     */
    puede_aprobar() {
        if (!this._conditions_02 || this._conditions_02 === 0) return true;
        return this._conditions_02.every(reqId => {
            const reqSubject = subjects.find(s => s.getId() === reqId);
            return reqSubject && reqSubject.getStatus() === 2;
        });
    }

    // --- Lógica de Renderizado Dinámico ---

    /**
     * Crea un elemento HTML que representa la materia y lo inserta de manera ordenada 
     * en el DOM. Generará columnas de semestres y años si estos aún no existen en la vista.
     */
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

    /**
     * Analiza el estado lógico (`this._status`) actual y aplica las clases CSS correspondientes
     * a la caja en el documento HTML para representar visualmente si está bloqueada, regular o aprobada.
     */
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

    /**
     * Asigna un nuevo estado a la materia actual y dispara una actualización visual en cadena,
     * junto con la validación del sistema de cascadas para preservar la integridad de datos.
     * @param {number} newStatus - Nuevo estatus asignado (0, 1 o 2).
     * @param {boolean} [skipCascadeAndSave=false] - `true` para omitir chequeos de cascada durante borrados masivos.
     */
   update(newStatus, skipCascadeAndSave = false) {
        if (!skipCascadeAndSave) {
            const downgrades = getCascadeDowngrades(this._id, newStatus);
            if (downgrades.length > 0) {
                let listHtml = '<ul style="list-style: none; padding: 0; margin: 0; font-size: 0.95rem;">';
                downgrades.forEach(d => {
                    const statusName = d.newStatus === 0 ? 'Sin cursar' : 'Regular';
                    listHtml += `<li style="padding: 6px 0; border-bottom: 1px solid var(--border-color);"><strong style="color:var(--accent-color);">${d.subject.getNombre()}</strong> 👉 Pasará a: <em>${statusName}</em></li>`;
                });
                listHtml += '</ul>';
                
                showCustomConfirm(
                    "Advertencia en Cascada",
                    "Cambiar el estado de esta materia afectará a las siguientes materias que dependen de ella:",
                    listHtml,
                    () => {
                        this._status = newStatus;
                        downgrades.forEach(d => {
                            d.subject.setStatus(d.newStatus);
                            d.subject.updateVisualState();
                        });
                        this.updateVisualState();
                        subjects.forEach(s => s.updateVisualState());
                        updateProgress();
                        if (typeof saveProgress === 'function') saveProgress();
                        closeModal(); 
                    }
                );
                return; // Detenemos la actualización hasta que el usuario confirme
            }
        }

        this._status = newStatus;
        this.updateVisualState();

        if (!skipCascadeAndSave) {
            // Actualizar visualmente todas las demás materias
            subjects.forEach(s => s.updateVisualState());
            updateProgress();
            if (typeof saveProgress === 'function') saveProgress();
            closeModal(); 
        }
    }

    /**
     * Crea e invoca la ventana flotante interactiva (Modal) donde el usuario puede visualizar
     * qué requisitos concretos necesita cumplir y qué botones de estado (Aprobado/Regular) puede accionar.
     */
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

/**
 * Motor predictivo que analiza el esquema de materias en modo cascada (Forward-checking).
 * Al simular un decremento de estatus, descubre todas las correlativas futuras que perderían
 * la capacidad de ser cursadas/aprobadas como daño colateral.
 * 
 * @param {number} targetId - ID de la materia objetivo desencadenante.
 * @param {number} newStatus - Estatus menor proyectado para la materia disparadora.
 * @returns {Object[]} Arreglo de mutaciones proyectadas (ej. `[{ subject, oldStatus, newStatus }]`).
 */
function getCascadeDowngrades(targetId, newStatus) {
    let currentStatuses = {};
    subjects.forEach(s => currentStatuses[s.getId()] = s.getStatus());
    currentStatuses[targetId] = newStatus;
    
    let downgrades = [];
    let changed;
    
    do {
        changed = false;
        subjects.forEach(s => {
            let id = s.getId();
            let status = currentStatuses[id];
            if (status > 0) {
                let canCourse = true;
                if (s.getConditions_01() !== 0) {
                    canCourse = s.getConditions_01().every(cond => currentStatuses[cond[0]] >= cond[1]);
                }
                
                let canApprove = true;
                if (s.getConditions_02() !== 0) {
                    canApprove = s.getConditions_02().every(reqId => currentStatuses[reqId] === 2);
                }
                
                let newS = status;
                if (!canCourse) newS = 0;
                else if (!canApprove && status === 2) newS = 1;
                
                if (newS !== status) {
                    currentStatuses[id] = newS;
                    downgrades.push({ subject: s, oldStatus: status, newStatus: newS });
                    changed = true;
                }
            }
        });
    } while (changed);
    
    return downgrades;
}