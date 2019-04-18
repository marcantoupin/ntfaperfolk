require('./lib/p5/p5.min.js')
const globals = require('./lib/ntf-globals.js')
const ntf = require('./lib/ntf-classes.js')

let axes = ntf.Pool(40,ntf.ProjectileThrownAxe)
let targets = ntf.Pool(40,ntf.Target)
let ground = ntf.Ground()
let hero = ntf.Hero()
let paused = false

//==========================================================

window.setup = function() {
  createCanvas(800, 400);
  for (let i=0; i<10; i++) {
    let target = targets.getNonExtant()
    target.init(400+i*300,200*Math.random())
  }
}

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
    targets.allExtantCall('update')
    axes.allExtantCall('update')
    axes.testExtantAgainst(axesOnTargets,targets)
  }
  ground.draw()
  targets.allExtantCall('draw')
  axes.allExtantCall('draw')
  hero.draw()
}

let axesOnTargets = function(o1,o2){
  if (overlapsRadius(o1,o2)){
    o1.kill()
    o2.kill()
  }
}

let overlapsRadius = function(o1,o2){
  let dx = o2.x-o1.x
  let dy = o2.y-o1.y
  let d = Math.sqrt(dx*dx+dy*dy)
  return d<=o1.radius+o2.radius
}
