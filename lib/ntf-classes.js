const globals = require('./ntf-globals.js')

module.exports = {Target,Ground,Pool,ProjectileThrownAxe,WeaponThrowAxe,Hero}

function Target(){
  let self = {exists:true,x:0,y:0,radius:40}
  self.init = function(x,y){
    this.exists = true
    this.x = x
    this.y = y
  }
  self.kill = function(){
    this.exists = false
  }
  self.overlapsRadius = function(object){
    let dx = object.x-this.x
    let dy = object.y-this.y
    let d = Math.sqrt(dx*dx+dy*dy)
    return d<=object.radius+this.radius
  }
  self.update = function(){
    this.x -= 1
    if (this.x < -100) {
      this.init (800+100+50*Math.random(),200*Math.random())
    }
  }
  self.draw = function(){
    push()
    translate(this.x,this.y)
    circle(0,0,this.radius)
    pop()
  }
  return self
}

function Ground(){
  let lastVertex = null
  let firstIndex = 0
  let vertexes = new Array(20)
  let nextVertexIndex = 0
  let scroll = {x:0,y:0}
  let lines = new Array(20)
  let numLines = 0
  let addVertex = function(){
    let nextX = lastVertex ? lastVertex.x + 50 + 50 * Math.random() : 0
    let nextY = lastVertex ? lastVertex.y - 25 + 50 * Math.random() : 275+50*Math.random()
    let vertex = lastVertex = {x:nextX,y:nextY}
    vertexes[nextVertexIndex] = vertex
    nextVertexIndex = indexPlus(nextVertexIndex,1)
  }
  let indexPlus = function(index,value){
    index += value
    while (index >= vertexes.length) index -= vertexes.length
    return index
  }
  /////////////////////////////////
  let self = {}
  self.update = function(){
    scroll.x -= 3
    // add next vertex(es) to the ground
    while (lastVertex.x + scroll.x < 850) {
      addVertex()
    }
    // find the index of the first vertex on the left of the screen
    while (vertexes[indexPlus(firstIndex,1)].x+scroll.x <= 0) {
      firstIndex = indexPlus(firstIndex,1)
    }
    // build a list of visible lines forming the ground, from left to right
    numLines = 0
    let firstX = vertexes[firstIndex].x
    for (let i=0,le=vertexes.length,prev=null;i<le;i++){
      let v = vertexes[indexPlus(firstIndex,i)]
      if (!v || v.x < firstX) break
      if (prev) {
        let x2 = v.x+scroll.x, y2 = v.y+scroll.y
        let x1 = prev.x + scroll.x, y1 = prev.y + scroll.y
        let line = {x1,y1,x2,y2,dx:x2-x1,dy:y2-y1}
        lines[numLines++] = line
      }
      prev = v
    }
  }
  self.draw = function(){
    for (let i=0;i<numLines;i++){
      let l = lines[i]
      line(l.x1,l.y1,l.x2,l.y2)
    }
  }
  self.collide = function(object){
    for (let i=0;i<numLines;i++){
      let l = lines[i]
      if (l.x2 >= object.x) {
        let groundY = l.y1+l.dy*((object.x - l.x1)/l.dx)
        if (object.y > groundY) {
          object.y = groundY
          object.ySpeed = 0
        }
        break
      }
    }
  }
  addVertex()
  return self
}

function Pool(le,classFunc){
  let objects = new Array(le)
  let length = 0
  //////////////////
  let self = {recycled:false}
  self.getNonExtant = function(){
    for (let i=0; i < length; i++){
      let o = objects[i]
      if (o && !o.exists) {
        this.recycled = true
        return o
      }
    }
    length ++
    if (objects.length < length) objects.length ++
    objects[length-1] = classFunc()
    return objects[length-1]
  }
  self.allExtantCall = function(funcName){
    for (let i=0; i < length; i++){
      let o = objects[i]
      if (o && o.exists) {
        o[funcName]()
      }
    }
  }
  self.getObjects = function(){
    return objects
  }
  self.forAllExtant = function(callback){
    for (let i=0; i < length; i++){
      let o = objects[i]
      if (o && o.exists) {
        callback(o)
      }
    }
  }
  self.testExtantAgainst = function(testFunc,vsPool){
    let vsObjects = vsPool.getObjects()
    for (let i=0; i < length; i++){
      let o = objects[i]
      if (o && o.exists) {
        for (let j=0,le=vsObjects.length; j<le; j++) {
          let vo = vsObjects[j]
          if (vo && vo.exists) {
            testFunc(o,vo)
          }
        }
      }
    }
  }
  return self
}

function ProjectileThrownAxe(){
  let self = {exists:true,radius:20,x:0,y:0,angle:0,xSpeed:0,ySpeed:0,rotSpeed:0}
  self.init = function(x,y,throwAngle,swingSpeed){
    this.exists = true
    this.x = x
    this.y = y
    this.angle = throwAngle
    this.rotSpeed = swingSpeed
    let throwSpeed = swingSpeed * 30
    this.xSpeed = throwSpeed*Math.sin(throwAngle)
    this.ySpeed = throwSpeed*-Math.cos(throwAngle)
  }
  self.kill = function(){
    this.exists = false
  }
  self.update = function(){
    this.angle += this.rotSpeed
    this.x += this.xSpeed
    this.ySpeed += globals.gravity/4
    this.y += this.ySpeed
  }
  self.draw = function(){
    push()
    translate(this.x,this.y)
    rotate(this.angle-Math.PI/2)
    rect(-5,-20,10,40)
    pop()
  }
  return self
}

function WeaponThrowAxe(){
  let swingAccel = Math.PI/200
  let swingMaxSpeed = Math.PI/10
  let cooldown = 60
  let self = {swinging:false,justThrown:false,swingSpeed:0,throwAngle:0}
  self.update = function(){
    this.justThrown = false
    if (this.swinging) {
      if (!keyIsDown(DOWN_ARROW)){
        this.swinging = false
        this.justThrown = true
        cooldown = 20
      } else {
        this.swingSpeed = Math.min(swingMaxSpeed,this.swingSpeed+swingAccel)
        this.throwAngle += this.swingSpeed
      }
    } else {
      if (cooldown > 0) cooldown --
      if (cooldown == 0 && keyIsDown(DOWN_ARROW)) {
        this.swinging = true
        this.throwAngle = Math.PI
        this.swingSpeed = 0
      }
    }
  }
  self.draw = function(x,y){
    if (this.swinging){
      push()
      translate(x,y)
      rotate(this.throwAngle-Math.PI/2)
      rect(0,-40,10,40)
      pop()
    }
  }
  self.getCenter = function(){
    let drawAngle = this.throwAngle-Math.PI/2
    return {x:5*Math.sin(this.throwAngle)+20*Math.sin(drawAngle),
      y:5*-Math.cos(this.throwAngle)+20*-Math.cos(drawAngle)}
  }
  return self
}

function Hero(){
  let self = {x:100,y:100,xSpeed:0,ySpeed:0,axe:WeaponThrowAxe()}
  self.update = function(){
    this.ySpeed += globals.gravity
    this.y += this.ySpeed
    if (keyIsDown(LEFT_ARROW)) {
      this.x -= 3;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      this.x += 3;
    }
    this.axe.update()
  }
  self.keyPressed = function(keyCode){
    if (keyCode == UP_ARROW){
      this.jump()
    }
  } 
  self.draw = function(){
    this.axe.draw(this.x,this.y)
    rect(this.x-5,this.y-20,10,30)
  }
  self.jump = function(){
    this.ySpeed = -10
  }
  return self
}