# n-dimensional space — representation test

two objects, **a** and **b**, each described by n traits (values from 0 to 1, like "extroversion: 70%").
each trait is an axis, so each object is a point in n-dimensional space. the screen is a flat 2d
**camera plane** inside that space: every point is drawn as its shadow on the plane. to navigate, you tilt
the plane through the n dimensions.

## run

it uses es modules, so it needs a local static server (opening `index.html` as a file won't work), e.g.
`python3 -m http.server` inside this folder, then open the printed address.

## what you're looking at

- **axes**: each trait's full 0 → 1 range, drawn through the centre of the space. a long axis is mostly
  facing you; a short one points away from the screen, mostly hidden; a dot in the centre is invisible.
- **camera gizmo** (bottom left): the same axes at a fixed size, inside a unit circle. on the rim = fully
  in view, in the middle = hidden.
- **hypercube** (n ≤ 10): the space of every possible object, with corners where each trait is 0% or 100%.
- **build-up paths**: each object's position as a walk from the all-zero corner, one trait at a time, so
  the point is literally the sum of its one-dimensional values.
- **hidden depth** (dashed rings): how far each point sits off the camera plane, in directions the screen
  can't show.
- **hud**: the true distance versus the distance on screen. a projection can only shrink a distance, so
  what you see is always ≤ the truth, and it's exact once the camera plane contains the a–b line.

## navigating

| action | what it does |
|---|---|
| drag an axis tip (main view or gizmo) | tilts the camera so that trait points where you drag it; pull hidden axes out of the centre |
| drag anywhere else | spins the camera inside its own plane |
| scroll | zoom |
| **face a–b** (`f`) | turns the camera to the plane holding a, b and the centre, then keeps it there while you edit values: the distance shown is exact |
| **grand tour** (`space`) | drifts through random planes on its own |
| **reset** (`r`) | back to a plain scatter plot of the first two traits |
| **zoom to fit** (`z`) | frames both points |

## files

- `src/nd.js`: the n-d math: camera frames, projection, axis dragging (the "manual tour"), transitions
- `src/view.js`: canvas drawing and pointer input
- `src/panel.js`: the side panel
- `src/constants.js`: limits and default trait names
- `app.js`: state, actions, animation loop
