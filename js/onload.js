// js/onload.js 

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
    const analistaSubjects = subjects.filter(s => s.getUbication()[0] <= 3 && !(s instanceof Extracurricular));
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
    const licenciadoSubjects = subjects.filter(s => !(s instanceof Extracurricular));
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

function limpiarSeleccion() {
    if (confirm("¿Estás seguro de que deseas limpiar la selección? Se borrará todo tu progreso.")) {
        subjects.forEach(subject => {
            if (subject.getStatus() !== 0) {
                subject.update(0);
            }
        });
        // La función updateProgress() es llamada dentro de subject.update(), 
        // por lo que no es necesario llamarla de nuevo aquí.
    }
}

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
    updateProgress();
});