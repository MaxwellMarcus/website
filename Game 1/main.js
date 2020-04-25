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


//make a class to hold all player information
class Player{
  constructor(){
    //initialize player position
    this.x = 0;
    this.y = 0;

    //store where player was
    this.lx = this.x;
    this.ly = this.y;

    //initialize player velocity
    this.vel = {
      x:0,
      y:0
    };

    //initialize player health
    this.health = 10;

    //store maximum player health
    this.max_health = this.health;

    this.room_pos = {
      x: 0,
      y: 0
    };
    for (let x=0;x<rooms.length;x++){
      if (rooms[x].x == this.room_pos.x && rooms[x].y == this.room_pos.y){
        this.room = rooms[x]
      }
    }

    this.render_rooms = []
    for (let i = 0; i < rooms.length; i++){
      let dx = Math.abs(this.x-rooms[i].x);
      let dy = Math.abs(this.y-rooms[i].y);
      if (dx <= 2 && dy <= 2 && (dx != 0 || dy != 0)){
        this.render_rooms.push(rooms[i]);
      }
    }

    this.money = 150;

    this.dir = 1;

    this.weapons = [new Weapon(1,2,100,true,'Butter Knife')];
    this.weapon = this.weapons[0];
  }

  update(dt){
    //add velocity to position
    this.x += this.vel.x * dt;
    this.y += this.vel.y * dt;

    //friction
    this.vel.x -= this.vel.x/25 * dt;
    this.vel.y -= this.vel.y/25 * dt;

    //temporary velocity storage
    let x = 0;
    let y = 0;

    if (keys.includes('w')){
      y += -1;
      this.dir = 1;
    }
    if (keys.includes('s')){
      y += 1;
      this.dir = 2;
    }
    if (keys.includes('a')){
      x += -1;
      this.dir = 3;
    }
    if (keys.includes('d')){
      x += 1;
      this.dir = 4;
    }

    //same speed going diagnal
    if (Math.abs(x) > 0 && Math.abs(y) > 0){
      x *= Math.cos(Math.PI/4);
      y *= Math.cos(Math.PI/4);
    }

    //too fast without this
    this.vel.x = x/2;
    this.vel.y = y/2;

    //store where player will be
    x = this.x + this.vel.x*dt;
    y = this.y + this.vel.y*dt;

    //know if not collided with anything
    let not_collided = true;

    //check if moving into a wall
    for (let i = 0; i < this.room.walls.length; i++){
      if (x - 25 < this.room.walls[i].x2 && x + 25 > player.room.walls[i].x1 && this.y - 25 < player.room.walls[i].y2 && this.y + 25 > player.room.walls[i].y1){
        this.vel.x = 0;
        not_collided = false;

        if (this.x > player.room.walls[i].x1+(player.room.walls[i].x2-player.room.walls[i].x1)/2){
          this.x = player.room.walls[i].x2 + 25;
        }
        else{
          this.x = player.room.walls[i].x1 - 25;
        }
      }
      if (this.x - 25 < player.room.walls[i].x2 && this.x + 25 > player.room.walls[i].x1 && y - 25 < player.room.walls[i].y2 && y + 25 > player.room.walls[i].y1){
        this.vel.y = 0;
        not_collided = false;

        if (this.y > player.room.walls[i].y1+(player.room.walls[i].y2-player.room.walls[i].y1)/2){
          this.y = player.room.walls[i].y2 + 25;
        }
        else{
          this.y = player.room.walls[i].y1 - 25;
        }
      }
    }
    if (not_collided){
      //store where player was
      this.lx = this.x;
      this.ly = this.y;
    }

    this.room_pos.x = Math.round(this.x/1000);
    this.room_pos.y = Math.round(this.y/1000);
    for (x=0;x<rooms.length;x++){
      if (rooms[x].x == this.room_pos.x && rooms[x].y == this.room_pos.y){
        this.room = rooms[x]
      }
    }

    this.render_rooms = [];
    for (let i = 0; i < rooms.length; i++){
      let dx = Math.abs(this.x-rooms[i].x*1000);
      let dy = Math.abs(this.y-rooms[i].y*1000);
      if (dx <= 3000 && dy <= 3000){
        if (rooms[i].home == this.room.home){
          this.render_rooms.push(rooms[i]);
        }
      }
    }

    if (mouse.press){
      if (this.weapon){
        if (time > this.weapon.cooldown){
          this.attack();
          this.weapon.cooldown = time+this.weapon.speed*200;
        }
      }
    }

    if (keys.includes('1')){
      if (this.weapons.length > 0){
        this.weapon = this.weapons[0];
      }
    }
    if (keys.includes('2')){
      if (this.weapons.length > 1){
        this.weapon = this.weapons[1];
      }
    }
    if (keys.includes('3')){
      if (this.weapons.length > 2){
        this.weapon = this.weapons[2];
      }
    }
    if (keys.includes('4')){
      if (this.weapons.length > 3){
        this.weapon = this.weapons[3];
      }
    }
    if (keys.includes('5')){
      if (this.weapons.length > 4){
        this.weapon = this.weapons[4];
      }
    }
    if (keys.includes('6')){
      if (this.weapons.length > 5){
        this.weapon = this.weapons[5];
      }
    }
    if (keys.includes('7')){
      if (this.weapons.length > 6){
        this.weapon = this.weapons[6];
      }
    }
  }

  damage(amount){
    this.health -= amount;
  }

  attack(){
    if (this.weapon.melee){
      for (let i = 0; i < this.room.enemies.length; i++){
        if (this.dir == 1){
          if (this.y-this.room.enemies[i].y < this.weapon.range && Math.abs(this.x-this.room.enemies[i].x)<50){
            if (this.y > this.room.enemies[i].y){
              this.room.enemies[i].damage(this.weapon.damage);
            }
          }
        }
        if (this.dir == 2){
          if (this.room.enemies[i].y-this.y < this.weapon.range && Math.abs(this.x-this.room.enemies[i].x)<50){
            if (this.y < this.room.enemies[i].y){
              this.room.enemies[i].damage(this.weapon.damage);
            }
          }
        }
        if (this.dir == 3){
          if (Math.abs(this.y-this.room.enemies[i].y) < 50 && this.x-this.room.enemies[i].x < this.weapon.range){
            if (this.x > this.room.enemies[i].x){
              this.room.enemies[i].damage(this.weapon.damage);
            }
          }
        }
        if (this.dir == 4){
          if (Math.abs(this.y-this.room.enemies[i].y) < 50 && this.room.enemies[i].x-this.x < this.weapon.range){
            if (this.x < this.room.enemies[i].x){
              this.room.enemies[i].damage(this.weapon.damage);
            }
          }
        }
      }
    }
    if (!this.weapon.melee){
      if (this.dir == 1){
        projectiles.push(new Projectile(this.x,this.y-50,{x:0,y:-1}))
      }
      if (this.dir == 2){
        projectiles.push(new Projectile(this.x,this.y+50,{x:0,y:1}))
      }
      if (this.dir == 3){
        projectiles.push(new Projectile(this.x-50,this.y,{x:-1,y:0}))
      }
      if (this.dir == 4){
        projectiles.push(new Projectile(this.x+50,this.y,{x:1,y:0}))
      }
    }
  }

  render(cam){
    //get the position that the camera sees
    let x = this.x - cam.x + canvas.width/2;
    let y = this.y - cam.y + canvas.height/2;

    //draw the player
    c.beginPath();
    c.fillStyle = 'blue';
    c.rect(x-25,y-25,50,50);
    c.fill();
  }
}

//make a class to hold information on camera
class Camera{
  constructor(){
    //initialize position variables
    this.x = 0;
    this.y = 0;

    //initialize velocity
    this.vel = {
      x:0,
      y:0
    };

    //store if the camera should be centering the player
    this.center = false;
  }

  update(dt){
    //add velocity to position
    this.x += this.vel.x * dt;
    this.y += this.vel.y * dt;

    //detect if the player is far enough away that the camera should center it
    if (Math.abs(this.x-player.x) > canvas.width/3 || Math.abs(this.y-player.y) > canvas.height/3){
      this.center = true;
    }
    //if should be centering the player move and check if in center
    if (this.center == true){
      //get distance from player on each axis
      let dx = this.x - player.x;
      let dy = this.y - player.y;

      //get the angle between camera and player
      let a = Math.atan(dx/dy);

      //get the players speed so that the camera can match it. If the player is going less than 1 ppf the camera just goes 1 ppf
      let speed = Math.max(get_dist(0,0,player.vel.x,player.vel.y),.5);

      //calculate the velocity on each axis the camera should move at
      this.vel.x = Math.sin(a) * speed;
      this.vel.y = Math.cos(a) * speed;

      //reverse the direction if the player is on a certain side of the screen
      if (dy >= 0){
        this.vel.x = -this.vel.x;
        this.vel.y = -this.vel.y;
      }

      //check if the player is centered
      if (Math.abs(this.x-player.x) < 50 && Math.abs(this.y-player.y) < 50){
        this.center = false;
      }
    }

    //stop the camera if it is not centering
    else{
      this.vel.x = 0;
      this.vel.y = 0;
    }
  }
}

//create enemy class
class Enemy{
  constructor(x,y,mobile,room){
    //initialize position variables
    this.x = x;
    this.y = y;

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
  }

  update(dt){
    //update position based on velocity
    this.x += this.vel.x * dt;
    this.y += this.vel.y * dt;

    //get distance from player on each axis
    let dx = this.x - player.x;
    let dy = this.y - player.y;

    //face the player
    let a = Math.atan(dx/dy);

    //only move if enemy is mobile and not at the player
    if (this.mobile && (Math.abs(dx) > 50 || Math.abs(dy) > 50)){
      if (Math.abs(this.x-this.move_location.x) < 5 && Math.abs(this.y-this.move_location.y) < 5){
        let room_x = (Math.round(this.x/50)-(player.room.x*20)) + 10;
        let room_y = (Math.round(this.y/50)-(player.room.y*20)) + 10;

        let player_room_x = (Math.floor(player.x/50)-(player.room.x*20)) + 10;
        let player_room_y = (Math.floor(player.y/50)-(player.room.y*20)) + 10;

        let map = [];
        for (let x=0;x<20;x++){
          let l = [];
          for (let y=0;y<20;y++){
            let nn = new Node(x,y);
            if (x == room_x && y == room_y){
              nn.type = 2;
            }
            else{
              for (let i=0;i<player.room.enemies.length;i++){
                let enemies_room_x = (Math.round(player.room.enemies[i].x/50)-(player.room.x*20)) + 10;
                let enemies_room_y = (Math.round(player.room.enemies[i].y/50)-(player.room.y*20)) + 10;
                let enemies_move_location_x = (Math.round(player.room.enemies[i].move_location.x/50)-(player.room.x*20)) + 10;
                let enemies_move_location_y = (Math.round(player.room.enemies[i].move_location.y/50)-(player.room.y*20)) + 10;
                if (x == enemies_room_x && y == enemies_room_y){
                  nn.type = 4;
                }
                if (x == enemies_move_location_x && y == enemies_move_location_y){
                  nn.type = 4;
                }
              }
            }
            if (x == player_room_x && y == player_room_y){
              nn.type = 3;
            }
            if (player.room.map[x][y] == 4){
              if (nn.type == 1){
                nn.type = 4;
              }
            }
            l.push(nn);
          }
          map.push(l);
        }

        let p = pathfind(map);
        if (p != null){
          let n = p[p.length-1];
          while (n.prev_node.type != 2){
            n = n.prev_node;
          }

          this.move_location.x = (n.x-10)*50+(player.room.x*1000);
          this.move_location.y = (n.y-10)*50+(player.room.y*1000);
        }
      }

      let ndx = this.x - this.move_location.x;
      let ndy = this.y - this.move_location.y;

      a = Math.atan(ndx/ndy);

      //calculate enemy velocity
      this.vel.x = Math.sin(a)*.45;
      this.vel.y = Math.cos(a)*.45;

      //reverse it if on certain side
      if (ndy >= 0){
        this.vel.x = -this.vel.x;
        this.vel.y = -this.vel.y;
      }

      x = this.x + this.vel.x*dt;
      y = this.y + this.vel.y*dt;

      for (let i = 0; i < player.room.walls.length; i++){
        if (x - 25 < player.room.walls[i].x2 && x + 25 > player.room.walls[i].x1 && this.y - 25 < player.room.walls[i].y2 && this.y + 25 > player.room.walls[i].y1){
          this.vel.x = 0;

          if (this.x > player.room.walls[i].x1+(player.room.walls[i].x2-player.room.walls[i].x1)/2){
            this.x = player.room.walls[i].x2 + 25;
          }
          else{
            this.x = player.room.walls[i].x1 - 25;
          }
        }
        if (this.x - 25 < player.room.walls[i].x2 && this.x + 25 > player.room.walls[i].x1 && y - 25 < player.room.walls[i].y2 && y + 25 > player.room.walls[i].y1){
          this.vel.y = 0;

          if (this.y > player.room.walls[i].y1+(player.room.walls[i].y2-player.room.walls[i].y1)/2){
            this.y = player.room.walls[i].y2 + 25;
          }
          else{
            this.y = player.room.walls[i].y1 - 25;
          }
        }
      }
    }
    //if shouldn't be moving stop it
    else{
      this.vel.x = 0;
      this.vel.y = 0;
    }

    //if waited long enough to attack
    if (time > this.last_attack + 2000){
      //store the velocity for projectile
      let vel = {
        x: Math.sin(a),
        y: Math.cos(a)
      };
      //reverse if on specific side
      if (dy >= 0){
        vel.x = -vel.x;
        vel.y = -vel.y;
      }
      //attack
      this.attack(vel);
      //remember when attacked last
      this.last_attack = time;
    }

    //if has no health
    if (this.health <= 0){
      //remove enemy
      player.room.enemies.splice(player.room.enemies.indexOf(this),1)
      //drop gold
      for (let i = 0; i < Math.round(Math.random())+1; i++){
        player.room.gold.push(new Gold(this.x+Math.random()*100-50,this.y+Math.random()*100-50));
      }
    }

    if (time > this.show_health_timer + 1000){
      this.show_health = false;
    }
}


  damage(amount){
    this.health -= amount;
    this.show_health = true;
    this.show_health_timer = time;
  }

  attack(vel){
    //check for enemy type
    if (this.mobile){
      //if is in range of player
      if (get_dist(this.x,this.y, player.x,player.y) < 100){
        //damage the player
        player.damage(1);
      }
    }
    else{
      //create a new projectile
      projectiles.push(new Projectile(this.x+vel.x*60,this.y+vel.y*60,vel));
    }
  }

  render(cam){
    //get the position that the camera sees
    let x = this.x - cam.x + canvas.width/2;
    let y = this.y - cam.y + canvas.height/2;

    //draw the enemy
    c.beginPath();
    c.fillStyle = 'red';
    c.rect(x-25,y-25,50,50);
    c.fill();

    //if recently damaged
    if (this.show_health){
      //display health
      progress_bar(this.health,this.max_health, x-25, y-35, 50, 5, '#BB0000', '#000000')
    }
  }
}

class Projectile{
  constructor(x,y,vel){
    //store position
    this.x = x;
    this.y = y;

    //store velocity
    this.vel = vel;
  }

  update(dt){

    //check if any enemies
    for (let i=0;i<player.room.enemies.length;i++){
        if (Math.abs(this.x-player.room.enemies[i].x) < 50 && Math.abs(this.y-player.room.enemies[i].y) < 50){
          //damage hit enemy
          player.room.enemies[i].damage(1);
          //remove projectile
          projectiles.splice(projectiles.indexOf(this),1);
        }
    }

    for (let i = 0; i < player.room.walls.length; i++){
      let x1 = player.room.walls[i].x1;
      let x2 = player.room.walls[i].x2;
      let y1 = player.room.walls[i].y1;
      let y2 = player.room.walls[i].y2;
      if (this.x-10 < x2 && this.x+10 > x1 && this.y-10 < y2 && this.y + 10 > x1){
        console.log('working');
        projectiles.splice(projectiles.indexOf(this),1);
      }
    }

    //check if hit player
    if (Math.abs(this.x-player.x) < 50 && Math.abs(this.y-player.y) < 50){
      //damage player
      player.damage(1);
      //remove projectile
      projectiles.splice(projectiles.indexOf(this),1);
    }

    //update projectile position
    this.x += this.vel.x * dt;
    this.y += this.vel.y * dt;
  }

  render(cam){
    //get the position that the camera sees
    let x = this.x - cam.x + canvas.width/2;
    let y = this.y - cam.y + canvas.height/2;

    //draw the projectile
    c.beginPath();
    c.fillStyle = 'black';
    c.rect(x-10,y-10,20,20);
    c.fill();
  }
}

class Wall{
  constructor(x1,y1,x2,y2){
    //store position
    this.x1 = Math.min(x1,x2);
    this.y1 = Math.min(y1,y2);
    this.x2 = Math.max(x1,x2);
    this.y2 = Math.max(y1,y2);
  }

  render(cam){
    //get the position that the camera sees
    let x = this.x1 - cam.x + canvas.width/2;
    let y = this.y1 - cam.y + canvas.height/2;
    let width = this.x2-this.x1;
    let height = this.y2-this.y1;

    //draw the wall
    c.beginPath();
    c.fillStyle = 'gray';
    c.rect(x,y,width,height);
    c.fill();
    c.beginPath();
    c.strokeStyle = 'gray';
    c.rect(x,y,width,height);
    c.stroke();
  }
}

class Room{
  constructor(x,y,map){
    this.x = x;
    this.y = y;

    this.map = map.map;

    this.home = map.home;

    this.walls = [];
    this.enemies = [];
    this.gold = [];
    this.chests = [];

    this.weapon_smith = null;
    this.armor_smith = null;
    this.wizard = null;

    for (x=0;x<this.map.length;x++){
      for (y=0;y<this.map[x].length;y++){
        let rx = (x-10)*50+(this.x*1000);
        let ry = (y-10)*50+(this.y*1000);
        if (this.map[x][y] == 4){
          this.walls.push(new Wall(rx-25,ry-25,rx+25,ry+25));
        }
        else if (this.map[x][y] == 5){
          this.enemies.push(new Enemy(rx,ry,true,this));
          this.map[x][y] = 0;
        }
        else if (this.map[x][y] == 6){
          this.enemies.push(new Enemy(rx,ry,false,this));
          this.map[x][y] = 0;
        }
        else if (this.map[x][y] == 7){
          this.weapon_smith = new WeaponSmith(rx,ry);
        }
        else if (this.map[x][y] == 8){
          this.armor_smith = new ArmorSmith(rx,ry);
        }
        else if (this.map[x][y] == 9){
          this.wizard = new Wizard(rx,ry);
        }
        else if (this.map[x][y] == 10){
          this.chests.push(new Chest(rx,ry));
        }
      }
    }
  }
}

class WeaponSmith{
  constructor(x,y){
    this.x = x;
    this.y = y;

    this.speech = '';
  }
  update(){

    let dx = Math.abs(this.x - player.x);
    let dy = Math.abs(this.y - player.y);

    if (dx < 200 && dy < 200){
      this.speech = 'Press ENTER to buy weapons!';
      if (keys.includes('Enter')){
        scene = 'buy weapons';
        buy_weapons();
      }
    }
    else{
      this.speech = '';
    }
  }
  render(cam){
    //get the position that the camera sees
    let x = this.x - cam.x + canvas.width/2;
    let y = this.y - cam.y + canvas.height/2;

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

class Weapon{
  constructor(damage,speed,range,melee,name){
    this.damage = damage;
    this.speed = speed;
    this.range = range;
    this.melee = melee;
    this.name = name;

    this.cooldown = time + this.speed*200;
  }
}

class Button{
  constructor(x1,y1,x2,y2,func,args){
    this.x1 = Math.min(x1,x2);
    this.x2 = Math.max(x1,x2);
    this.y1 = Math.min(y1,y2);
    this.y2 = Math.max(y1,y2);

    this.func = func;
    this.args = args;

    this.button_cooldown = time;
  }
  pressed(){
    if (mouse.x > this.x1 && mouse.x < this.x2 && mouse.y > this.y1 && mouse.y < this.y2 && mouse.press){
      if (time > this.button_cooldown){
        this.func(this.args);
        this.button_cooldown = time+1000
      }
    }
  }
  hovered(){
    if (mouse.x > this.x1 && mouse.x < this.x2 && mouse.y > this.y1 && mouse.y < this.y2){
      return true;
    }
  }
}

class Chest{
    constructor(x,y){
      this.x = x;
      this.y = y;

      this.text = '';
    }
    update(){
      let dx = Math.abs(this.x-player.x);
      let dy = Math.abs(this.y-player.y);

      if (dx < 100 && dy < 100){
        this.text = 'Press ENTER to open!';
        if (keys.includes('Enter')){
          this.open();
          player.room.chests.splice(player.room.chests.indexOf(this),1);
        }
      }
      else{
        this.text = '';
      }
    }
    open(){
      for (let i = 0; i < Math.round(Math.random()*4+1); i++){
        player.room.gold.push(new Gold(this.x+Math.random()*100-50,this.y+Math.random()*100-50));
      }
    }
    render(cam){
      //get the position that the camera sees
      let x = this.x - cam.x + canvas.width/2;
      let y = this.y - cam.y + canvas.height/2;

      //draw the chest
      c.beginPath();
      c.fillStyle = 'brown';
      c.rect(x-25,y-25,50,50);
      c.fill();

      c.fillStyle = 'black';
      c.font = '30px Arial';
      c.fillText(this.text,x,y+45);
    }
}

class Gold{
  constructor(x,y){
    this.x = x;
    this.y = y;

    this.pickup_cooldown = time+150;
  }
  update(){
    let dx = Math.abs(this.x-player.x);
    let dy = Math.abs(this.y-player.y);

    if (dx < 70 && dy < 70){
      if (time > this.pickup_cooldown){
        player.money += 1;
        player.room.gold.splice(player.room.gold.indexOf(this),1);
      }
    }
  }
  render(cam){
    //get the position that the camera sees
    let x = this.x - cam.x + canvas.width/2;
    let y = this.y - cam.y + canvas.height/2;

    //draw the chest
    c.beginPath();
    c.fillStyle = 'gold';
    c.rect(x-10,y-10,20,20);
    c.fill();
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

function draw_text_and_amount(text,amount,x,y){
  c.textAlign = 'left';
  c.fillStyle = 'black';
  c.font = '30px Arial';
  c.fillText(text + amount,x,y);
}

function purchase_weapon(args){
  if (player.money >= args.price){
    let have = false;
    for (let i = 0; i < player.weapons.length; i++){
      if (player.weapons[i].name == args.name){
        have = true;
      }
    }
    if (!have){
      player.money -= args.price;
      player.weapons.push(new Weapon(args.damage,args.speed,args.range,args.melee,args.name));
      player.weapon = player.weapons[player.weapons.length-1];
      msg = "You purchased a " + args.name + '!';
      msg_timer = time+2000;
    }
  }
  else{
    msg = "You don't have enough money! Explore the dungeon and loot chests to find some!"
    msg_timer = time+2000;
  }
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

var mouse = {
  x: 0,
  y: 0,
  press: false
};
window.onmousemove = function(event){
  mouse.x = event.clientX;
  mouse.y = event.clientY;
};
window.onmousedown = function(event){
  mouse.press = true;
};
window.onmouseup = function(event){
  mouse.press = false;
};

//Make last loop time variable to calculate delta time
let date = new Date;
var time = date.getTime();

//make a variable to store delta time in
var dt = null;

//Make a game loop
function gameloop(){
  c.clearRect(0,0,canvas.width,canvas.height);
  //claculate delta time
  date = new Date;
  dt = date.getTime() - time;
  time = date.getTime();

  //update player and render player
  player.update(dt);
  player.render(camera);
  //display player healt

  //update and display all enemies
  for (let i=0;i<player.room.enemies.length;i++){
    player.room.enemies[i].update(dt);
    if (player.room.enemies[i]){
      player.room.enemies[i].render(camera);
    }
  }

  //update and display all projectiles
  for (let i=0;i<projectiles.length;i++){
    projectiles[i].update(dt);
    if (projectiles[i]){
      projectiles[i].render(camera);
    }
  }

  //display walls
  for (let i = 0; i < player.room.walls.length; i++){
    player.room.walls[i].render(camera);
  }

  for (let i = 0; i < player.render_rooms.length; i++){
    for (let l = 0; l < player.render_rooms[i].walls.length; l++){
      player.render_rooms[i].walls[l].render(camera);
    }
    for (let l = 0; l < player.render_rooms[i].enemies.length; l++){
      player.render_rooms[i].enemies[l].render(camera);
    }
    if (player.render_rooms[i].weapon_smith){
      player.render_rooms[i].weapon_smith.render(camera);
    }

    if (player.render_rooms[i].armor_smith){
      player.render_rooms[i].armor_smith.render(camera);
    }

    if (player.render_rooms[i].wizard){
      player.render_rooms[i].wizard.render(camera);
    }
  }

  if (player.room.weapon_smith){
    player.room.weapon_smith.update();
    player.room.weapon_smith.render(camera);
  }

  if (player.room.armor_smith){
    player.room.armor_smith.render(camera);
  }

  if (player.room.wizard){
    player.room.wizard.render(camera);
  }

  for (let i = 0; i < player.room.chests.length; i++){
    player.room.chests[i].render(camera);
    player.room.chests[i].update();
  }
  for (let i = 0; i < player.room.gold.length; i++){
    player.room.gold[i].render(camera);
    player.room.gold[i].update();
  }

  for (let i = 0; i < player.weapons.length; i++){
    c.fillStyle = 'black';
    c.textAlign = 'center';
    c.fillText(i + 1 + ': '+player.weapons[i].name,200+i*200,canvas.height-100);
    if (player.weapons[i].name == player.weapon.name){
      c.strokeStyle = 'black';
      c.beginPath();
      c.rect(150+i*200,canvas.height-150, 100, 100);
      c.stroke();
    }
  }

  //update camera
  camera.update(dt);

  progress_bar(player.health,player.max_health,50,50,300,25,'#BB0000','#000000',bar_padding=0);

  draw_text_and_amount('Money: ', player.money, 50, 125);

  if (time < player.weapon.cooldown){
    progress_bar(player.weapon.cooldown-time,player.weapon.speed*200,50,200,300,25,'#555555','#000000');
  }

  if (scene == 'game'){
    requestAnimationFrame(gameloop);
  }
}

function buy_weapons(){
  date = new Date;
  dt = date.getTime() - time;
  time = date.getTime();

  c.clearRect(0,0,canvas.width,canvas.height);

  for (let i = 0; i < weapon_buttons.length; i++){
    weapon_buttons[i].pressed();
    if (weapon_buttons[i].hovered()){
      c.fillStyle = '#DDDDDD';
      c.fillRect(weapon_buttons[i].x1,weapon_buttons[i].y1,weapon_buttons[i].x2-weapon_buttons[i].x1,weapon_buttons[i].y2-weapon_buttons[i].y1);
    }
  }

  c.fillStyle = 'black';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.font = '30px Arial';
  c.fillText('Sword',400,300);
  c.fillText('Knife',400,600);
  c.fillText('Axe',400,900);
  c.fillText('Ninja Stars',canvas.width-400,300);
  c.fillText('Throwing Knife',canvas.width-400,600);
  c.fillText('Crossbow',canvas.width-400,900);
  c.fillText('Throwing Axe',canvas.width/2,300);
  c.font = '40px Arial';
  c.fillText('Melee', 400,150);
  c.fillText('Both', canvas.width/2,150);
  c.fillText('Ranged',canvas.width-400,150);

  if (msg != ''){
    if (time < msg_timer){
      c.fillText(msg,canvas.width/2,canvas.height-100);
    }
    else{
      msg = '';
    }
  }


  if (keys.includes('Escape')){
    scene = 'game';
    gameloop();
  }

  if (scene == 'buy weapons')
    requestAnimationFrame(buy_weapons);
}

function get_levels(){
  return   {
      home_levels: {
        home:{
          map:[[4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
           home: true
        },
        weapon_smith:{
          map:[[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4]],
           home: true
        },
        armor_smith:{
          map:[[4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]],
           home: true
        },
        wizard:{
          map:[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]],
           home: true
        },
        entrance:{
          map:[[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]],
           home: true
        },
        boss_entrance:{
          map:[[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
               [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4]],
           home: true
        }
      },
      dungeon_levels: [
        {map:[[4,4,4,4,4,4,4,4,4,0,0,4,4,4,4,4,4,4,4,4],
              [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
              [4,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
              [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
              [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
              [4,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,4],
              [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
              [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
              [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
              [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
              [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
              [4,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
              [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
              [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
              [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
              [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
              [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
              [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
              [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
              [4,4,4,4,4,4,4,4,4,0,0,4,4,4,4,4,4,4,4,4]],
          home: false
        }
      ]
    }
}
var level_data = get_levels();
rooms = [
  new Room(0,0,JSON.parse(JSON.stringify(level_data.home_levels.home))),
  new Room(1,0,JSON.parse(JSON.stringify(level_data.home_levels.armor_smith))),
  new Room(0,1,JSON.parse(JSON.stringify(level_data.home_levels.weapon_smith))),
  new Room(1,1,JSON.parse(JSON.stringify(level_data.home_levels.wizard))),
  new Room(0,-1,JSON.parse(JSON.stringify(level_data.home_levels.entrance))),
  new Room(-1,0,JSON.parse(JSON.stringify(level_data.home_levels.boss_entrance)))
]
for (let x = 0; x < 20; x++){
  for (let y = 0; y < 20; y++){
    let taken = false;
    for (let i = 0; i < rooms.length; i++){
      if (rooms[i].x == x-10 && rooms[i].y == y-10){
        taken = true;
      }
    }
    if (taken == false){
      let level = Math.floor(Math.random()*level_data.dungeon_levels.length);
      rooms.push(new Room(x-10,y-10,JSON.parse(JSON.stringify(level_data.dungeon_levels))[level]));
    }
  }
}

var weapon_buttons = [
  new Button(300,200,500,400,purchase_weapon,{damage:2,speed:2,range:100,melee:true,price:50,name:'Sword'}),
  new Button(300,500,500,700,purchase_weapon,{damage:2,speed:1,range:50,melee:true,price:75,name:'Knife'}),
  new Button(300,800,500,1000,purchase_weapon,{damage:6,speed:4,range:200,melee:true,price:100,name:'Axe'}),
  new Button(canvas.width-500,200,canvas.width-300,400,purchase_weapon,{damage:1,speed:2,range:100,melee:false,price:50,name:'Ninja Stars'}),
  new Button(canvas.width-500,500,canvas.width-300,700,purchase_weapon,{damage:2,speed:2,range:100,melee:false,price:75,name:'Throwing Knife'}),
  new Button(canvas.width-500,800,canvas.width-300,1000,purchase_weapon,{damage:5,speed:3,range:100,melee:false,price:100,name:'Crossbow'}),
  new Button(canvas.width/2-100,200,canvas.width/2+100,400,purchase_weapon,{damage:5,speed:3,range:100,melee:100,price:150,name:'Throwing Axe'})
];

var msg = '';
var msg_timer = null;

//initialize player class
var player = new Player();

//initialize camera class
var camera = new Camera();

//initialize the projectiles list
var projectiles = [];

var scene = 'game';

//initialize the game loop
gameloop();
