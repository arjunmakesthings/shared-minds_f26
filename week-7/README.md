# walking through pixel space

walk around a room, and the steps you take move you through the space of every possible 100x100 rgb image. an arduino nano 33 iot counts your steps and tracks which way you're facing. a p5 sketch in the browser shows the image at the spot you're standing on, plus a map of your path.

## the idea

a 100x100 image has 30,000 channel values (r, g, b for each of 10,000 pixels), so there are about 10^72,247 possible images. the room is a 2-d grid of cells, one cell per step. every cell is a fixed address in that space and holds exactly one image, and every possible image sits at exactly one cell. the same cell always shows the same image.

the grid is finite and matches the images one to one. 256^30000 = 2^240000, so the grid is 2^120000 cells wide and 2^120000 cells tall (each coordinate is a 120,000-bit number, about 36,000 digits). you start at the centre, so you can walk in any direction. the edges are about 2^119999 steps away, which no one can reach. the cells you can walk to are a vanishing sliver of the whole grid, and so are the images they hold.

this means any picture you can imagine, including a photo of you, has its own cell. you just can't walk to it.

the images are scrambled across the grid, so neighboring cells hold unrelated images. almost all of them look like static. a recognizable picture exists somewhere in the space, but it is astronomically far from any cell you could walk to.

## what's in this folder

| folder | what it is |
| --- | --- |
| `position-test/` | the main nano sketch. counts steps, tracks heading, prints `x`, `y`, `heading` over serial |
| `pixel-space/` | the p5 page (`index.html` and `sketch.js`). reads the nano over web serial, shows the image and the path map |
| `step-count-test/` | an earlier stage: just counts steps from the accelerometer, for the serial plotter |
| `basic-sensor-test/` | the first test: reads accel, magnetometer and temperature straight from the lsm303 registers |

## hardware

- arduino nano 33 iot
- lsm303dlhc breakout (accelerometer and magnetometer in one chip)

wiring (i2c):

| lsm303dlhc | nano 33 iot |
| --- | --- |
| sda | a4 |
| scl | a5 |
| vin / 3v3 | 3.3v |
| gnd | gnd |

the nano is 3.3v logic, so don't power the breakout from 5v unless it has level shifting. leave any `drdy` or `int` pins unconnected.

the nano's built-in gyroscope (an lsm6ds3 at i2c address `0x6a`) needs no wiring.

**mounting:** hold or strap the board **flat** (top facing up), with the board's y axis pointing the way you walk. keep the nano and the lsm303 firmly attached to each other. the gyro is on the nano, and the step detection is on the lsm303.

## libraries

install from the arduino ide's library manager:

- **Adafruit LSM303DLHC** (provides `Adafruit_LSM303_U.h`), plus its dependency **Adafruit Unified Sensor**
- **Arduino_LSM6DS3** (the nano 33 iot's built-in imu)

the p5 page loads p5.js from a cdn, so it needs an internet connection.

notes:
- the `Adafruit LSM303DLH Mag` library defines the same names as the dlhc library (`lsm303MagGain` and so on). including both headers in one sketch gives "redeclaration" errors. the current sketches don't use it.
- the nano 33 iot's imu is the lsm6ds3. the `Arduino_LSM6DSOX` library is for a different board and won't work.

## the nano sketch: `position-test/position-test.ino`

### what it does

1. **steps.** it takes the magnitude of the lsm303's acceleration, removes gravity with a slow average, and smooths it. a step starts when the signal rises above `STEP_THRESHOLD` and ends when it falls below `RELEASE_THRESHOLD`. the gap between those two thresholds (hysteresis), a minimum time between steps, and a check that the board is actually moving all keep small movements from counting.
2. **heading.** it reads rotation around the vertical axis from the nano's built-in gyro and adds it up over time. the gyro's constant error is measured and subtracted during the 3 s startup hold. heading is in degrees clockwise from the direction you started facing.
3. **position.** each step moves you `STEP_LENGTH_M` in the direction you're facing:
   - `x += STEP_LENGTH_M * sin(heading)`
   - `y += STEP_LENGTH_M * cos(heading)`

   so facing your start direction and walking raises `y`. turning around and walking lowers it (that's "back"). turning right and walking raises `x`.

### startup

1. open the serial monitor at **115200 baud**, or use the p5 page.
2. **hold still for 3 s, facing the direction you want to be "forward".** this calibrates the gyro. wherever you stand is (0, 0), and the way you face is `+y`.
3. walk.

### output

one line per step:

```
x: 1.23; y: 4.56; heading: 90; going: right
```

| field | meaning |
| --- | --- |
| `x` | meters to your right of the start (negative = left) |
| `y` | meters forward of the start (negative = behind) |
| `heading` | degrees you've turned clockwise from the start direction (0 to 360) |
| `going` | `forward` (within 45° of the start direction), `right`, `back`, or `left` |

### settings at the top of the file

| setting | what it does |
| --- | --- |
| `STEP_THRESHOLD` | how big a bump counts as a step. raise it if small movements count, lower it if real steps are missed |
| `RELEASE_THRESHOLD` | the signal must fall below this before the next step can count |
| `MIN_STEP_GAP_MS` | minimum time between steps |
| `MIN_ACTIVITY` | steps are ignored while the board is basically still |
| `STEP_LENGTH_M` | length of one step in meters. calibrate it by walking a known distance (for example 10 m) and dividing by the number of steps |
| `HEADING_SIGN` | set to `-1.0` if turning right makes the heading go the wrong way |
| `GYRO_DEADBAND` | rotation slower than this (deg/s) is ignored, so noise doesn't add up |
| `DEBUG_HEADING` | `true` prints `gz`, the turn angle and the accelerometer z value every 200 ms. while turning slowly in place, `turned right` should climb from 0 to 360. `az` near 9.8 means the board is flat |

## the p5 page: `pixel-space/`

### what you see

- **left:** the image at your current cell, drawn as big blocky pixels. above it are the cell coordinates (counted from the centre of the grid, where you start), a short id for the image (the first 8 bytes of the image as 16 hex digits), and the total number of possible images.
- **right:** a map of your path.
  - the grid zooms out to fit everything you've walked, with the start marked and up = forward.
  - the trail is see-through. old stretches are faint blue and recent ones brighter yellow, so walking the same stretch again looks brighter.
  - cells you've stood on are dots. a dot turns **red** (and grows) each time you come back to the cell, so backtracking is visible.
  - axis numbers are in cells, and the direction names are on the edges.
  - under the map: your last move, your cell `x, y`, your position in meters, moves, cells visited and revisits.

### how a cell becomes an image

1. **the cell becomes a block of bytes.** the cell `(i, j)` is moved to the centre of the grid: `2^119999 + i` and `2^119999 + j`. each is written as a 15,000-byte number (`coordBytes`). together they form one 30,000-byte block, `i` in the left half and `j` in the right half.
2. **the block is shuffled.** `permute` runs a feistel network for `ROUNDS` = 8 rounds. each round xors the left half with a byte stream made from the right half (the right half is hashed into four 32-bit words, which seed `sfc32`), and then swaps the halves.
3. **the bytes are the image.** the shuffled block is 30,000 bytes: byte `3p`, `3p+1`, `3p+2` are r, g, b of pixel `p`, with alpha fixed at 255.

nothing is stored, so the same cell always gives the same image. `WORLD_SEED` goes into the stream, so changing it moves the images around the grid, but the set of images stays the same.

**why this is one to one:** a feistel round replaces the left half with `left xor stream(right)` and swaps the halves. to undo it, swap back and xor the same stream again. this works whatever the stream function is, so every round, and so the whole shuffle, is a one-to-one map from blocks to blocks. every cell gives a different image, and every image comes from some cell. `permute(..., true)` runs the rounds backwards, so given any image it can find its cell (there is no button for that in the page).

a cell is `CELL_M` meters wide (0.7, the same as `STEP_LENGTH_M`). your position is rounded to the nearest cell, so the image changes about once per step. cell numbers in the page are plain numbers counted from the centre. they would only lose precision past 2^53 cells from the start, which can't be walked.

what was checked (by running the actual `sketch.js` code in node):

- **one to one, exhaustively:** with the halves cut down to 1 byte each, all 65,536 cells gave 65,536 different outputs, and running the shuffle backwards returned every cell. this was done for two different `WORLD_SEED` values.
- **one to one, sampled:** with 2-byte halves, 399,974 random cells gave no duplicate outputs and all of them round-tripped.
- **full size:** `coordBytes` matched exact big-integer arithmetic for 315 values, including values near plus and minus 2^53. for 7 cells (including ones about 2^40 cells away), rendering a cell, reading the pixels back as 30,000 bytes and running the shuffle backwards returned exactly that cell.
- **no visible structure:** neighbouring cells differ in 99.61% (along `i`) and 99.60% (along `j`) of channel values (ideal 99.61%). byte values in 5 cells pass a chi-square test for uniformity. `(a, b)`, its swap `(b, a)` and its mirror `(-a, -b)` all give different images, and there were no duplicate images among 961 cells.
- **speed:** about 1.1 ms per cell in node.

limits of this: one to one at full size follows from the construction. it can't be checked cell by cell, because there are 2^240000 of them. the statistical checks cover the cells tested, not the whole grid. the shuffle is not a cryptographic permutation and nothing here claims it behaves like a perfectly random one. `HALF` and `ROUNDS` shouldn't be changed: `HALF` = 15,000 is exactly what makes the grid match the 100x100x3 bytes of an image, and `ROUNDS` has to be even.

### running it

web serial only works in chrome or edge, and only on `localhost` or `https`. serve the `pixel-space` folder yourself (for example with any simple local web server) and open it.

1. close the arduino ide's serial monitor, so the port is free.
2. open the page and click **connect nano**, then choose the board.
3. follow the nano's messages, shown in the status line under the canvas.

to try the page without the board, press the **arrow keys**. each press moves you one cell (up = forward).

### settings at the top of `sketch.js`

| setting | what it does |
| --- | --- |
| `CELL_M` | cell size in meters. keep it equal to `STEP_LENGTH_M` in the nano sketch |
| `WORLD_SEED` | changing it moves every image to a different cell. the set of images stays the same |
| `HALF`, `ROUNDS` | grid and shuffle size. leave them: `HALF` must be 15000 and `ROUNDS` even |
| `SCALE` | how big each of the 100x100 image pixels is drawn |
| `MAP_W` | width of the map panel |
| `MAX_PATH` | how many moves the trail remembers |
| `TEXT_SIZE` | the size of every label on the canvas |

## limitations

- **heading drifts.** the gyro adds up small errors, typically a few degrees per minute, so long walks slowly curve. holding still for the full 3 s at startup keeps it as small as possible.
- **the nano must stay roughly level.** the heading comes from rotation around the board's z axis.
- **step length is fixed.** a short or long stride is not measured.
- **walking backward without turning counts as forward.** only the direction you face decides forward or back. an earlier version tried to detect backward walking from the accelerometer, but it was unreliable and was removed.
- **sidestepping** isn't detected. x only changes when your heading changes.
- **the path map is in cells.** the position is rounded to a cell, so tiny shifts don't register.

## troubleshooting

| problem | what to check |
| --- | --- |
| `Arduino_LSM6DS3.h: No such file` | install the **Arduino_LSM6DS3** library |
| "failed to start the built-in gyro" | the same library is missing, or the board isn't a nano 33 iot |
| `no accelerometer detected` | check the sda, scl, 3.3v and gnd wires |
| the ide still shows the old code | close the sketch's tab and reopen the file. a failed compile also leaves the previous program on the board, so check the compile finished |
| "redeclaration of LSM303_..." errors | a sketch is including both the dlhc and the dlh mag libraries. remove the `Adafruit_LSM303DLH_Mag.h` include |
| turning right makes the path turn left | set `HEADING_SIGN` to `-1.0` |
| heading barely changes when you turn | the nano isn't flat. turn `DEBUG_HEADING` on and check that `az` is near 9.8 |
| steps are missed or doubled | tune `STEP_THRESHOLD`, `RELEASE_THRESHOLD` and `MIN_STEP_GAP_MS` |
| the page says web serial is unsupported | use chrome or edge on `localhost` or `https` |
| garbled text in the serial monitor | set the baud rate to **115200** |

## history of the sensor work

- `basic-sensor-test` writes raw register values to the lsm303, including turning on the magnetometer's temperature sensor. the sensor keeps those register values while it has power, and the adafruit library's magnetometer check then fails with "no magnetometer detected". unplugging the usb cable fully clears it.
- the magnetometer was dropped for heading because the readings didn't give a usable compass indoors. the gyro replaced it.

## history of the hash

- the first version of `hash32` xored the two cell coordinates before scrambling. testing showed about a third of cells were exact mirror copies of another cell (`(a, b)` and `(-a, -b)`), and the whole seed carried only 32 bits, so at most about 4.3 billion different images were reachable. it was fixed on 2026-10-28.
- the fix (a four-word seed, each word its own hash of the cell) removed the mirror cells and gave 128 bits of seed. but with two 32-bit coordinates there were still only 2^64 possible cells, nowhere near all images, so it was replaced the same day by the current feistel shuffle: a finite grid that holds every image exactly once.
- the image at any given cell changed with each change, so addresses and images noted down before then no longer match.
