# LSI Correlativas - Plan de Estudios Interactivo 🎓

Una aplicación web progresiva y estática para gestionar, visualizar y planificar el cursado de la carrera **Licenciatura en Sistemas de Información (LSI)** de la **UNNE** (Universidad Nacional del Nordeste, Argentina).

Este proyecto permite a los estudiantes llevar un seguimiento interactivo de su progreso académico, verificando de forma automática las correlatividades (requisitos) tanto para cursar como para aprobar cada materia, dependiendo de si pertenecen al Plan Viejo (2009) o al Plan Nuevo (2023).

## ✨ Características Principales

*   **Dualidad de Planes:** Soporte nativo para el Plan Viejo (2009) y el Plan Nuevo (2023), con malla curricular, ubicaciones y correlatividades exactas para cada uno.
*   **Validación Activa de Correlativas:** El sistema bloquea visualmente las materias que aún no puedes cursar e impide que marques como "Aprobada" una materia si no cumples con las correlativas previas requeridas.
*   **Advertencias en Cascada:** Si desmarcas una materia y esto rompe los requisitos de otra materia que ya tenías marcada como Regular o Aprobada, el algoritmo de cascada te mostrará una advertencia detallada antes de deshacer automáticamente el progreso inválido.
*   **Guardado Local (Persistencia):** Todo el progreso es almacenado instantáneamente en el `localStorage` de tu navegador de manera independiente para cada plan. No necesitas crear cuentas ni bases de datos.
*   **Interfaz Moderna y Adaptable (Responsive):** Diseño limpio, *glassmórfico* e interactivo, preparado para usarse cómodamente como una App Móvil o desde una PC de escritorio.
*   **Modo Oscuro Integrado:** Tema oscuro elegante (Slate & Gold) de excelente legibilidad que cuida tu vista y puede alternarse con un solo botón, recordando también tu preferencia.
*   **Cálculo de Progreso Automático:** Barras animadas que calculan en tiempo real el porcentaje de finalización de la carrera (tanto para el título intermedio de Analista como para la Licenciatura).

## 🛠️ Tecnologías Empleadas

El proyecto es **100% Frontend** (Vanilla). No requiere de servidores, Node.js ni bases de datos.
*   **HTML5** semántico y estructurado.
*   **CSS3** puro utilizando variables (Custom Properties), Flexbox, CSS Grid y animaciones de `@media (hover: hover)`.
*   **JavaScript (ES6+)** orientado a objetos (Clases) para la lógica de los requisitos y manipulación del DOM.

## 📂 Organización del Proyecto

La estructura del código fue refactorizada y limpiada para ser altamente mantenible:

```text
/correlativas_lsi
│
├── index.html                   # Pantalla de Bienvenida (Elección de Plan)
├── plan_estudio_nuevo.html      # Rejilla interactiva del Plan 2023
├── plan_estudio_viejo.html      # Rejilla interactiva del Plan 2009
│
├── css/
│   ├── reset.css                # Normalización estándar de estilos del navegador
│   └── styles.css               # Diseño global, Modo Oscuro y Modales (UI/UX)
│
├── js/
│   ├── Subject.js               # Clase principal que maneja los estados, validaciones y renderizado de cada materia. Incluye el algoritmo de Cascada.
│   ├── load_subjects_pen.js     # Instancia todas las materias y requisitos del Plan Nuevo.
│   ├── load_subjects_pev.js     # Instancia todas las materias y requisitos del Plan Viejo.
│   ├── onload.js                # Controladores globales: Guardado Local, Progreso y Modal de Confirmaciones.
│   └── theme.js                 # Lógica para alternar y guardar el Modo Claro/Oscuro.
│
└── img/                         # Recursos gráficos, logotipos e iconos.
```
---
*Desarrollado y optimizado con pasión para los alumnos de la UNNE.*
