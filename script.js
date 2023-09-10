/** TODO:
 * Agregar nuevas unidades de medida
 * Agregar tooltip sobre de que se trata
 */
const WEIGHT_INPUT = document.getElementById('weight');
const KILOGRAM_UNIT = document.getElementById('kg');
const POUND_UNIT = document.getElementById('lb');
const RESULT_CONTAINER = document.getElementById('result');
const ERROR = document.getElementById('error');
const EXPLANATION_CONTAINER = document.getElementById('explanation')

const GENERIC_EXPLANATION = `
  <p>Si el peso es menor a 30 se calcula mediante la formula de Holliday-Segar.</p>
  <p>
    Si el peso es mayor a 30 se calcula la superficie corporal y se multiplica el el resultado por 1500 y por 2000, generando dos resultados.
  </p>
`
const HOLLIDAY_SEGAR_EXPLANATION = `
  <p>De 0kg a 10kg, se calcula 100cc por cada kilo.</p>
  <p>Se suman 50cc por cada kilo por arriba de 10kg, hasta los 20kg.</p>
  <p>De 20kg para arriba, se suman 20cc por cada kilo adicional.</p>
`
const BY_CS_METHOD_EXPLANATION = `
  <p>Se calcula la superficie corporal.</p>
  <p>Se multiplica la superficie corporal por 1500 y por 2000.</p>
`

WEIGHT_INPUT.addEventListener('input', calculate)
KILOGRAM_UNIT.addEventListener('change', calculate)
POUND_UNIT.addEventListener('change', calculate)
// se ejecuta apenas carga el documento
chargeGenericExplanation()

function chargeGenericExplanation() {
  EXPLANATION_CONTAINER.innerHTML = GENERIC_EXPLANATION
}

let lastWeight = 0
function calculate(e) {
  if (e.target.value === '') {
    setTransition(EXPLANATION_CONTAINER, GENERIC_EXPLANATION)
    RESULT_CONTAINER.innerHTML = ''
    return;
  }
  let weight = e.target.type === 'number' ? Number(e.target.value) : lastWeight 
  lastWeight = weight
  let hasError = validateWeight(weight)
  if (hasError) return;
  lastWeight = weight;
  // convertir a kilogramos
  if (POUND_UNIT.checked) {
    weight *= 0.45359237
  }
  if (weight <= 30) {
    const dailyVolume = HollidaySegar(weight)
    RESULT_CONTAINER.innerHTML = getResultHTML(dailyVolume)
    setTransition(EXPLANATION_CONTAINER, HOLLIDAY_SEGAR_EXPLANATION)
  } else {
    const CS = getCorporalSurface(weight)
    const
      dailyVolume1 = CS * 1500,
      dailyVolume2 = CS * 2000;
    RESULT_CONTAINER.innerHTML = `
      ${getResultHTML(dailyVolume1, 'x1500')}
      ${getResultHTML(dailyVolume2, 'x2000')}
    `
    setTransition(EXPLANATION_CONTAINER, BY_CS_METHOD_EXPLANATION)
  }
}

let prevContent = GENERIC_EXPLANATION;
let lastSetTransitionExecution;
let lastTimeoutExecution;
function setTransition(element, content) {
  if (prevContent === String(content)) return;
  lastSetTransitionExecution = Date.now()
  // se establece la opacidad en 0
  element.style.opacity = 0
  // ocurre la animación
  setTimeout(() => {
    lastTimeoutExecution = Date.now()
    const timeBetween = lastTimeoutExecution - lastSetTransitionExecution
    // cuando quiero que se cancele setTimeout, cuando se realiza un cambio antes de los 400ms
    // es decir, cuando se ejecuta la función antes de que termine la transición
    if (timeBetween < 400) return;
    // se realiza el cambio
    element.innerHTML = content
    prevContent = String(content)
    // opacidad 100
    element.style.opacity = 100
    // ocurre la animación
  }, 400)
}

function validateWeight(value) {
  const showError = (message) => {
    ERROR.innerText = message
    ERROR.style.visibility = 'inherit'
    WEIGHT_INPUT.classList.add('errored_input')
  }
  const hideError = () => {
    ERROR.style.visibility = 'hidden'
    WEIGHT_INPUT.classList.remove('errored_input')
  }
  let hastError = true
  if (value < 0) {
    showError('El peso debe ser mayor a 0')
  } else {
    hastError = false
    hideError()
  }
  return hastError
}

function HollidaySegar(weight) {
  if (weight <= 10) {
    return weight * 100
  } else if (weight > 10 && weight <= 20) {
    // (10 * 100) + ((weight - 10) * 50)
    return 1000 + ((weight - 10) * 50)
  } else if (weight > 20 && weight <= 30) {
    // (10 * 100) + (10 * 50) + ((weight - 20) * 20)
    return 1500 + ((weight - 20) * 20)
  }
}

function getCorporalSurface(weight) {
  return ((weight * 4) + 7) / (weight + 90)
}

function getResultHTML(dailyVolume, title = null) {
  const maintenance = (dailyVolume / 24).toFixed(1)
  const midMaintenance = (maintenance * 1.5).toFixed(1)
  return `
  <table>
    ${title ? `<caption>${title}</caption>` : ''}
    <thead>
      <tr>
        <th>Volumen diario</th>
        <th>Volumen por hora</th>
        <th>Volumen por hora (m + m/2)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${dailyVolume.toFixed(1)} cc</td>
        <td>${maintenance} cc</td>
        <td>${midMaintenance} cc</td>
      </tr>
    </tbody>
  </table>
`
}