# Gestor Documental Corporativo - Administrador de Procesos (AFD)

Prototipo interactivo desarrollado con **HTML5, CSS3 y JavaScript** que modela y controla el ciclo de vida y flujo de procesamiento de documentos corporativos utilizando la teoría de **Autómatas Finitos Deterministas (AFD)**.

---

## 📐 Definición Formal del Autómata

El autómata determinista formal está definido por la 5-tupla:

$$M = (Q, \Sigma, \delta, q_0, F)$$

### 1. Conjunto de Estados ($Q$)
$$Q = \{ \text{recibido}, \text{en\_revision}, \text{aprobado}, \text{rechazado}, \text{archivado} \}$$

* **$q_0$ (recibido)**: Estado inicial donde el documento ingresa al sistema.
* **$q_1$ (en_revision)**: Estado intermedio de evaluación y dictamen.
* **$q_2$ (aprobado)**: Documento validado satisfactoriamente.
* **$q_3$ (rechazado)**: Documento desestimado por incumplimiento de requisitos (estado terminal no aceptador).
* **$q_4$ (archivado)**: Documento resguardado de forma definitiva (estado de aceptación).

### 2. Alfabeto de Entrada ($\Sigma$)
Eventos o acciones que desencadenan las transiciones:
$$\Sigma = \{ \text{enviar\_a\_revison}, \text{aprobar}, \text{rechazar}, \text{archivar} \}$$

### 3. Estado Inicial ($q_0$)
$$q_0 = \text{recibido}$$

### 4. Conjunto de Estados Finales o de Aceptación ($F$)
$$F = \{ \text{archivado} \}$$

### 5. Función de Transición ($\delta: Q \times \Sigma \to Q$)

| Estado Actual ($q$) | Símbolo / Acción ($\sigma$) | Estado Siguiente ($q' = \delta(q, \sigma)$) |
| :------------------ | :-------------------------- | :------------------------------------------ |
| `recibido`          | `enviar_a_revison`          | `en_revision`                               |
| `en_revision`       | `aprobar`                   | `aprobado`                                  |
| `en_revision`       | `rechazar`                  | `rechazado`                                 |
| `aprobado`          | `archivar`                  | `archivado`                                 |

*Cualquier otra combinación no definida en la tabla es bloqueada y deshabilitada en la interfaz.*

---

## 🚀 Características Implementadas

1. **Cumplimiento estricto de las 4 fases** del plan (`PlanGestionDocumental.md`).
2. **Diagrama de Estados SVG Interactivo:**
   - Visualiza los 5 estados con notación matemática ($q_0, q_1, q_2, q_3, q_4$).
   - Diferenciación visual de nodo inicial y doble círculo para el estado de aceptación $F$.
   - Iluminación reactiva en tiempo real del estado activo y animación sobre la arista recorrida.
3. **Control Reactivo de Acciones:**
   - Botones del alfabeto $\Sigma$ que se habilitan o deshabilitan dinámicamente según la función $\delta$.
4. **Bitácora de Auditoría Formal:**
   - Registro cronológico que despliega cada paso en notación matemática: $\delta(q_t, \sigma) \to q_{t+1}$.
5. **Botón de Reinicio:**
   - Permite reiniciar el flujo a $q_0$ para evaluar los diferentes caminos de ejecución (por ejemplo, comparar la rama de rechazo vs. la rama de archivado).

---

## 💻 ¿Cómo ejecutar el proyecto?

1. Al ser una aplicación puramente web de cliente (Vanilla JS, HTML5 y CSS3), no requiere instalación de dependencias ni servidores externos.
2. Abre directamente el archivo `index.html` con tu navegador preferido:
   ```bash
   xdg-open index.html
   # o
   google-chrome index.html
   # o simplemente doble clic sobre el archivo en tu explorador de archivos
   ```
