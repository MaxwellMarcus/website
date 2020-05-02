from tkinter import *
import json

with open('level_data.json') as f:
    level_data = json.load(f)

root = Tk()

canvas = Canvas(root,width=1400,height=1000)
canvas.pack()

walls = []
enemies = []
chests = []

map = []
for x in range(20):
    l = []
    for y in range(20):
        l.append(0)
    map.append(l)

type = 4


class Mouse:
    def __init__(self):
        self.x = 0
        self.y = 0
        self.pressed = False

class Wall:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def render(self):
        canvas.create_rectangle(self.x*50,self.y*50,self.x*50+50,self.y*50+50,fill='black')

class Enemy:
    def __init__(self, x, y, mobile):
        self.x = x
        self.y = y

        self.mobile = mobile

    def render(self):
        if self.mobile:
            canvas.create_rectangle(self.x*50,self.y*50,self.x*50+50,self.y*50+50, fill='red')
        else:
            canvas.create_rectangle(self.x*50,self.y*50,self.x*50+50,self.y*50+50, fill='orange')

class Chest:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def render(self):
        canvas.create_rectangle(self.x*50,self.y*50,self.x*50+50,self.y*50+50, fill = 'brown')

def mouse_move(event):
    mouse.x = event.x
    mouse.y = event.y

def mouse_press(event):
    mouse.x = event.x
    mouse.y = event.y

    mouse.pressed = True

def mouse_release(event):
    mouse.x = event.x
    mouse.y = event.y

    mouse.pressed = False

def key_press(event):
    global keys
    if not event.keysym in keys:
        keys.append(event.keysym)

def key_release(event):
    while event.keysym in keys:
        keys.remove(event.keysym)

def save():
    global popup
    with open('level_data.json', 'w') as data:
        json.dump(level_data, data)
    if popup:
        popup.destroy()
        popup = None


mouse = Mouse()
keys = []

root.bind('<Motion>', mouse_move)
root.bind('<Button-1>',mouse_press)
root.bind('<ButtonRelease-1>',mouse_release)
root.bind('<KeyPress>',key_press)
root.bind('<KeyRelease>',key_release)

popup = None

while True:
    canvas.delete(ALL)

    for i in walls:
        i.render()

    for i in enemies:
        i.render()

    for i in chests:
        i.render()

    if '0' in keys:
        type = 3

    if '1' in keys:
        type = 4

    if '2' in keys:
        type = 5

    if '3' in keys:
        type = 6

    if '4' in keys:
        type = 10

    if 's' in keys:
        if not popup:
            new_map = {"map":map,"home":0}
            level_data['dungeon_levels'].append(new_map)
            popup = Tk()
            popup.wm_title('Save Level')
            label = Label(popup,text='Confirm Save')
            label.pack()
            button = Button(popup,text='save',command=save)
            button.pack()

    if 'c' in keys:
        walls = []
        enemies = []
        chests = []

        map = []
        for x in range(20):
            l = []
            for y in range(20):
                l.append(0)
            map.append(l)


    x = mouse.x // 50
    y = mouse.y // 50
    if (x < 20 and x >= 0 and y < 20 and y >= 0):
        canvas.create_rectangle(x*50,y*50,x*50+50,y*50+50,outline='green',width=4)

    canvas.create_rectangle(0,0,1000,1000,outline='black',width=10)

    canvas.create_text(1100,100,font=('TkTextFont',20),anchor=W, text = '1 : Walls')
    canvas.create_text(1100,200,font=('TkTextFont',20),anchor=W, text = '2 : Mobile Enemies')
    canvas.create_text(1100,300,font=('TkTextFont',20),anchor=W, text = '3 : Stationary Enemies')
    canvas.create_text(1100,400,font=('TkTextFont',20),anchor=W, text = '4 : Chests')
    canvas.create_text(1100,500,font=('TkTextFont',20),anchor=W, text = '0 : Erase')
    canvas.create_text(1100,600,font=('TkTextFont',20),anchor=W, text = 'S : Save')
    canvas.create_text(1100,700,font=('TkTextFont',20),anchor=W, text = 'C : Clear')

    if type == 4:
        canvas.create_rectangle(1050,50,1350,150,width=3)

    if type == 5:
        canvas.create_rectangle(1050,150,1350,250,width=3)

    if type == 6:
        canvas.create_rectangle(1050,250,1490,350,width=3)

    if type == 10:
        canvas.create_rectangle(1050,350,1350,450,width=3)

    if type == 3:
        canvas.create_rectangle(1050,450,1350,550,width=3)

    if mouse.pressed:

        for i in walls:
            if i.x == x and i.y == y:
                walls.remove(i)

        for i in enemies:
            if i.x == x and i.y == y:
                enemies.remove(i)

        for i in chests:
            if i.x == x and i.y == y:
                chests.remove(i)

        if type == 3:
            if x >= 0 and x < 20 and y >= 0 and y < 20:
                map[x][y] = 0

        if type == 4:
            if x >= 0 and x < 20 and y >= 0 and y < 20:
                walls.append(Wall(x,y))

                map[x][y] = 4

        if type == 5:
            if x >= 0 and x < 20 and y >= 0 and y < 20:
                enemies.append(Enemy(x,y,True))

                map[x][y] = 5

        if type == 6:
            if x >= 0 and x < 20 and y >= 0 and y < 20:
                enemies.append(Enemy(x,y,False))

                map[x][y] = 6

        if type == 10:
            if x >= 0 and x < 20 and y >= 0 and y < 20:
                enemies.append(Chest(x,y))

                map[x][y] = 10



    root.update()
