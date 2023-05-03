const cardsContainer = document.getElementById("cards-container")
const checkboxContainer = document.getElementById("checkbox-container")
let searchId = document.getElementById("searchId")
let checkboxItems = Array.from(document.querySelectorAll(".check-item"))

async function getEvents() {
  let response = await fetch ("https://amd-amazingevents-api.onrender.com/api/eventos")
  let position = location.search.slice(10)
  let data = await response.json()
  let currentDate = new Date(data.fechaActual.split('-').join('/'))

  const leftArrow = document.getElementById("leftArrow")
  const rightArrow = document.getElementById("rightArrow")
  const menuTitle = document.getElementById("current")

  // Checkear si esta en pag eventos pasados, filtrar datos
  if (position == "past") {
    let filteredPastEvents = data.eventos.filter((evento) => {
      return (new Date(evento.date)) < currentDate
    })
    eventsData = filteredPastEvents
    leftArrow.href = "./index.html?position=upcoming"
    menuTitle.textContent = "Eventos Pasados"
    rightArrow.href = "./pages/contact.html"
  }
  // Checkear si esta en pag eventos futuros, filtrar datos
  if (position == "upcoming") {
    let filteredUpcomingEvents = data.eventos.filter((evento) => {
      return (new Date(evento.date)) > currentDate
    })
    eventsData = filteredUpcomingEvents
    leftArrow.href = "./index.html"
    menuTitle.textContent = "Eventos Futuros"
    rightArrow.href = "./index.html?position=past"
  }
  
  // Si esta en index, datos tal cual
  if (position == "index" || position == "") {
    eventsData = data.eventos
    leftArrow.href = "./pages/statistics.html"
    menuTitle.textContent = "Inicio"
    rightArrow.href = "./index.html?position=upcoming"
  }
  
  // llamar creacion de cartas
  eventsData.forEach(createCard)
  // crear categorias checkboxes
  const checkboxCategories = new Set(eventsData.map(e => e.category))
  checkboxCategories.forEach(createCheckbox)
  let checkboxItems = Array.from(document.querySelectorAll(".check-item"))
  checkboxItems.forEach(checkbox => checkbox.addEventListener('click', filterCards))
  // eventlistener para el filtro de texto
  searchId.addEventListener('input', filterCards)
  // filtro por checkbox
  function checkboxFilter(event) {
    let filter = checkboxItems.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value)
    if (filter.length !== 0) {
      filter = event.filter(event => filter.includes(event.category))
      return filter
    }
    return event
  }
  // filtro de cartas
  function filterCards() {
    let checksFilter = checkboxFilter(eventsData)
    let filteredSearch = searchFilter(checksFilter, searchId.value)
    console.log(filteredSearch)
    if(filteredSearch.length !== 0) {
      cardsContainer.innerHTML = ``
    }
    filteredSearch.forEach(createCard)
  }
}
// crear checkboxs
function createCheckbox(e) {
  checkboxContainer.innerHTML += `
  <label>
  <input class="checkbox check-item" value="${[e]}" type="checkbox">
  <div class="checkmark"><span class="category">${[e]}</span></div>
  </label>
  `
}
// filtro de busqueda
function searchFilter(arr, text) {
  let filter = arr.filter(event => event.name.toLowerCase().includes(text.toLowerCase()))
  if(filter.length === 0) {
    cardsContainer.innerHTML = `
    <div>
    <h3>No encontrado</h3>
    </div>
    `
    return []
  }
  return filter
}
// crear cartas
function createCard(e) {
  cardsContainer.classList.add("row", "row-cols-3", "sm-4", "col-md-12", "row-cols-sm-4", "my-4", "py-5", "px-2", "d-flex", "justify-content-center")
  let cardTemplate = `
  <div id="card-${e.id}" class="card m-1 container-vertical justify-evenly">
  <div class="card-body justify-content-between">
  <h5 class="d-flex justify-content-center align-content-center card-title">${e.name}</h5>
  <img src="${e.image}" class="card-img-top card-img mt-2 mb-5" alt="${e.name}">
  <p class="d-flex justify-content-center align-items-center card-description">${e.date.slice(0,10)}</p>
  <p class="d-flex justify-content-center align-items-center card-description">${e.description}</p>
  <div class="d-flex row-2 justify-content-end">
  <p class="card-text col align-self-center">$${e.price}</p>
  <a href="${e._id}" class="btn btn-primary h-100 w-50">Mas Detalles</a>
  </div>
  </div>
  </div>
  `
  cardsContainer.innerHTML += cardTemplate
}

// llamar a la funcion de eventos 
getEvents()