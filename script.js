import bot from './assets/bot.svg'
import user from './assets/user.svg'
const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')
const recordBtn = document.querySelector('#record')

let loadInterval
function loader(element) {
  element.textContent = ''

  loadInterval = setInterval(() => {
    // Update the text content of the loading indicator
    element.textContent += '.'

    // If the loading indicator has reached three dots, reset it
    if (element.textContent === '....') {
      element.textContent = ''
    }
  }, 300)
}

function typeText(element, text) {
  let i = 0
  const interval = setInterval(() => {
    if (i < text.length) {
      element.innerHTML += text.charAt(i)
      i++
    } else {
      clearInterval(interval)
    }
  }, 20)
}

function generateUniqueId() {
  const timestamp = Date.now()
  const randomNum = Math.random()
  const hexadecimalString = randomNum.toString(16)
  return `id-${timestamp}-${hexadecimalString}`
}

function chatStripe(isAi, value, uniqueId) {
  return `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                 </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
}

const handleSubmit = async (e) => {
  e.preventDefault()
  const data = new FormData(form)
  //user chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

  form.reset()

  // bot's chatstripe
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, ' ', uniqueId)

  // to focus scroll to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight

  // specific message div
  const messageDiv = document.getElementById(uniqueId)

  // messageDiv.innerHTML = "..."
  loader(messageDiv)

  const response = await fetch('https://chatlink.herokuapp.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt'),
    }),
  })
  clearInterval(loadInterval)
  messageDiv.innerHTML = ''
  if (response.ok) {
    const data = await response.json()
    const parsedData = data.bot.trim()
    console.log(parsedData, 'data')
    typeText(messageDiv, parsedData)
  } else {
    const error = await response.text()

    messageDiv.innerHTML = 'something went wrong'
    alert(error)
  }
}
form.addEventListener('submit', handleSubmit)

form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e)
  }
})

recordBtn.addEventListener('click', () => {
  record()
})
function record() {
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(false, ' ', uniqueId)

  // to focus scroll to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight

  // specific message div
  const messageDiv = document.getElementById(uniqueId)

  // messageDiv.innerHTML = "..."
  loader(messageDiv)
  var recognition = new webkitSpeechRecognition()
  recognition.continuous = false
  recognition.interimResults = false

  recognition.lang = 'en-US'
  recognition.start()

  recognition.onresult = function (e) {
    console.log(e.results[0][0].transcript)
    document.getElementById('pmpt').value = e.results[0][0].transcript
    recognition.stop()
    document.getElementById(uniqueId).parentElement.parentElement.remove()
    handleSubmit(e)
  }
}
