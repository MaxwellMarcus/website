//get canvas element from html
var canvas = document.querySelector('canvas');
//set width and height of canvas to match the window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//change canvas size on resize to match the window
window.onresize = function (){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

//get canvas context
var c = canvas.getContext('2d');


//create enemy class
class Enemy{
  constructor(x,y,mobile,room){
    //initialize position variables
    this.x = x;
    this.y = y;

    //enemy size
    this.width = 50;
    this.height = 50;

    //initialize velocity
    this.vel = {
      x: 0,
      y: 0
    };

    //store which room the enemy is in
    this.room = room;

    //store how much health the enemy has
    this.health = 5;
    this.max_health = this.health;

    //store if it is a stationary mob
    this.mobile = mobile;

    //decide when an enemy has the ability to attack the player
    this.last_attack = time+Math.random()*2000;

    //decide when to show health bar
    this.show_health = false;
    this.show_health_timer = null;

    //where the enemy is trying to move to
    this.move_location = {
      x:this.x,
      y:this.y,
    }

    //pngs images of the mobile enemy
    this.images = [[document.getElementById("enemy back 1"),document.getElementById('enemy back 2'),document.getElementById('enemy back')],
    [document.getElementById("enemy front 1"),document.getElementById('enemy front 2'),document.getElementById('enemy front')],
    [document.getElementById("enemy left 1"),document.getElementById('enemy left 2'),document.getElementById('enemy left')],
    [document.getElementById("enemy right 1"),document.getElementById('enemy right 2'),document.getElementById('enemy right')]];

    //the direction the enemy is moving in
    this.dir = 2;

    //keep track of animation frame
    this.animation = 0;
    //only change animation after animation cooldown
    this.animation_cooldown = time + 200;

    //is enemy walking
    this.walking = false;
  }

  //show where the enemy is
  render(cam){
    //get the position that the camera sees
    let x = this.x - cam.x + canvas.width/2;
    let y = this.y - cam.y + canvas.height/2;

    //draw the enemy
    if (!this.walking){
      c.drawImage(this.images[this.dir-1][2],x-this.width,y-this.height,this.width*2,this.height*2);
    }
    else{
      c.drawImage(this.images[this.dir-1][this.animation],x-this.width,y-this.height,this.width*2,this.height*2);
      if (time > this.animation_cooldown){
        this.animation_cooldown = time+200;
        if (this.animation == 1){
          this.animation = 0;
        }
        else{
          this.animation = 1;
        }
      }
    }

    //if recently damaged
    if (this.show_health){
      //display health
      progress_bar(this.health,this.max_health, x-this.width/2, y-(this.height/2+10), this.width, this.height/10, '#BB0000', '#000000')
    }
  }
}

class Wall{
  constructor(x1,y1,x2,y2){
    //store position
    this.x1 = Math.min(x1,x2);
    this.y1 = Math.min(y1,y2);
    this.x2 = Math.max(x1,x2);
    this.y2 = Math.max(y1,y2);

    //image
    this.image = document.getElementById('Dungeon Wall')

    //how much to rotate image
    this.img_rotation = Math.PI/2 * Math.floor(Math.random()*4);
  }

  //show where wall is
  render(cam){
    let width = this.x2-this.x1;
    let height = this.y2-this.y1;

    //draw the wall
    c.translate(this.x1+width/2,this.y1+height/2);
    c.rotate(this.img_rotation);
    c.translate(-(this.x1+width/2),-(this.y1+height/2));
    c.drawImage(this.image,this.x1,this.y1,width,height);
    c.setTransform(1,0,0,1,0,0)
  }
}

class Room{
  constructor(x,y,map){
    //position
    this.x = x;
    this.y = y;

    //map of the room
    this.map = map.map;

    //if the map is part of the players home area
    this.home = map.home;

    //walls in the room
    this.walls = [];
    //enemies in the room
    this.enemies = [];
    //gold in the room
    this.gold = [];
    //chests in the room
    this.chests = [];

    //weapon smith in room
    this.weapon_smith = null;
    //armor smith in room
    this.armor_smith = null;
    //wizard in room
    this.wizard = null;

    //go through all data in the map
    for (x=0;x<this.map.length;x++){
      for (y=0;y<this.map[x].length;y++){
        //get the position on the coordinate place, not within the room
        let rx = (x-10)*50+(this.x*1000);
        let ry = (y-10)*50+(this.y*1000);

        //if element is a wall
        if (this.map[x][y] == 4){
          //add wall to list of walls
          this.walls.push(new Wall(rx-25,ry-25,rx+25,ry+25));
        }
        //if element is a mobile enemy
        else if (this.map[x][y] == 5){
          //add enemy to list of enemies
          this.enemies.push(new Enemy(rx,ry,true,this));
          //forget that element was an enemy(because the enemy may move to a different location)
          this.map[x][y] = 0;
        }
        //if element is a stationary enemy
        else if (this.map[x][y] == 6){
          //add enemy to list of enemies
          this.enemies.push(new Enemy(rx,ry,false,this));
          //forget that element was an enemy(because the enemy may move to a different location)
          this.map[x][y] = 0;
        }
        //if element is a weapon smith
        else if (this.map[x][y] == 7){
          //set weapon smith to a weapon smith
          this.weapon_smith = new WeaponSmith(rx,ry);
        }
        //if element is a armor smith
        else if (this.map[x][y] == 8){
          //set armor smith to a armor smith
          this.armor_smith = new ArmorSmith(rx,ry);
        }
        //if element is a wizard
        else if (this.map[x][y] == 9){
          //set wizard to a wizard
          this.wizard = new Wizard(rx,ry);
        }
        //if element is a chest
        else if (this.map[x][y] == 10){
          //add a chest to list of chests
          this.chests.push(new Chest(rx,ry));
        }
      }
    }
  }
  //show the floor
  render(cam){
    //get the position that the camera sees
    let x = this.x*1000 - 525 - cam.x + canvas.width/2;
    let y = this.y*1000 - 525 - cam.y + canvas.height/2;

    c.drawImage(dungeon_floor,x,y)
  }
}

class WeaponSmith{
  constructor(x,y){
    //position
    this.x = x;
    this.y = y;

    //speech bubble
    this.speech = '';
  }

  //show weapon smith
  render(cam){
    //get the position that the camera sees
    let x = this.x - cam.x + canvas.width/2;
    let y = this.y - cam.y + canvas.height/2;


    //draw the weapon smith's speech bubble
    c.fillStyle = 'Black';
    c.font = '20px Arial';
    c.textAlign = 'left';
    c.textBaseline = 'Bottom';
    c.fillText(this.speech,x+50,y-30);

    //draw the weapon smith
    c.beginPath();
    c.fillStyle = 'green';
    c.rect(x-25,y-25,50,50);
    c.fill();
  }
}

class ArmorSmith{
  constructor(x,y){
    //position
    this.x = x;
    this.y = y;
  }
  render(cam){
    //get the position that the camera sees
    let x = this.x - cam.x + canvas.width/2;
    let y = this.y - cam.y + canvas.height/2;

    //draw the armor smith
    c.beginPath();
    c.fillStyle = 'yellow';
    c.rect(x-25,y-25,50,50);
    c.fill();
  }
}

class Wizard{
  constructor(x,y){
    //position
    this.x = x;
    this.y = y;
  }
  render(cam){
    //get the position that the camera sees
    let x = this.x - cam.x + canvas.width/2;
    let y = this.y - cam.y + canvas.height/2;

    //draw the wizard
    c.beginPath();
    c.fillStyle = 'purple';
    c.rect(x-25,y-25,50,50);
    c.fill();
  }
}

class Button{
  constructor(x1,y1,x2,y2,func,args){
    //position of button
    this.x1 = Math.min(x1,x2);
    this.x2 = Math.max(x1,x2);
    this.y1 = Math.min(y1,y2);
    this.y2 = Math.max(y1,y2);

    //function on press
    this.func = func;
    //arguments for function
    this.args = args;

    //cooldown between button presses
    this.button_cooldown = time;
  }
  //check if button is pressed
  pressed(){
    //if mouse is on the button and pressed
    if (mouse.x > this.x1 && mouse.x < this.x2 && mouse.y > this.y1 && mouse.y < this.y2 && mouse.press){
      //if button can be pressed
      if (time > this.button_cooldown){
        //call function with arguments
        this.func(this.args);
        //set cooldown
        this.button_cooldown = time+1000
      }
    }
  }
  //check if button is being hovered over
  hovered(){
    //if mouse is over butotn
    if (mouse.x > this.x1 && mouse.x < this.x2 && mouse.y > this.y1 && mouse.y < this.y2){
      //return that button is being hovered over
      return true;
    }
  }
}

class Chest{
    constructor(x,y){
      //position
      this.x = x;
      this.y = y;

      //chest "speech bubble"
      this.text = '';

      //chest image
      this.img = document.getElementById('chest');
    }

    //show chest
    render(cam){
      //get the position that the camera sees
      let x = this.x - cam.x + canvas.width/2;
      let y = this.y - cam.y + canvas.height/2;

      //draw the chest
      c.drawImage(this.img,x-25,y-25,50,50);

      //show the "speech bubble"
      c.fillStyle = 'black';
      c.font = '30px Arial';
      c.fillText(this.text,x,y+45);
    }
}

//add a function to get the distance between two points
function get_dist(x1,y1,x2,y2){
  return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
}


//create a function to display progress bars
function progress_bar(num, max_num, x, y, width, height, main_color, background_color,bar_padding=0){
  //display background of bar
  c.beginPath();
  c.fillStyle = background_color;
  c.rect(x-bar_padding,y-bar_padding,width+bar_padding*2,height+bar_padding*2);
  c.fill();

  //calculate how much progress has been made
  let progress = num/max_num;
  let progress_width = progress*width;

  //display the progress
  c.beginPath();
  c.fillStyle = main_color;
  c.rect(x,y,progress_width,height);
  c.fill();
}

//function that draws text with an amount next to it (basicaly the most useless function, idk why i made it)
function draw_text_and_amount(text,amount,x,y){
  c.textAlign = 'left';
  c.fillStyle = 'black';
  c.font = '30px Arial';
  c.fillText(text + amount,x,y);
}

//store all keypresses
var keys = [];
window.onkeydown = function(event){
  keys.push(event.key);
};

//remove keys after release
window.onkeyup = function(event){
  while (keys.includes(event.key)){
    keys.splice(keys.indexOf(event.key),1);
  }
};

//info about mouse
var mouse = {
  x: 0,
  y: 0,
  press: false
};

//when mouse is moved
window.onmousemove = function(event){
  //set position to where it is moved to
  mouse.x = event.clientX;
  mouse.y = event.clientY;
};
//when mouse is clicked
window.onmousedown = function(event){
  //set data to reflect that
  mouse.press = true;
};
//when mouse is unclicked
window.onmouseup = function(event){
  //set data to reflect that
  mouse.press = false;
};

//Make last loop time variable to calculate delta time
let date = new Date;
var time = date.getTime();

//make a variable to store delta time in
var dt = null;

//main game scene
function gameloop(){
  c.clearRect(0,0,canvas.width,canvas.height);
  //claculate delta time
  date = new Date;
  dt = date.getTime() - time;
  time = date.getTime();

  c.beginPath()
  c.strokeStyle = 'black';
  c.lineWidth = 10;
  c.rect(canvas.width/2-500,canvas.height/2-500,1000,1000);
  c.stroke();

  for (let i = 0; i < enemies.length; i++){
    enemies[i].render();
  }

  for (let i = 0; i < walls.length; i++){
    walls[i].render();
  }

  for (let i = 0; i < chests.length; i++){
    chests[i].render();
  }

  if (mouse.press){
    let margin_x = canvas.width/2-500;
    let margin_y = canvas.height/2-500;
    let x = Math.floor((mouse.x-margin_x)/50);
    let y = Math.floor((mouse.y-margin_y)/50);

    if (x >= 0 && x < 20 && y >= 0 && y < 20){
      if (map[x][y] != 4){
        map[x][y] = 4;
        walls.push(new Wall(x*50+margin_x,y*50+margin_y,x*50+50+margin_x,y*50+50+margin_y));
        unpressed = false;
      }
    }
  }

  //if still on same scene
  if (scene == 'game'){
    //call it again
    requestAnimationFrame(gameloop);
  }
}

//get room data
async function get_levels(){
  return fetch('level_data.json')
  .then(function(data){
      console.log('recieved data...');
      console.log(data)
      console.log('converting to JavaScript Object...');
      return data.json();
    })
    .then(
    function(data){
      got_level_data = true;
      console.log('converted data...');
      console.log(data);
      console.log('starting...')
      level_data = data;
    }
  );
}


function loading(){
  c.clearRect(0,0,canvas.width,canvas.height);

  c.textAlign = 'center';
  c.fillStyle = 'pink';
  c.fillText('Loading...', canvas.width/2,canvas.height/2);

  if (!got_level_data){
    requestAnimationFrame(loading);
  }
  else{

    //scene that is currently being displayed
    scene = 'game';

    //dungeon floor png
    dungeon_floor = document.getElementById('dungeon floor');

    //initialize the game loop
    gameloop();
  }
}

var map = [];
for (let x = 0; x < 20; x++){
  let l = [];
  for (let y = 0; y < 20; y++){
    l.push(0);
  }
  map.push(l);
}
var enemies = [];
var chests = [];
var walls = [];
var type = 0;
var scene = 'loading';
var dungeon_floor = null;

//access level data
var got_level_data = false;
var level_data = null;
get_levels();

loading();
