# n-dimensional space — representation test

two objects, **1** and **2**, each set by n parameters (**a**, **b**, **c**, …), values from 0 to 1. each
parameter is an axis, so each object is a point in n-dimensional space.

you look at that space through a **room**: a 3d slice cut through it. everything is drawn as its shadow
in that room. there are two ways to move:

- **inside the room** (ordinary 3d): orbit, pan, zoom.
- **the room itself, through n-d**: tilt it toward a parameter so that parameter comes into view, and
  others fade out to make space.

the first 2d version (a flat plane instead of a room) is in `v1-2d/`.

## run

es modules + three.js from a cdn, no build step. it needs a local static server, e.g.
`python3 -m http.server` in this folder.

## what you're looking at

- **axes**: each parameter's 0 → 1 range through the centre of the space, brighter at the 1 end. long =
  mostly in the room; short = mostly hidden; a dot at the centre = completely hidden.
- **hypercube** (n ≤ 10): every possible object; corners are where each parameter is 0 or 1. at n = 4
  this is the classic tesseract shadow.
- **build-up paths**: each object's position as a walk from the all-zero corner, one parameter at a
  time: the point is literally the sum of its one-dimensional values. hover a parameter to light up its
  step.
- **hidden depth**: a sphere around each object, radius = how far it sits from the room, in directions
  the room can't show.
- **crowd**: random other objects, coloured by their *true* n-d distance from object 1 (warm = near).
  lines go to the 5 truly-nearest. tilt the room and watch how often "looks close" ≠ "is close"; raise n
  and watch the nearest/farthest ratio creep toward 1 (in high dimensions everything is about equally far).
- **hud**: the true distance versus the distance in the room. a projection can only shrink a distance,
  so what you see is ≤ the truth; it's exact when the room contains the 1–2 line.

## rotations

n-d space has n(n−1)/2 planes to rotate in. with a 3d room: 3 of them just orbit the room, 3(n−3) tilt
it into hidden parameters (the ones that change what you see), and (n−3)(n−4)/2 only shuffle hidden
parameters among themselves, with no visible change at all.

## controls

| action | what it does |
|---|---|
| drag / right-drag / scroll | orbit / pan / zoom inside the room |
| drag an axis tip | tilts the room so that parameter points where you drag it |
| **show / hide** (per parameter) | tilts the room to bring that parameter fully in, or push it out |
| **face 1–2** (`f`) | turns the room to hold the 1–2 line, then keeps it there while you edit values: the distance shown is exact |
| **grand tour** (`space`) | drifts through random rooms on its own |
| **reset** (`r`) | a, b, c along x, y, z; everything else hidden |
| **zoom to fit** (`z`) | frames everything |

## files

- `src/nd.js`: the n-d math: frames, projection, axis dragging (the "manual tour"), alignment, transitions
- `src/view.js`: three.js scene, labels, hud, pointer input
- `src/panel.js`: the side panel
- `src/constants.js`: limits and parameter names
- `app.js`: state, actions, animation loop
