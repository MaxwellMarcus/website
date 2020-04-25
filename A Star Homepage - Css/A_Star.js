var canvas = document.querySelector('canvas');

var screen_width = window.innerWidth;
var screen_height = window.innerHeight-window.innerHeight/16*3;

canvas.width = screen_width;
canvas.height = screen_height;

var c = canvas.getContext('2d');

class Node{
  constructor(x,y){
    this.type = 1;
    this.x = x;
    this.y = y;

    this.prev_node = null;

    this.path_length = 0;
    this.end_dist = 0;
  }
  get_score(){
    return this.end_dist + this.path_length;
  }
  duplicate(){
    let new_node = new Node(this.x,this.y);
    new_node.type = this.type;

    return new_node;
  }
}

function sort(l){
  let sorted = [];

  let added = false;

  for (let i = 0;i < l.length;i++){
    added = false;
    for (let j = 0;j < sorted.length;j++){
      if (l[i].get_score() < sorted[j].get_score()){
        sorted.splice(j,0,l[i]);
        added = true;
        break
      }
    }
    if (added == false){
      sorted.push(l[i]);
    }
  }
  return sorted;
}

function get_dist(x1,y1,x2,y2){
  return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
}

function make_box(x1,y1,x2,y2){
  for (let x=0;x<Math.abs(x2-x1);x++){
    for (let y = 0;y<Math.abs(y2-y1);y++){
      map[x+x1][y+y1].type = 4;
    }
  }
}

function reset_map(){
  let nm = [];
  for (let x = 0;x<width;x++){
    let l = [];
    for (let y = 0;y<height;y++){
      n = new Node(x,y);
      if (x < map.length && y < map[0].length){
        n.type = map[x][y].type;
      }
      l.push(n);
    }
    nm.push(l);
  }

  map = [...nm];

  start_node = [0,0];
  end_node = [width-1,height-1];

  map[start_node[0]][start_node[1]].type = 2;
  map[end_node[0]][end_node[1]].type = 2;

  nodes = [map[start_node[0]][start_node[1]]];
  nodes[0].prev_node = nodes[0];

  final_nodes = [];
}

function new_map(){
  map = [];
  for (let x = 0;x<width;x++){
    let l = [];
    for (let y = 0;y<height;y++){
      n = new Node(x,y);
      l.push(n);
    }
    map.push(l);
  }

  start_node = [0,0];
  end_node = [width-1,height-1];

  map[start_node[0]][start_node[1]].type = 2;
  map[end_node[0]][end_node[1]].type = 2;

  nodes = [map[start_node[0]][start_node[1]]];
  nodes[0].prev_node = nodes[0];

  final_nodes = [];

  wall_num = Math.floor(Math.random()*20+20);
  for (let i = 0;i < wall_num; i++){
    x1 =  Math.floor(Math.random()*(width-1));
    y1 = Math.floor(Math.random()*(height-1));
    x2 = x1 + Math.floor(Math.random()*4+1);
    y2 = y1 +  Math.floor(Math.random()*4+1);
    if (x2 > width){
      x2 = width;
    }
    if (y2 > height){
      y2 = height;
    }
    if (x2 != end_node[0] || y2 != end_node[1]){
      make_box(x1,y1,x2,y2);
    }
  }
  if (findable() == false){
    new_map();
  }
  else{
    nodes = [map[start_node[0]][start_node[1]]];
    nodes[0].prev_node = nodes[0];

    final_nodes = [];
  }

}


function evaluate_new_node(x,y,n){
  let k = null;
  let in_list = false;

  for (j=0;j<nodes.length;j++){
    let i = nodes[j];
    if (x == i.x && y == i.y){
      in_list = true;
      k = j;
      break;
    }
  }
  if (in_list == false){
    for (j=0;j<final_nodes.length;j++){
      i = final_nodes[j];
      if (x == i.x && y == i.y){
        in_list = true;
        break;
      }
    }
  }
  if (x >= 0 && y >= 0 && x < width && y < height){
    let nn = map[x][y].duplicate();
    if (nn.type != 4){
      if (nn.x != n.prev_node.x || nn.y != n.prev_node.y){
        nn.path_length = n.path_length + 1;
        nn.end_dist = get_dist(x,y,end_node[0],end_node[1]);
        nn.prev_node = n;

        if (k != null){
          if (nn.get_score() < nodes[k].get_score()){
            nodes.splice(k,1);
          }
        }
        if (in_list == false){
          nodes.push(nn);
        }
      }
    }
  }
}

function update(){
  c.clearRect(0,0,screen_width,screen_height);
  c.fillStyle = '#333333';
  c.lineWidth = 1
  if (nodes.length > 0){
    if (nodes[0].x != end_node[0] || nodes[0].y != end_node[1]){
      n = nodes[0];
      nodes.splice(nodes.indexOf(n),1);
      let in_list = false;
      for (j=0;j<final_nodes.length;j++){
        let i = final_nodes[j];
        if (i.x == n.x && i.y == n.y){
          in_list = true;
        }
      }
      if (in_list == false){
        final_nodes.push(n);

        let x = n.x + 1;
        let y = n.y;
        evaluate_new_node(x,y,n);

        x = n.x - 1;
        evaluate_new_node(x,y,n);

        x = n.x;
        y = n.y + 1;
        evaluate_new_node(x,y,n);

        y = n.y - 1;
        evaluate_new_node(x,y,n);
      }
      nodes = sort(nodes);

      for (x = 0; x < width;x++){
        for (y = 0;y < height;y++){
          in_list = false;
          x1 = x*pixel_x+margin_x-1;
          y1 = y*pixel_y+margin_y-1;
          c.strokeStyle = 'black';
          for (j=0;j<final_nodes.length;j++){
            i = final_nodes[j];
            if (i.x == x && i.y == y){
              c.fillStyle = 'red';
              c.beginPath();
              c.rect(x1,y1,pixel_x+1,pixel_y+1);
              c.fill();
            }
          }
          for (j=0;j<nodes.length;j++){
            i = nodes[j];
            if (i.x == x && i.y == y){
              c.fillStyle = 'green';
              c.beginPath();
              c.rect(x1,y1,pixel_x+1,pixel_y+1);
              c.fill();
            }
          }
          if (x == start_node[0] && y == start_node[1]){
            c.fillStyle = 'blue';
            c.beginPath();
            c.rect(x1,y1,pixel_x+1,pixel_y+1);
            c.fill();
          }
          else if (x == end_node[0] && y == end_node[1]){
            c.fillStyle = 'orange';
            c.beginPath();
            c.rect(x1,y1,pixel_x+1,pixel_y+1);
            c.fill();
          }
          else if (map[x][y].type == 4){
            c.fillStyle = 'gray';
            c.beginPath();
            c.rect(x1,y1,pixel_x+1,pixel_y+1);
            c.fill();
          }
        }
      }
      reset = false;
    }
    else{
      if (reset == false){
        reset = true;
        setTimeout(new_map,2000);
      }

      var path = [nodes[0]];
      var prev_node = nodes[0].prev_node;
      while (prev_node.x != start_node[0] || prev_node.y != start_node[1]){
        path.push(prev_node);
        prev_node = prev_node.prev_node;
      }

      for (x = 0; x < width;x++){
        for (y = 0;y < height;y++){
          in_list = false;
          x1 = x*pixel_x+margin_x-1;
          y1 = y*pixel_y+margin_y-1;
          c.strokeStyle = 'black'
          for (j=0;j<path.length;j++){
            i = path[j];
            if (i.x == x && i.y == y){
              c.fillStyle = 'cyan';
              c.beginPath();
              c.rect(x1,y1,pixel_x+1,pixel_y+1);
              c.fill();
              in_list = true;
            }
          }
          if (x == start_node[0] && y == start_node[1]){
            c.fillStyle = 'blue';
            c.beginPath();
            c.rect(x1,y1,pixel_x+1,pixel_y+1);
            c.fill();
          }
          else if (x == end_node[0] && y == end_node[1]){
            c.fillStyle = 'orange';
            c.beginPath();
            c.rect(x1,y1,pixel_x+1,pixel_y+1);
            c.fill();
          }
          else if (map[x][y].type == 4){
            c.fillStyle = 'gray';
            c.beginPath();
            c.rect(x1,y1,pixel_x+1,pixel_y+1);
            c.fill();
          }
        }
      }
    }
  }
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  let font_size = screen_width/15;
  c.font = 'bolder ' + font_size + 'px Arial';
  c.fillStyle = 'rgba(64,64,64)';
  c.fillText('Welcome',screen_width/2,screen_height/8*3);

  font_size = screen_height/30
  c.font = 'bolder ' + font_size + 'px Arial';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('A* Pathfinding Algorithm',screen_width/2,screen_height/16*15)

  requestAnimationFrame(update);
}

function findable(){
  while (nodes[0].x != end_node[0] || nodes[0].y != end_node[1]){
    n = nodes[0];
    nodes.splice(nodes.indexOf(n),1);
    let in_list = false;
    for (j=0;j<final_nodes.length;j++){
      let i = final_nodes[j];
      if (i.x == n.x && i.y == n.y){
        in_list = true;
      }
    }
    if (in_list == false){
      final_nodes.push(n);

      let x = n.x + 1;
      let y = n.y;
      evaluate_new_node(x,y,n);

      x = n.x - 1;
      evaluate_new_node(x,y,n);

      x = n.x;
      y = n.y + 1;
      evaluate_new_node(x,y,n);

      y = n.y - 1;
      evaluate_new_node(x,y,n);
    }
    nodes = sort(nodes);
    if (nodes.length == 0){
      return false;
    }
  }
  return true;
}

var mouse_x = 0;
var mouse_y = 0;

var mouse_click = false;

console.log(canvas.top);

window.addEventListener('resize',function (){
  screen_width = window.innerWidth;
  screen_height = window.innerHeight-window.innerHeight/16*3;


  canvas.width = screen_width;
  canvas.height = screen_height;

  map_width = Math.floor(screen_width*.75);
  map_height = Math.floor(screen_height*.75);

  if (screen_height < screen_width){
    pixel_x = screen_height/20;
    pixel_y = screen_height/20;
    margin_x = Math.floor(screen_width/8);
    margin_y = 0;
  }
  else{
    pixel_x = screen_width/20;
    pixel_y = screen_width/20;
    margin_x = Math.floor(screen_width/8);
    margin_y = 0;
  }

  width = Math.floor(map_width/pixel_x);
  height = Math.floor(map_height/pixel_x);

  reset_map();
});

window.addEventListener('mousemove',function (event){
  mouse_x = event.x;
  mouse_y = event.y;
});
window.onmouseup = function (){
  mouse_click = false;
};

window.onmousedown = function(){
  mouse_click = true;
};

var map = [];

var map_width = Math.floor(screen_width*.75);
var map_height = Math.floor(screen_height*.75);

if (screen_height < screen_width){
  var pixel_x = screen_height/20;
  var pixel_y = screen_height/20;
  var margin_x = Math.floor(screen_width/8);
  var margin_y = 0;
}
else{
  var pixel_x = screen_width/20;
  var pixel_y = screen_width/20;
  var margin_x = Math.floor(screen_width/8);
  var margin_y = 0;
}

var width = Math.floor(map_width/pixel_x);
var height = Math.floor(map_height/pixel_x);

for (let x = 0;x<width;x++){
  let l = [];
  for (let y = 0;y<height;y++){
    n = new Node(x,y);
    l.push(n);
  }
  map.push(l);
}

var start_node = [0,0];
var end_node = [width-1,height-1];


map[start_node[0]][start_node[1]].type = 2;
map[end_node[0]][end_node[1]].type = 2;

var nodes = [map[start_node[0]][start_node[1]]];
nodes[0].prev_node = nodes[0];

final_nodes = [];

var reset = false;

new_map();

update();
