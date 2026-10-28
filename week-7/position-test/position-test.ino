#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_LSM303_U.h>
#include <Arduino_LSM6DS3.h>   // the nano 33 iot's built-in gyro

// lsm303 accel gives the steps; the nano's gyro gives the turning
Adafruit_LSM303_Accel_Unified accel = Adafruit_LSM303_Accel_Unified(54321);

// step detection
const unsigned long SAMPLE_MS = 20;
const unsigned long MIN_STEP_GAP_MS = 300;
const unsigned long MAX_STEP_MS = 600;   // give up on a step window after this long
const float STEP_THRESHOLD = 1.0;        // peak needed to start a step
const float RELEASE_THRESHOLD = 0.3;     // signal must fall below this to end it (hysteresis)
const float MIN_ACTIVITY = 0.15;         // ignore "steps" while basically standing still
const bool DEBUG_HEADING = false;        // true = print turning info every 200 ms

// position
const float STEP_LENGTH_M = 0.7;   // calibrate: known distance / steps
const float HEADING_SIGN = 1.0;    // set to -1.0 if turning right mirrors the path
const float GYRO_DEADBAND = 0.2;   // deg/s, ignore tiny rotation so noise doesn't add up

// motion state
float baseline = 9.8, smooth = 0, prevSmooth = 0, activity = 0;
float lastAz = 0;                          // for the tilt check in debug output
unsigned long lastSample = 0, lastStep = 0, stepStart = 0, lastDebug = 0;
bool inStep = false;

// turning
float gyroBias = 0;           // deg/s measured while holding still
float lastGz = 0;
float yaw = 0;                // degrees, counterclockwise = positive (z up)
unsigned long lastGyroUs = 0;

float posX = 0, posY = 0;

// direction you face, radians clockwise from where you started
float headingRad() {
  return -yaw * HEADING_SIGN * PI / 180.0;
}

// same thing in degrees, 0 to 360 (90 = turned a quarter turn to the right)
float headingDeg() {
  float deg = headingRad() * 180.0 / PI;
  while (deg < 0) deg += 360;
  while (deg >= 360) deg -= 360;
  return deg;
}

// which way you're walking, relative to the way you started facing
const char *goingLabel(float deg) {
  if (deg < 45 || deg >= 315) return "forward";
  if (deg < 135) return "right";
  if (deg < 225) return "back";
  return "left";
}

void updateGyro() {
  if (!IMU.gyroscopeAvailable()) return;
  float gx, gy, gz;
  IMU.readGyroscope(gx, gy, gz);

  unsigned long nowUs = micros();
  float dt = (nowUs - lastGyroUs) / 1000000.0;
  lastGyroUs = nowUs;
  lastGz = gz;
  if (dt > 0.1) return;   // first reading or a long gap

  float rate = gz - gyroBias;
  if (fabs(rate) > GYRO_DEADBAND) yaw += rate * dt;
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
}

// turning slowly in place, "turned" should climb 0 to 360 for a full circle to
// the right. az near 9.8 means the board is flat (near 0 = on its side).
void debugHeading() {
  if (!DEBUG_HEADING || millis() - lastDebug < 200) return;
  lastDebug = millis();

  Serial.print("debug  gz ");
  Serial.print(lastGz - gyroBias, 1);
  Serial.print("  turned right ");
  Serial.print(headingDeg(), 0);
  Serial.print("  az ");
  Serial.println(lastAz, 1);
}

// a step is one up-and-down bump of the vertical signal.
// returns true when a step ends.
bool updateStep(unsigned long now) {
  bool finished = false;

  if (!inStep && smooth > STEP_THRESHOLD && prevSmooth <= STEP_THRESHOLD &&
      now - lastStep > MIN_STEP_GAP_MS && activity > MIN_ACTIVITY) {
    inStep = true;
    stepStart = now;
    lastStep = now;
  }

  if (inStep && (smooth < RELEASE_THRESHOLD || now - stepStart > MAX_STEP_MS)) {
    inStep = false;
    finished = true;
  }

  prevSmooth = smooth;
  return finished;
}

// hold still: measure the gyro's constant error so it can be subtracted
void calibrateGyro() {
  Serial.println("hold still, facing your starting direction (3 s)");
  float sum = 0;
  int n = 0;
  unsigned long t0 = millis();
  while (millis() - t0 < 3000) {
    if (IMU.gyroscopeAvailable()) {
      float gx, gy, gz;
      IMU.readGyroscope(gx, gy, gz);
      sum += gz;
      n++;
    }
    updateMotion();   // keeps the accel baselines settled
    delay(5);
  }
  gyroBias = n > 0 ? sum / n : 0;
  if (DEBUG_HEADING) {
    Serial.print("debug  gyro bias ");
    Serial.print(gyroBias, 2);
    Serial.print(" deg/s from ");
    Serial.print(n);
    Serial.println(" samples");
  }
}

void printPosition() {
  float deg = headingDeg();
  Serial.print("x: ");
  Serial.print(posX, 2);
  Serial.print("; y: ");
  Serial.print(posY, 2);
  Serial.print("; heading: ");
  Serial.print(deg, 0);
  Serial.print("; going: ");
  Serial.println(goingLabel(deg));
}

void setup() {
  Serial.begin(115200);
  while (!Serial);

  if (!accel.begin()) {
    Serial.println("no accelerometer detected, check wiring");
    while (1);
  }
  if (!IMU.begin()) {
    Serial.println("failed to start the built-in gyro (is Arduino_LSM6DS3 installed?)");
    while (1);
  }

  // start the slow baseline at the real value so it doesn't need to settle
  sensors_event_t a;
  accel.getEvent(&a);
  baseline = sqrt(a.acceleration.x * a.acceleration.x +
                  a.acceleration.y * a.acceleration.y +
                  a.acceleration.z * a.acceleration.z);

  calibrateGyro();
  lastGyroUs = micros();

  // wherever you are now is the origin, and the way you're facing is forward
  posX = 0;
  posY = 0;
  yaw = 0;
  Serial.println("go! output below is x, y in meters (start = 0, 0; the way you face now = +y)");
  printPosition();
}

void loop() {
  updateGyro();

  unsigned long now = millis();
  if (now - lastSample < SAMPLE_MS) return;
  lastSample = now;

  updateMotion();
  debugHeading();

  if (updateStep(now)) {
    // every step moves you the way you're facing, so turning around and
    // walking takes y down (back) and walking off to the side moves x
    float h = headingRad();
    posX += STEP_LENGTH_M * sin(h);
    posY += STEP_LENGTH_M * cos(h);
    printPosition();
  }
}
