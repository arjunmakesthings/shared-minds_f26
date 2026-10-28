#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_LSM303_U.h>

Adafruit_LSM303_Accel_Unified accel = Adafruit_LSM303_Accel_Unified(54321);
Adafruit_LSM303_Mag_Unified mag = Adafruit_LSM303_Mag_Unified(12345);

// step detection
const unsigned long SAMPLE_MS = 20;
const unsigned long MIN_STEP_GAP_MS = 300;
const unsigned long MAX_STEP_MS = 600;   // give up on a step window after this long
const float STEP_THRESHOLD = 1.0;        // peak needed to start a step
const float RELEASE_THRESHOLD = 0.3;     // signal must fall below this to end it (hysteresis)
const float MIN_ACTIVITY = 0.15;         // ignore "steps" while basically standing still

// direction (forward / backward)
const int DIR_CAL_STEPS = 5;             // forward steps walked at startup to learn the pattern
const float AMBIGUOUS_FRACTION = 0.2;    // weaker than this fraction of the reference = unsure
const bool DEBUG_DIR = false;            // true = also print the direction score per step
const bool DEBUG_HEADING = true;         // true = print compass/tilt info every 200 ms

// position
const float STEP_LENGTH_M = 0.7;   // calibrate: known distance / steps
const float HEADING_SIGN = 1.0;    // set to -1.0 if turning right mirrors the path

// motion state
float baseline = 9.8, smooth = 0, prevSmooth = 0;
float ayBase = 0, fwd = 0, activity = 0;   // board y axis = walking direction
float lastAz = 0;                          // for the tilt check in debug output
unsigned long lastDebug = 0;
unsigned long lastSample = 0, lastStep = 0, stepStart = 0;
bool inStep = false;
float stepCorr = 0;
float refCorr = 0;   // direction score of a known-forward step
int lastDir = 1;

float magOffX = 0, magOffY = 0;    // hard-iron offsets
float smx = 0, smy = 0;            // smoothed calibrated mag
float startHeading = 0;            // radians
float posX = 0, posY = 0;

float rawHeading() {
  return atan2(smy, smx);
}

void updateMag() {
  sensors_event_t m;
  mag.getEvent(&m);
  float mx = m.magnetic.x - magOffX;
  float my = m.magnetic.y - magOffY;
  smx = smx * 0.8 + mx * 0.2;
  smy = smy * 0.8 + my * 0.2;
}

void updateMotion() {
  sensors_event_t a;
  accel.getEvent(&a);
  float ax = a.acceleration.x, ay = a.acceleration.y, az = a.acceleration.z;
  float amag = sqrt(ax * ax + ay * ay + az * az);
  lastAz = az;

  baseline = baseline * 0.98 + amag * 0.02;
  smooth = smooth * 0.7 + (amag - baseline) * 0.3;
  activity = activity * 0.95 + fabs(amag - baseline) * 0.05;

  // acceleration along the walking axis with gravity/tilt removed
  ayBase = ayBase * 0.98 + ay * 0.02;
  fwd = fwd * 0.7 + (ay - ayBase) * 0.3;
}

// prints the compass state. turning slowly in place, "heading" should sweep
// 0 to 360. az near 9.8 means the board is flat (near 0 = on its side).
void debugHeading() {
  if (!DEBUG_HEADING || millis() - lastDebug < 200) return;
  lastDebug = millis();

  float rel = (rawHeading() - startHeading) * 180.0 / PI;
  while (rel < 0) rel += 360;
  while (rel >= 360) rel -= 360;

  Serial.print("debug  mx ");
  Serial.print(smx, 1);
  Serial.print("  my ");
  Serial.print(smy, 1);
  Serial.print("  heading ");
  Serial.print(rawHeading() * 180.0 / PI, 0);
  Serial.print("  from start ");
  Serial.print(rel, 0);
  Serial.print("  az ");
  Serial.println(lastAz, 1);
}

// a step is one up-and-down bump of the vertical signal. while the bump
// lasts we add up (walking-axis accel x vertical bump). its sign flips
// between walking forward and backward. returns true when a step ends.
bool updateStep(unsigned long now, float &corr) {
  bool finished = false;

  if (!inStep && smooth > STEP_THRESHOLD && prevSmooth <= STEP_THRESHOLD &&
      now - lastStep > MIN_STEP_GAP_MS && activity > MIN_ACTIVITY) {
    inStep = true;
    stepStart = now;
    lastStep = now;
    stepCorr = 0;
  }

  if (inStep) {
    if (smooth > 0) stepCorr += fwd * smooth;
    if (smooth < RELEASE_THRESHOLD || now - stepStart > MAX_STEP_MS) {
      inStep = false;
      corr = stepCorr;
      finished = true;
    }
  }

  prevSmooth = smooth;
  return finished;
}

int decideDir(float corr) {
  if (fabs(corr) < AMBIGUOUS_FRACTION * fabs(refCorr)) return lastDir;
  lastDir = (corr * refCorr >= 0) ? 1 : -1;
  return lastDir;
}

void calibrateMag() {
  Serial.println("calibrating: spin the board flat in full circles for 10 s");
  float minX = 1e6, maxX = -1e6, minY = 1e6, maxY = -1e6;
  unsigned long t0 = millis();
  while (millis() - t0 < 10000) {
    sensors_event_t m;
    mag.getEvent(&m);
    minX = min(minX, m.magnetic.x); maxX = max(maxX, m.magnetic.x);
    minY = min(minY, m.magnetic.y); maxY = max(maxY, m.magnetic.y);
    delay(20);
  }
  magOffX = (minX + maxX) / 2;
  magOffY = (minY + maxY) / 2;

  if (DEBUG_HEADING) {
    Serial.print("debug  mag range x ");
    Serial.print(minX, 1); Serial.print(" to "); Serial.print(maxX, 1);
    Serial.print("  y ");
    Serial.print(minY, 1); Serial.print(" to "); Serial.print(maxY, 1);
    Serial.print("  offsets ");
    Serial.print(magOffX, 1); Serial.print(", "); Serial.println(magOffY, 1);
  }
}

void calibrateDirection() {
  Serial.print("walk ");
  Serial.print(DIR_CAL_STEPS);
  Serial.println(" steps FORWARD in a straight line");

  float sum = 0;
  int n = 0;
  while (n < DIR_CAL_STEPS) {
    unsigned long now = millis();
    if (now - lastSample < SAMPLE_MS) continue;
    lastSample = now;

    updateMag();
    updateMotion();
    debugHeading();
    float corr;
    if (updateStep(now, corr)) {
      sum += corr;
      n++;
      Serial.print("  step ");
      Serial.print(n);
      Serial.print("/");
      Serial.println(DIR_CAL_STEPS);
    }
  }
  refCorr = sum / n;
  if (DEBUG_DIR) {
    Serial.print("forward reference score: ");
    Serial.println(refCorr, 2);
  }
}

void printPosition() {
  Serial.print("x: ");
  Serial.print(posX, 2);
  Serial.print("; y: ");
  Serial.println(posY, 2);
}

void setup() {
  Serial.begin(115200);
  while (!Serial);

  // the library's mag begin() only accepts CRA_REG_M == 0x10 (factory default).
  // the sensor keeps old register values while powered, so reset it here.
  Wire.begin();
  Wire.beginTransmission(0x1E);
  Wire.write(0x00);
  Wire.write(0x10);
  Wire.endTransmission();

  if (!accel.begin()) {
    Serial.println("no accelerometer detected, check wiring");
    while (1);
  }
  if (!mag.begin()) {
    Serial.println("no magnetometer detected, check wiring");
    while (1);
  }
  mag.enableAutoRange(true);

  // start the slow baselines at the real values so they don't need to settle
  sensors_event_t a;
  accel.getEvent(&a);
  ayBase = a.acceleration.y;
  baseline = sqrt(a.acceleration.x * a.acceleration.x +
                  a.acceleration.y * a.acceleration.y +
                  a.acceleration.z * a.acceleration.z);

  calibrateMag();

  Serial.println("hold still, facing your starting direction (3 s)");
  unsigned long t0 = millis();
  while (millis() - t0 < 3000) {
    updateMag();
    updateMotion();
    debugHeading();
    delay(20);
  }
  startHeading = rawHeading();

  calibrateDirection();

  // wherever you are now is the origin
  posX = 0;
  posY = 0;
  lastDir = 1;
  Serial.println("go! output below is x, y in meters (start = 0, 0; forward = +y, backward = -y)");
  printPosition();
}

void loop() {
  unsigned long now = millis();
  if (now - lastSample < SAMPLE_MS) return;
  lastSample = now;

  updateMag();
  updateMotion();
  debugHeading();

  float corr;
  if (updateStep(now, corr)) {
    int dir = decideDir(corr);

    float h = (rawHeading() - startHeading) * HEADING_SIGN;
    posX += dir * STEP_LENGTH_M * sin(h);
    posY += dir * STEP_LENGTH_M * cos(h);

    if (DEBUG_DIR) {
      Serial.print("score: ");
      Serial.print(corr, 2);
      Serial.print("; dir: ");
      Serial.println(dir);
    }
    printPosition();
  }
}
