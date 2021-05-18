const data = { score: 0, oldCoords: null, newCoords: null, pos: { x: 4, y: -2 }, over: false, isPaused: false, souls: 1, seconds : 60}

const gameBoard = document.getElementsByClassName('game-board')[0]
const pauseBtn = document.getElementsByClassName('pause-btn')[0]
const score = document.getElementsByClassName('score')[0]
const timeBoard = document.getElementsByClassName('time')[0]
const text = document.getElementsByTagName('p')[0]


function renderWell() {
  document.querySelector('pre').textContent = ``
  well.forEach(r => { document.querySelector('pre').textContent += `${r.join('')}\n` })
}

let well = Array(20).fill(0).map(() => Array(10).fill('□'))

const tets = [
  [['□', '■', '□'], 
   ['■', '■', '■']], 
  
  [['■', '□', '□'], 
   ['■', '■', '■']],
  
  [['□', '□', '■'], 
   ['■', '■', '■']],
  
  [['■', '■'], 
   ['■', '■']],

  [['□', '■', '■'], 
   ['■', '■', '□']],
  
  [['■', '■', '□'], 
   ['□', '■', '■']],
  
  [['□', '□', '□', '□'],
   ['■', '■', '■', '■'], 
   ['□', '□', '□', '□']],
]

let tet = tets[Math.floor(Math.random() * tets.length)] // random [0, tets.length)

function pausing() {
  data.isPaused = gameBoard.classList.toggle('paused') === true
  pauseBtn.textContent = data.isPaused ? 'Continue' : 'Pause'
  text.classList.toggle('truth')
}


// manipulations with key-board
window.addEventListener('keydown', e => {
  if (e.code === 'Space' && !data.over) {
    pausing()
  } else if (!data.isPaused) {
    switch (e.code) {
      case 'ArrowDown':
        !data.over && canMove('down') && move('down')
        break
      case 'ArrowLeft':
        !data.over && canMove('left') && move('left')
        break
      case 'ArrowRight':
        !data.over && canMove('right') && move('right')
        break      
      case 'ArrowUp':
        !data.over && canMove('rotate') && move()
        break
    }
  }
})

// manipulations with restart-btn
document.getElementsByClassName('restart-btn')[0].addEventListener('click', e => window.location.reload())

// manipulations with pause-btn
pauseBtn.addEventListener('click', () => { (!data.over) && pausing() })

const setCoords = (t, p) => t.map((r, i) => r.map((c, j) => ({ x: p.x + j, y: p.y + i, z: c === '■' }))).flat()
const placeOnWell = coords => { coords.forEach(c => { if (c.y >= 0 && c.z) well[c.y][c.x] = '■' })}
const removeFromWell = (coords, w) => { coords.forEach(c => { if (c.y >= 0 && c.z) w[c.y][c.x] = '□' })}

// function setCoords(t,p) {
//   return t.map((r, i) => r.map((c, j) => ({ x: p.x + j, y: p.y + i, z: c === '■' }))).flat()
// }

// function placeOnWell(coords) {
//   return coords.forEach(c => { if (c.y >= 0 && c.z) well[c.y][c.x] = '■' })
// }

// function removeFromWell(coords, w) {
//   return coords.forEach(c => { if (c.y >= 0 && c.z) w[c.y][c.x] = '□' })
// }

function canMove(dir) {
  const tempWell = JSON.parse(JSON.stringify(well))
  const tempPos = { ...data.pos }
  data.oldCoords && removeFromWell(data.oldCoords, tempWell)
  
  if (dir === 'rotate') {
    const flipTet = t => t[0].map((_, i) => t.map(te => te[i]))
    const rotateTet = t => flipTet([...t].reverse())
    const tempTet = rotateTet(tet)
    const tempNC = setCoords(tempTet, tempPos)
    const collided = tempNC.some(c => c.z && c.y >= 0 && ((!tempWell[c.y][c.x]) || (tempWell[c.y][c.x] === '■')))
    if (!collided) {
      tet = rotateTet(tet)
      return true
    }
    return false
  } 
  
  if (dir === 'down') {
    tempPos.y++
    const tempNC = setCoords(tet, tempPos)
    const collided = tempNC.some(c => c.z && c.y >= 0 && ((!tempWell[c.y]) || (tempWell[c.y][c.x] === '■')))
    if (data.oldCoords && collided && !well[0].slice(3, 6).includes('■')) {
      data.pos = { x: 4, y: -2 }
      data.newCoords = null
      data.oldCoords = null
      clearFullRows()
      tet = tets[Math.floor(Math.random() * tets.length)]
    } else if (collided && well[0].slice(3, 6).includes('■')) {
      everbodyDies()
    }
    return !collided
  } 
  
  if (dir === 'left' || dir === 'right') {
    dir === 'left' ? tempPos.x-- : tempPos.x++
    const tempNC = setCoords(tet, tempPos)
    return !tempNC.some(c => c.z && (!(tempWell[c.y] && tempWell[c.y][c.x]) || (tempWell[c.y][c.x] === '■')))
  }
  return true
}

function move(dir) {
  if (dir === 'down') data.pos.y++ 
  else if (dir === 'left') data.pos.x-- 
  else if (dir === 'right') data.pos.x++ 
  data.newCoords = setCoords(tet, data.pos)
  data.oldCoords && removeFromWell(data.oldCoords, well)
  placeOnWell(data.newCoords)
  data.oldCoords = data.newCoords
  renderWell()
}

function clearFullRows() {
  let count = 0
  well = well.reduce((acc, cur) => {
    if (cur.every(c => c === '■')) {
      count++
      // data.score++
      return [Array(10).fill('□'), ...acc]
    }
    return [...acc, cur]
  }, [])
  
  // https://tetris.wiki/Scoring and divided by 40 with upper approximation
  if (count !== 0) {
    if (count === 1) data.score++
    else if (count === 2) data.score += 3
    else if (count === 3) data.score += 8
    else data.score += 30 // count === 4
    score.textContent = data.score
  }
}

// it is a final countdown
let timer = data.seconds
function myTimer() {
  timeBoard.textContent = timer
  timer-- === 0 && everbodyDies() 
}
let countdown = setInterval(myTimer, 1000)


function reincarnation() {
  well = Array(20).fill(0).map(() => Array(10).fill('□'))
  data.over = false
  data.isPaused = false
  timer = data.seconds
  document.getElementsByClassName('life')[0].textContent = '00-edu'
  countdown = setInterval(myTimer, 1000)
  renderWell()
}

function everbodyDies() {
  clearInterval(countdown)
  data.isPaused = true
  data.over = true
  well[7] = []
  well[9] = []
  well[8] = data.souls ? ['Y', 'O', 'U', ' ', 'D', 'I', 'E', 'D'] : ['G', 'A', 'M', 'E', ' ', 'O', 'V', 'E', 'R']
  renderWell()
  --data.souls === 0 && setTimeout(() => reincarnation(), 1000)
}

requestAnimationFrame(function() { 
  setInterval(() => { 
    !data.isPaused && canMove('down') && move('down') 
  }, 200) 
})