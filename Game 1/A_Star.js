class Node{
  constructor(x,y){
    this.type = 1;
    /*
    1: normal
    2: start
    3: end
    4: wall
    */
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


function evaluate_new_node(x,y,n,map){
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
  if (x >= 0 && y >= 0 && x < map.length && y < map[0].length){
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

function pathfind(map){
  nodes = []
  for (x=0;x<map.length;x++){
    for (y=0;y<map[x].length;y++){
      if (map[x][y].type == 2){
        nodes.push(map[x][y])
        nodes[0].prev_node = nodes[0]
      }
      if (map[x][y].type == 3){
        end_node = map[x][y];
      }
    }
  }
  final_nodes = []
  if (nodes.length > 0){
    while (nodes[0].type != 3){
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
        evaluate_new_node(x,y,n,map);

        x = n.x - 1;
        evaluate_new_node(x,y,n,map);

        x = n.x;
        y = n.y + 1;
        evaluate_new_node(x,y,n,map);

        y = n.y - 1;
        evaluate_new_node(x,y,n,map);

        x = n.x + 1;
        y = n.y + 1;
        evaluate_new_node(x,y,n,map);

        x = n.x - 1;
        x = n.y - 1;
        evaluate_new_node(x,y,n,map);

        x = n.x - 1;
        y = n.y + 1;
        evaluate_new_node(x,y,n,map);

        x = n.x + 1;
        y = n.y - 1;
        evaluate_new_node(x,y,n,map);
      }
      nodes = sort(nodes);
      if (nodes.length == 0){
        break;
      }
    }
    if (nodes.length > 0){
      final_nodes.push(nodes[0]);
      return final_nodes
    }
  }
}
