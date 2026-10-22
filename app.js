/**
 * Gestor Documental - Motor de Procesos basado en Autómatas Finitos Deterministas (AFD)
 * Implementación de la tupla formal M = (Q, Sigma, delta, q0, F)
 */

// ==========================================
// 1. DEFINICIÓN FORMAL DEL AUTÓMATA (AFD)
// ==========================================

/**
 * Conjunto finito de estados Q
 */
const Q = Object.freeze([
  'recibido',
  'en_revision',
  'aprobado',
  'rechazado',
  'archivado'
]);

/**
 * Alfabeto de entrada Sigma (acciones del sistema)
 */
const SIGMA = Object.freeze([
  'enviar_a_revison',
  'aprobar',
  'rechazar',
  'archivar'
]);

/**
 * Estado inicial q0
 */
const q0 = 'recibido';

/**
 * Conjunto de estados finales de aceptación F
 */
const F = Object.freeze(['archivado']);

/**
 * Función de transición delta: Q x Sigma -> Q
 * Representada como tabla de transiciones / diccionario de adyacencia
 */
const DELTA = Object.freeze({
  recibido: {
    enviar_a_revison: 'en_revision'
  },
  en_revision: {
    aprobar: 'aprobado',
    rechazar: 'rechazado'
  },
  aprobado: {
    archivar: 'archivado'
  },
  rechazado: {}, // Estado sin transiciones salientes
  archivado: {}  // Estado de aceptación (sin transiciones salientes)
});

/**
 * Descripciones corporativas y metadatos asociados a cada estado
 */
const STATE_METADATA = {
  recibido: {
    label: 'recibido (q0)',
    description: 'El documento ha ingresado a la bandeja corporativa y espera ser asignado para su correspondiente revisión técnica.',
    accentColor: '#38bdf8'
  },
  en_revision: {
    label: 'en_revision (q1)',
    description: 'El documento está bajo evaluación técnica y legal por parte del comité auditor. Acciones posibles: aprobar o rechazar.',
    accentColor: '#fbbf24'
  },
  aprobado: {
    label: 'aprobado (q2)',
    description: 'El documento ha cumplido satisfactoriamente todos los criterios de revisión. Está listo para ser archivado en el repositorio central.',
    accentColor: '#34d399'
  },
  rechazado: {
    label: 'rechazado (q3)',
    description: 'El documento no cumple con las normativas corporativas requeridas y ha sido rechazado. El flujo del proceso concluye aquí.',
    accentColor: '#f43f5e'
  },
  archivado: {
    label: 'archivado (q4 - Final)',
    description: 'El documento ha sido resguardado exitosamente en el archivo histórico corporativo. Se ha alcanzado el estado final de aceptación (F).',
    accentColor: '#a855f7'
  }
};

// ==========================================
// 2. CLASE CONTROLADORA DEL AUTÓMATA
// ==========================================

class DocumentAutomaton {
  constructor() {
    this.currentState = q0;
    this.history = [];
    this.stepCounter = 0;
  }

  /**
   * Valida si una acción de entrada es permitida desde el estado actual
   * @param {string} action - Símbolo de entrada sigma
   * @returns {boolean}
   */
  canExecute(action) {
    if (!SIGMA.includes(action)) return false;
    const transitionsFromCurrent = DELTA[this.currentState];
    return transitionsFromCurrent && action in transitionsFromCurrent;
  }

  /**
   * Obtiene el siguiente estado según delta(currentState, action)
   * @param {string} action 
   * @returns {string|null}
   */
  getNextState(action) {
    if (!this.canExecute(action)) return null;
    return DELTA[this.currentState][action];
  }

  /**
   * Ejecuta la transición de estado según la regla delta
   * @param {string} action
   * @returns {object|null} Detalles de la transición efectuada
   */
  executeTransition(action) {
    if (!this.canExecute(action)) {
      console.warn(`[AFD] Transición inválida intentada: delta(${this.currentState}, ${action}) no está definida.`);
      return null;
    }

    const fromState = this.currentState;
    const toState = DELTA[fromState][action];
    this.stepCounter++;

    const transitionRecord = {
      step: this.stepCounter,
      fromState,
      action,
      toState,
      timestamp: new Date().toLocaleTimeString(),
      isAccepting: F.includes(toState)
    };

    this.currentState = toState;
    this.history.push(transitionRecord);

    return transitionRecord;
  }

  /**
   * Reinicia el autómata a su estado inicial q0
   */
  reset() {
    this.currentState = q0;
    this.history = [];
    this.stepCounter = 0;
  }

  /**
   * Verifica si el autómata está actualmente en un estado de aceptación
   * @returns {boolean}
   */
  isInAcceptingState() {
    return F.includes(this.currentState);
  }
}

// ==========================================
// 3. CONTROLADOR DE LA INTERFAZ DE USUARIO (UI)
// ==========================================

class UIController {
  constructor(automaton) {
    this.automaton = automaton;
    this.initDOMElements();
    this.bindEvents();
    this.render();
  }

  initDOMElements() {
    // Badges y textos
    this.statusBadge = document.getElementById('status-badge');
    this.statusText = document.getElementById('status-text');
    this.statusExplanation = document.getElementById('status-explanation');
    this.statusDescBox = document.getElementById('status-description-box');

    // Botones de acción
    this.actionButtons = {
      enviar_a_revison: document.getElementById('btn-enviar_a_revison'),
      aprobar: document.getElementById('btn-aprobar'),
      rechazar: document.getElementById('btn-rechazar'),
      archivar: document.getElementById('btn-archivar')
    };

    // Botón de reinicio
    this.btnReset = document.getElementById('btn-reset');

    // Tabla de auditoría
    this.logTbody = document.getElementById('log-tbody');
    this.logCount = document.getElementById('log-count');

    // Nodos del SVG
    this.svgNodes = {
      recibido: document.getElementById('node-recibido'),
      en_revision: document.getElementById('node-en_revision'),
      aprobado: document.getElementById('node-aprobado'),
      rechazado: document.getElementById('node-rechazado'),
      archivado: document.getElementById('node-archivado')
    };

    // Aristas del SVG (transiciones)
    this.svgEdges = {
      enviar_a_revison: document.getElementById('edge-enviar_a_revison'),
      aprobar: document.getElementById('edge-aprobar'),
      rechazar: document.getElementById('edge-rechazar'),
      archivar: document.getElementById('edge-archivar')
    };
  }

  bindEvents() {
    // Asignar escuchadores de eventos para cada acción de Sigma
    Object.keys(this.actionButtons).forEach(action => {
      const button = this.actionButtons[action];
      if (button) {
        button.addEventListener('click', () => this.handleActionClick(action));
      }
    });

    // Reinicio
    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => this.handleReset());
    }
  }

  handleActionClick(action) {
    const transition = this.automaton.executeTransition(action);
    if (transition) {
      this.animateTransitionEdge(action);
      this.render();
      this.appendLogRow(transition);
    }
  }

  handleReset() {
    this.automaton.reset();
    this.render();
    this.resetLogTable();
  }

  /**
   * Efecto visual en la arista de transición activa en el SVG
   */
  animateTransitionEdge(action) {
    const edge = this.svgEdges[action];
    if (edge) {
      edge.classList.add('active-transition');
      setTimeout(() => {
        edge.classList.remove('active-transition');
      }, 1000);
    }
  }

  /**
   * Actualiza todos los componentes visuales de la vista según el estado actual
   */
  render() {
    const current = this.automaton.currentState;
    const meta = STATE_METADATA[current];

    // 1. Actualizar Badge y textos del documento
    this.statusText.textContent = current;
    this.statusBadge.className = `status-badge status-${current}`;
    this.statusExplanation.textContent = meta.description;
    this.statusDescBox.style.borderLeftColor = meta.accentColor;

    // 2. Actualizar estado habilitado/deshabilitado de los botones según la función delta
    Object.keys(this.actionButtons).forEach(action => {
      const btn = this.actionButtons[action];
      const isValid = this.automaton.canExecute(action);
      btn.disabled = !isValid;
    });

    // 3. Actualizar nodos del diagrama SVG
    Object.keys(this.svgNodes).forEach(stateKey => {
      const node = this.svgNodes[stateKey];
      if (node) {
        node.classList.remove('active', 'state-recibido', 'state-en_revision', 'state-aprobado', 'state-rechazado', 'state-archivado');
        if (stateKey === current) {
          node.classList.add('active', `state-${current}`);
        }
      }
    });

    // 4. Actualizar contador de log
    const count = this.automaton.history.length;
    this.logCount.textContent = `${count} ${count === 1 ? 'transición' : 'transiciones'}`;
  }

  /**
   * Agrega un nuevo registro formal a la tabla de auditoría
   */
  appendLogRow(transition) {
    // Si la tabla contenía el mensaje vacío, limpiarlo
    const emptyRow = this.logTbody.querySelector('.log-empty');
    if (emptyRow) {
      this.logTbody.innerHTML = '';
    }

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><span class="log-step-badge">#${transition.step}</span></td>
      <td><code>${transition.fromState}</code></td>
      <td><code>${transition.action}</code></td>
      <td><code class="log-formula">&delta;(${transition.fromState}, ${transition.action}) &rarr; ${transition.toState}</code></td>
      <td><code>${transition.toState}</code> ${transition.isAccepting ? '⭐ (Final)' : ''}</td>
      <td><span style="color: var(--text-muted); font-size: 0.8rem;">${transition.timestamp}</span></td>
    `;

    // Insertar al inicio de la tabla
    this.logTbody.insertBefore(row, this.logTbody.firstChild);
  }

  /**
   * Limpia o restaura el estado inicial de la tabla de auditoría
   */
  resetLogTable() {
    this.logTbody.innerHTML = `
      <tr>
        <td colspan="6" class="log-empty">No hay transiciones registradas. El autómata se encuentra en el estado inicial q0 (recibido).</td>
      </tr>
    `;
    this.logCount.textContent = '0 transiciones';
  }
}

// ==========================================
// 4. INICIALIZACIÓN DE LA APLICACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  const automaton = new DocumentAutomaton();
  const ui = new UIController(automaton);
  ui.resetLogTable();

  console.log('%c[AFD Gestor Documental] Inicializado correctamente.', 'color: #38bdf8; font-weight: bold;');
  console.log('Tupla formal cargada: M = (Q, Sigma, delta, q0, F)');
  console.log('Estados Q:', Q);
  console.log('Alfabeto Sigma:', SIGMA);
  console.log('Estado inicial q0:', q0);
  console.log('Estados finales F:', F);
});
