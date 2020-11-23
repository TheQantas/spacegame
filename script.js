var pts = 0;
var canvas;
var myGameArea, myGamePiece, horizLimit, vertLimit, audio;
var myObstacles = [];
var meteors = [];
meteors[0] = {id:'met1Img',k:0.185};
meteors[1] = {id:'met2Img',k:0.166};
meteors[2] = {id:'met3Img',k:0.131};
meteors[3] = {id:'met4Img',k:0.119};
meteors[4] = {id:'met5Img',k:0.166};
meteors[5] = {id:'met6Img',k:0.200};
meteors[6] = {id:'met7Img',k:0.147};
var obsSpeed = 3;
var shipSpeed = 2;
var boostRemaining = 100;
var boosting = false;
var boostInterval = false;
var boostAmount = 1.5;
var shipSrc = 'shipImg';
var highScore = 0;
var gameOver = false;

document.addEventListener('keyup', event => {
  if (event.code === 'Space') {
    stopBoost();
  }
})

document.addEventListener('keypress', event => {
  if (event.code === 'Space') {
    startBoost();
  }
})

window.onload = function() {
  highScore = Number(getCookie('highScore'));
  delayAudioStart();
  audio = document.getElementById('audio');
  canvas = document.getElementById('gameArea');
  canvas.width = window.innerWidth;
  horizLimit = window.innerWidth;
  vertLimit = canvas.height;
  myGameArea = {
    canvas: document.getElementById('gameArea'),
    start: function() {
      this.context = this.canvas.getContext("2d");
      this.frameNo = 0;
      this.interval = setInterval(updateGameArea,20);
      window.addEventListener('keydown', function (e) {
        myGameArea.keys = (myGameArea.keys || []);
        myGameArea.keys[e.keyCode] = true;
      });
      window.addEventListener('keyup', function (e) {
        myGameArea.keys[e.keyCode] = false;
      });
    },
    clear: function() {
      this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
    },
    stop: function() {
      audio.pause();
      clearInterval(this.interval);
      if (boosting) {
        stopBoost();
      }
      endGame();
    }
  }
};

window.onresize = function() {
  canvas.width = window.innerWidth;
  myGamePiece = new component(120,80,50,160,0.4,shipSrc);
}

function endGame() {
  document.getElementById('gameOverCont').style.display = 'flex';
  gameOver = true;
  if (pts > highScore) {
    highScore = pts;
    document.cookie = `highScore=${pts}`;
    document.getElementById('gameOverHigh').style.display = 'block';
  } else {
    document.getElementById('gameOverHigh').style.display = 'none';
  }
  document.getElementById('gameOverScore').textContent = `${numberWithCommas(pts)} PTS`;
}

function restartGame() {
  myGameArea.clear();
  pts = 0;
  obsSpeed = 3;
  shipSpeed = 2;
  gameOver = false;
  myObstacles.length = 0;
  document.getElementById('gameOverCont').style.display = 'none';
  boostRemaining = 100;
  startGame();
}

function startBoost() {
  if (gameOver) {
    return;
  }
  if (boostRemaining > 0 && boostInterval === false) {
    shipSrc = 'shipBoostImg';
    myGamePiece = new component(120,80,50,myGamePiece.y,0.4,shipSrc);
    boosting = true;
    shipSpeed += boostAmount;
    boostInterval = setInterval(function() {
      boostRemaining -= 0.1;
      document.getElementById('boost').style.width = `${100 - boostRemaining}%`;
      if (boostRemaining <= 0) {
        stopBoost();
      }
    }, 5);
  }
}

function stopBoost() {
  clearInterval(boostInterval);
  shipSrc = 'shipImg';
  myGamePiece = new component(120,80,50,myGamePiece.y,0.4,shipSrc);
  boosting = false;
  shipSpeed -= boostAmount;
  boostInterval = false;
  if (boostRemaining < 0) {
    boostRemaining = 0;
  }
}

function startGame() {
  myGameArea.start();
  myGamePiece = new component(120,80,50,160,0.4,shipSrc);
}

function delayAudioStart() {
  let iter = 0;
  let bar = document.getElementById('warningLoadBar');
  animation = setInterval(function() {
    iter++;
    bar.style.width = `${iter / 4}%`;
    if (iter == 400) {
      clearInterval(animation);
      document.getElementById('warning').style.display = 'none';
      startGame();
      audio.play();
    }
  }, 2);
}

function updateGameArea() {
  var x, y;
  for (i = 0; i < myObstacles.length; i++) {
    if (myGamePiece.crashWith(myObstacles[i])) {
      myGameArea.stop();
      return;
    }
  }
  myGameArea.clear();
  //if (myGameArea.keys && myGameArea.keys[37]) {myGamePiece.speedX = -1; }
  //if (myGameArea.keys && myGameArea.keys[39]) {myGamePiece.speedX = 1; }
  myGameArea.frameNo += 1;
  if (myGameArea.frameNo % 2 == 0) {
    if (!boosting) {
      boostRemaining += 0.1;
      if (boostRemaining > 100) {
        boostRemaining = 100;
      }
      document.getElementById('boost').style.width = `${100 - boostRemaining}%`;
    }
  }
  if (myGameArea.frameNo == 1 || everyinterval(10)) {
    pts += 1;
    updatePoints(pts);
    if (pts % 100 == 0 && pts != 100) {
      obsSpeed += 0.5;
      shipSpeed += 0.5;
    }
  }
  if (myGameArea.frameNo == 1 || everyinterval(Math.round(240 / obsSpeed))) {
    x = myGameArea.canvas.width;
    y = myGameArea.canvas.height - 200;
    let randInt = Math.floor(Math.random() * meteors.length);
    let meteorDesign = meteors[randInt];
    myObstacles.push(new component('auto','auto',horizLimit - 100,'random',meteorDesign.k,meteorDesign.id));
  }
  for (i = 0; i < myObstacles.length; i += 1) {
    myObstacles[i].x -= obsSpeed;
    myObstacles[i].update();
  }
  if (myGameArea.keys && myGameArea.keys[38]) {myGamePiece.speedY = -shipSpeed; }
  if (myGameArea.keys && myGameArea.keys[40]) {myGamePiece.speedY = shipSpeed; }
  if (myGameArea.keys && myGameArea.keys[87]) {myGamePiece.speedY = shipSpeed; }
  if (myGameArea.keys && myGameArea.keys[83]) {myGamePiece.speedY = -shipSpeed; }
  if (myGameArea.keys && myGameArea.keys[73]) {myGamePiece.speedY = shipSpeed; }
  if (myGameArea.keys && myGameArea.keys[75]) {myGamePiece.speedY = -shipSpeed; }
  myGamePiece.newPos();
  myGamePiece.update();
}

function component(width,height,x,y,scale,id) {
  var img = document.getElementById(id);
  //this.width = width;
  //this.height = height;
  if (width == 'auto') {
    this.width = img.width * scale;
  } else {
    this.width = width;
  }
  if (height == 'auto') {
    this.height = img.height * scale;
  } else {
    this.height = height;
  }
  this.speedX = 0;
  this.speedY = 0;
  this.x = x;
  if (y !== 'random') {
    this.y = y;
  } else {
    var renderHeight = img.height * scale;
    var randomHeight = Math.floor(Math.random() * (vertLimit - renderHeight));
    this.y = randomHeight;
  }
  this.update = function(){
    ctx = myGameArea.context;
    ctx.drawImage(img,this.x,this.y,img.width * scale,img.height * scale);
  };
  this.newPos = function() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.y < 0) {
      this.y = 0;
    }
    if (this.y + this.height > canvas.height) {
      this.y = canvas.height - this.height;
    }
  };
  this.crashWith = function(otherobj) {
    if (otherobj.x < 0) {
      return false;
    }
    var mymiddle = {x:this.x + this.width / 2,y:this.y + this.height / 2};
    var myradius = {x:this.width / 2,y:this.height / 2};
    var othermiddle = {x:otherobj.x + otherobj.width / 2,y:otherobj.y + otherobj.height / 2};
    var otherradius = {x:otherobj.width / 2,y:otherobj.height / 2};
    var crashX = false;
    var crashY = false;
    if ((Math.abs(mymiddle.y - othermiddle.y)) < otherradius.y + myradius.y) {
      crashY = true;
    }
    if ((Math.abs(mymiddle.x - othermiddle.x)) < otherradius.x + myradius.x) {
      crashX = true;
    }
    if (crashX == true && crashY == true) {
      // console.log({xrad:otherradius.x + myradius.x,xdist:Math.abs(mymiddle.x - othermiddle.x),xdtc:crashX});
      // console.log({yrad:otherradius.y + myradius.y,ydist:Math.abs(mymiddle.y - othermiddle.y),ydtc:crashY});
      // console.log(otherobj);
      return true;
    } else {
      return false;
    }
  };
}

//resources

function everyinterval(n) {
  if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
  return false;
}

function moveup() {
  myGamePiece.speedY -= 1;
}

function movedown() {
  myGamePiece.speedY += 1;
}

function moveleft() {
  myGamePiece.speedX -= 1;
}

function moveright() {
  myGamePiece.speedX += 1;
}

function stopMove() {
  myGamePiece.speedX = 0;
  myGamePiece.speedY = 0;
}

function updatePoints(x) {
  if (highScore > 0) {
    document.getElementById('score').textContent = `${numberWithCommas(x)} PTS (${numberWithCommas(highScore)} HI)`;
  } else {
    document.getElementById('score').textContent = `${numberWithCommas(x)} PTS`;
  }
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getCookie(cname) {
  var name = cname + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}
