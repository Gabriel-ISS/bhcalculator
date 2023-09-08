/** TODO:
 * Cambiar la explicación (especificar cual de los dos se uso)
 * Agregar validación (números y no negativos)
 * Animaciones ...
 * 
 * Agregar nuevas unidades de medida
 * Agregar tooltip sobre de que se trata
 * Organizar resultado
 */
const WEIGHT_INPUT = document.getElementById('weight');
const RESULT_CONTAINER = document.getElementById('result');
const ERROR = document.getElementById('error');
const EXPLANATION_CONTAINER = document.getElementById('explanation')

const GENERIC_EXPLANATION = `
  <li>Si el peso es menor a 30 se calcula mediante la formula de Holliday-Segar.</li>
  <li>
    Si el peso es mayor a 30 se calcula la superficie corporal y se multiplica el el resultado por 1500 y por 2000, generando dos resultados.
  </li>
`
const HOLLIDAY_SEGAR_EXPLANATION = `
  <li>De 0kg a 10kg, se calcula 100cc por cada kilo.</li>
  <li>Se suman 50cc por cada kilo por arriba de 10kg, hasta los 20kg.</li>
  <li>De 20kg para arriba, se suman 20cc por cada kilo adicional.</li>
`
const BY_CS_METHOD_EXPLANATION = `
  <li>Se calcula la superficie corporal.</li>
  <li>Se multiplica la superficie corporal por 1500 y por 2000.</li>
`

WEIGHT_INPUT.addEventListener('input', calculate)
// se ejecuta apenas carga el documento
chargeGenericExplanation()

function chargeGenericExplanation() {
  EXPLANATION_CONTAINER.innerHTML = GENERIC_EXPLANATION
}

function calculate(e) {
  if (e.target.value === '') {
    chargeGenericExplanation()
    RESULT_CONTAINER.innerHTML = ''
    return;
  }
  const weight = Number(e.target.value)
  validateWeight(weight)
  if (weight <= 30) {
    const dailyVolume = HollidaySegar(weight)
    RESULT_CONTAINER.innerHTML = getResultHTML(dailyVolume)
    EXPLANATION_CONTAINER.innerHTML = HOLLIDAY_SEGAR_EXPLANATION
  } else {
    const CS = getCorporalSurface(weight)
    const
      dailyVolume1 = CS * 1500,
      dailyVolume2 = CS * 2000;
    RESULT_CONTAINER.innerHTML = `
      <h3>R1</h3>
      ${getResultHTML(dailyVolume1)}
      <h3>R2</h3>
      ${getResultHTML(dailyVolume2)}
    `
    EXPLANATION_CONTAINER.innerHTML = BY_CS_METHOD_EXPLANATION
  }
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
  if (value < 0) {
    showError('El peso debe ser mayor a 0')
  } else {
    hideError()
  }
}

function HollidaySegar(weight) {
  console.log(weight)
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

function getResultHTML(dailyVolume) {
  const maintenance = (dailyVolume / 24).toFixed(1)
  const midMaintenance = (maintenance * 1.5).toFixed(1)
  return `<ul>
    <li>${maintenance} cc/hr</li>
    <li>${midMaintenance} cc/hr (m + m/2)</li>
  </ul>`
}

