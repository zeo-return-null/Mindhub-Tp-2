const cardsContainer = document.getElementById("cards-container")
const checkboxContainer = document.getElementById("checkbox-container")
let searchId = document.getElementById("searchId")
let checkboxItems = Array.from(document.querySelectorAll(".check-item"))

async function getEvents() {
  let response = await fetch ("https://amd-amazingevents-api.onrender.com/api/eventos")
  let position = location.search.slice(10)
  let pathname = location.pathname
  let data = await response.json()
    let currentDate = new Date(data.fechaActual.split('-').join('/'))
  

  // Si esta en el html de estadisticas, setea datos e inicia
  if (pathname == "/pages/statistics.html") {
    eventsData = data.eventos
    // funcion principal
    function initStatistics() {
      let categories = []
      let category = eventsData.map(event => event.category)
      const unique = new Set(category)
      categories = [...unique]

      let AvailableCategories = []
      categories.forEach(category => {
        AvailableCategories.push(
          {
            category: category,
            data: eventsData.filter(event => event.category === category)
          }
        )
      })
      
      let byAssistance = [] 

      AvailableCategories.map(item => {
        byAssistance.push({
          category: item.category,
          ingress: item.data.map(i => i.assistance ? i.assistance * i.price : 0),
          estimateIngress: item.data.map(i => i.estimate ? i.estimate * i.price : 0),
          assistance: item.data.map(i => i.assistance ? i.assistance : 0),
          estimateAssistance: item.data.map(i => i.estimate ? i.estimate : 0),
          capacity: item.data.map(i => i.capacity ? i.capacity : 0)
        })
      })

      byAssistance.forEach(category => {
        
        let totalAssist = 0
        let totalEstimateAssist = 0
        let totalCapacityPast = 0
        let totalCapacityFuture = 0
        for (let i = 0; i < category.ingress.length; i++) {
          if (category.ingress[i] > 0) {
            totalCapacityPast += category.capacity[i]
            totalAssist += category.assistance[i]
            category.totalCapacityPast = totalCapacityPast
            category.totalAssist = totalAssist
          } else {
            totalCapacityFuture += category.capacity[i]
            totalEstimateAssist += category.estimateAssistance[i]
            category.totalCapacityFuture = totalCapacityFuture
            category.totalEstimateAssist = totalEstimateAssist
          }
        }
        category.percentageAssistance = ((totalAssist * 100) / totalCapacityPast).toFixed(2) + "%"
        category.percentageEstimate = ((totalEstimateAssist * 100) / totalCapacityFuture).toFixed(2) + "%"

        let totalIngress = 0
        category.ingress.map(ingress => totalIngress += ingress)
        category.ingress = totalIngress

        let totalEstimateIngress = 0
        category.estimateIngress.map(estimateIngress => totalEstimateIngress += estimateIngress)
        category.estimateIngress = totalEstimateIngress
      })
     
      // separar eventos pasados de futuros
      let pastEvents = []
      let futureEvents = []
      eventsData.filter(event => { event.assistance ? pastEvents.push(event) : futureEvents.push(event) })
      // console.log(pastEvents)
      // console.log(futureEvents)

      pastEvents.map(event => {event.percentageAssistance = event.assistance * 100 / event.capacity })
      
      let eventsAssistance = []
      pastEvents.filter(event => {eventsAssistance.push(event.percentageAssistance)})
      // mayor valor de asistencia 
      let maxAssistance = Math.max(...eventsAssistance)
      // Filtro en base al valor previo
      // console.log(eventsData)
      // console.log(eventsData.filter(event => {event === maxAssistance}))
      let majorAssistanceEvent = eventsData.filter(event => event.percentageAssistance == maxAssistance)
      // menor valor de asistencia
      let minAssistance = Math.min(...eventsAssistance)
      // Filtro en base al valor previo
      let minorAssistanceEvent = eventsData.filter(event => event.percentageAssistance === minAssistance)
      let maxCapacity = eventsData.sort((a, b) => { return b.capacity = a.capacity})
      // Busco los tr donde insertar los td 
      let maxStatsRow = document.getElementById('max-stats-row')
      let futureEventsRow = document.getElementById('future-events-row')
      let pastEventsRow = document.getElementById('past-events-row')
      // 
      let maxAssistanceTd = document.createElement('td')
      let minAssistanceTd = document.createElement('td')
      let maxCapacityTd = document.createElement('td')

      maxAssistanceTd.append(majorAssistanceEvent[0].name + ": " + majorAssistanceEvent[0].percentageAssistance.toFixed(2) + "%")
      minAssistanceTd.append(minorAssistanceEvent[0].name + ": " + minorAssistanceEvent[0].percentageAssistance.toFixed(2) + "%")
      maxCapacityTd.append(maxCapacity[0].name + " (" + maxCapacity[0].category + ")")
      maxStatsRow.append(maxAssistanceTd)
      maxStatsRow.append(minAssistanceTd)
      maxStatsRow.append(maxCapacityTd)
      
      orderFutureEvents = []
      orderFutureEvents.push(...byAssistance.sort((a, b) => {
        return b.estimateIngress - a.estimateIngress
      }))

      orderFutureEvents.map(event => {
        if (event.estimateIngress > 0) {
          futureEventsRow.innerHTML += `
          <tr>
            <td scope="row">${event.category}</td>
            <td>$${event.estimateIngress}</td>
            <td>${event.percentageEstimate}</td>
          </tr>
         `
        }
      })
    
      let orderPastEvents = []
      orderPastEvents.push(...byAssistance.sort((a, b) => {
        return b.ingress - a.ingress
      }))
  
      orderPastEvents.map(event => {
        if (event.ingress > 0) {
          pastEventsRow.innerHTML += 
          `
            <tr>
              <td scope="row">${event.category}</td>
              <td>$${event.ingress}</td>
              <td>${event.percentageAssistance}</td>
            </tr>
          ` 
        }
      })    
    }


    initStatistics()
  }

  if (pathname == "/index.html" || pathname == "/") {
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
    // inicializo el debounce 
    const filter = debounce(() => filterCards())
    // crear categorias checkboxes
    const checkboxCategories = new Set(eventsData.map(e => e.category))
    checkboxCategories.forEach(createCheckbox)
    let checkboxItems = Array.from(document.querySelectorAll(".check-item"))
    checkboxItems.forEach(checkbox => checkbox.addEventListener('click', filter))
    // eventlistener para el filtro de texto
    searchId.addEventListener('input', filter)
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
// debounce para que la ejecucion del filtrado ocurra luego de terminar de tipear
function debounce(func, timeout = 500){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

// llamar a la funcion de eventos 
getEvents()