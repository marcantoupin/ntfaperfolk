require('./lib/p5/p5.min.js')
const globals = require('./lib/ntf-globals.js')
const ntf = require('./lib/ntf-classes.js')

let axes = ntf.Pool(40,ntf.ProjectileThrownAxe)
let ground = ntf.Ground()
let hero = ntf.Hero()
let paused = false

//==========================================================

window.keyPressed = function() {
  hero.keyPressed(keyCode)
  if (keyCode == RETURN) paused = !paused
}

window.draw = function() {
  background(200,225,255);
  if (!paused) {
    ground.update()
    hero.update()
    if (hero.axe.justThrown) {
      let axe = axes.getNonExtant()
      let axeCenter = hero.axe.getCenter()
      axe.init(hero.x+axeCenter.x,hero.y+axeCenter.y,hero.axe.throwAngle,hero.axe.swingSpeed)
    }
    ground.collide(hero)
    axes.allExtantCall('update')
  }
  ground.draw()
  axes.allExtantCall('draw')
  hero.draw()
}

window.setup = function() {
  console.log('setup!')
  createCanvas(800, 400);
}
