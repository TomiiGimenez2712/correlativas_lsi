/**
 * js/onload.js 
 * Contiene funciones de inicialización global, persistencia de datos (localStorage),
 * cálculo algorítmico del progreso de la carrera y el sistema de modales custom.
 */

/**
 * Calcula dinámicamente y renderiza el porcentaje de avance de la carrera.
 * Separa los cálculos intermedios: Analista (hasta 3er año) y Licenciado (totalidad del plan).
 */
function updateProgress() {
    // Seleccionar elementos de la barra de Analista
    const analistaProgressBar = document.getElementById('analista_progress_bar');
    const analistaProgressText = document.getElementById('analista_progress_text');

    // Seleccionar elementos de la barra de Licenciado
    const licenciadoProgressBar = document.getElementById('main_progress_bar');
    const licenciadoProgressText = document.getElementById('main_progress_text');

    // Salir si las materias no se han cargado aún
    if (!window.subjects || subjects.length === 0) return;

    // --- 1. Cálculo para Analista (hasta 3er año) ---
    const analistaSubjects = subjects.filter(s => s.getUbication()[0] <= 3 && !s.getNombre().includes('extracurricular'));
    let analistaTotalProgress = 0;
    analistaSubjects.forEach(subject => {
        analistaTotalProgress += subject.getStatus();
    });
    
    const analistaMaxProgress = analistaSubjects.length * 2;
    const analistaPercentage = analistaMaxProgress > 0 ? (analistaTotalProgress * 100 / analistaMaxProgress) : 0;
    
    if(analistaProgressBar && analistaProgressText) {
        analistaProgressBar.style.width = analistaPercentage + '%';
        analistaProgressText.innerText = analistaPercentage.toFixed(1) + ' %';
    }

    // --- 2. Cálculo para Licenciado (todas las materias) ---
    const licenciadoSubjects = subjects.filter(s => !s.getNombre().includes('extracurricular'));
    let licenciadoTotalProgress = 0;
    licenciadoSubjects.forEach(subject => {
        licenciadoTotalProgress += subject.getStatus();
    });

    const licenciadoMaxProgress = licenciadoSubjects.length * 2;
    const licenciadoPercentage = licenciadoMaxProgress > 0 ? (licenciadoTotalProgress * 100 / licenciadoMaxProgress) : 0;
    
    if(licenciadoProgressBar && licenciadoProgressText) {
        licenciadoProgressBar.style.width = licenciadoPercentage + '%';
        licenciadoProgressText.innerText = licenciadoPercentage.toFixed(1) + ' %';
    }
}

const PLAN_KEY = window.location.pathname.includes('nuevo') ? 'progress_nuevo_lsi' : 'progress_viejo_lsi';

/**
 * Serializa el estado lógico actual de todas las materias (`subjects`) 
 * y lo resguarda de manera persistente en el `localStorage` del navegador web.
 * El guardado previene mezclas separando la "llave" si es Plan Nuevo o Plan Viejo.
 */
function saveProgress() {
    const progress = {};
    if (typeof subjects !== 'undefined') {
        subjects.forEach(s => progress[s.getId()] = s.getStatus());
        localStorage.setItem(PLAN_KEY, JSON.stringify(progress));
    }
}

/**
 * Rehidrata el estado de avance actual leyendo desde el `localStorage` (según el plan).
 * Parsea el JSON persistido e inyecta uno a uno los estados históricos directo en memoria.
 */
function loadProgress() {
    const saved = localStorage.getItem(PLAN_KEY);
    if (saved) {
        try {
            const progress = JSON.parse(saved);
            if (typeof subjects !== 'undefined') {
                subjects.forEach(s => {
                    if (progress[s.getId()] !== undefined) {
                        s.setStatus(progress[s.getId()]);
                    }
                });
            }
        } catch(e) {
            console.error("Error al leer el progreso", e);
        }
    }
}

/**
 * Despliega un recuadro modal personalizado y accesible que reemplaza 
 * funcional y estéticamente las alertas nativas bloqueantes `window.confirm()` o `alert()`.
 * Intercepta hilos de ejecución peligrosos (ej: Cascada de desmarcado) a la espera de aceptación del usuario.
 * 
 * @param {string} title - Título del encabezado (Header) de la advertencia.
 * @param {string} message - Subtítulo principal descriptivo.
 * @param {string} htmlContent - DOM inyectable explícito (Usado para renderizar la lista de materias en cascada).
 * @param {Function} onConfirm - Callback inyectado asíncrono que el modal disparará si se escoge "Aceptar".
 */
function showCustomConfirm(title, message, htmlContent, onConfirm) {
    let overlay = document.getElementById('custom-confirm-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'custom-confirm-overlay';
        overlay.className = 'modal-overlay hidden';
        overlay.innerHTML = `
            <div class="modal-content" style="max-width: 450px; text-align: center; border-left: 4px solid #e53e3e;">
                <h3 id="confirm-title" style="font-size: 1.4rem; font-weight: bold; margin-top: 0; margin-bottom: 10px; color: var(--text-color);"></h3>
                <p id="confirm-message" style="margin-bottom: 1rem; color: var(--text-color);"></p>
                <div id="confirm-html" style="margin-bottom: 1.5rem; text-align: left; max-height: 200px; overflow-y: auto;"></div>
                <div style="display: flex; gap: 1rem; justify-content: center;" class="modal-status-buttons">
                    <button id="confirm-cancel-btn" style="border-color: #a0aec0; color: #718096; background: transparent;">Cancelar</button>
                    <button id="confirm-ok-btn" style="background-color: #e53e3e; border-color: #e53e3e; color: white;">Aceptar</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    document.getElementById('confirm-title').innerText = title;
    document.getElementById('confirm-message').innerText = message;
    document.getElementById('confirm-html').innerHTML = htmlContent || '';
    
    overlay.classList.remove('hidden');
    
    const cancelBtn = document.getElementById('confirm-cancel-btn');
    const okBtn = document.getElementById('confirm-ok-btn');
    
    const newCancel = cancelBtn.cloneNode(true);
    const newOk = okBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
    okBtn.parentNode.replaceChild(newOk, okBtn);
    
    newCancel.onclick = () => { overlay.classList.add('hidden'); };
    newOk.onclick = () => { 
        overlay.classList.add('hidden'); 
        if(onConfirm) onConfirm(); 
    };
}

/**
 * Función global gatillada por el botón 'Limpiar selección'.
 * Pide confirmación crítica a través del modal y blanquea el `localStorage` y la memoria RAM,
 * reseteando de forma dura tanto los menús visuales como los cálculos.
 */
function limpiarSeleccion() {
    showCustomConfirm(
        "Limpiar Selección",
        "¿Estás seguro de que deseas limpiar la selección de este plan? Se borrará todo tu progreso local marcado.",
        "",
        () => {
            if (typeof subjects !== 'undefined') {
                subjects.forEach(subject => {
                    if (subject.getStatus() !== 0) {
                        subject.update(0, true);
                    }
                });
                subjects.forEach(s => s.updateVisualState());
            }
            updateProgress();
            saveProgress();
            closeModal();
        }
    );
}

/**
 * Abate / oculta rápidamente tanto la vista flotante interactiva de las Materias 
 * como cualquier confirmación custom abierta visible en la capa superior (z-index).
 */
function closeModal() {
    const modal = document.getElementById('subject-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    const highlighted = document.querySelector('.subject_highlight');
    if (highlighted) {
        highlighted.classList.remove('subject_highlight');
    }
}

// --- Eventos y Carga Inicial ---

// Event listener para cerrar el modal al hacer clic fuera de él
document.addEventListener('click', function(event) {
    const modal = document.getElementById('subject-modal');
    if (event.target === modal) {
        closeModal();
    }
});

// Llamada inicial para establecer el progreso en 0% al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Asegurarse de que las materias estén cargadas antes de calcular el progreso
    if (typeof load_subjects === 'function') {
        load_subjects();
    }
    // Cargar progreso desde localStorage
    loadProgress();
    
    // Aplicar estado visual si hay datos cargados
    if (typeof subjects !== 'undefined') {
        subjects.forEach(s => s.updateVisualState());
    }
    
    updateProgress();
});