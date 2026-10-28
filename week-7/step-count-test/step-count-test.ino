
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_LSM303_U.h>

Adafruit_LSM303_Accel_Unified accel = Adafruit_LSM303_Accel_Unified(54321);

const unsigned long SAMPLE_MS = 20;      // 50 hz
const unsigned long MIN_STEP_GAP_MS = 300;
const float STEP_THRESHOLD = 1.0;        // m/s2 above baseline, tune this

float baseline = 9.8;   // slow average of |a| (gravity)
float smooth = 0;       // fast-smoothed |a| minus baseline
float prevSmooth = 0;
unsigned long lastSample = 0;
unsigned long lastStep = 0;
int steps = 0;

void setup() {
  Serial.begin(115200);
  while (!Serial);

  if (!accel.begin()) {
    Serial.println("no accelerometer detected, check wiring");
    while (1);
  }
  Serial.println("step counter started, walk!");
}

void loop() {
  unsigned long now = millis();
  if (now - lastSample < SAMPLE_MS) return;
  lastSample = now;

  sensors_event_t a;
  accel.getEvent(&a);
  float ax = a.acceleration.x, ay = a.acceleration.y, az = a.acceleration.z;
  float mag = sqrt(ax * ax + ay * ay + az * az);

  baseline = baseline * 0.98 + mag * 0.02;
  float dyn = mag - baseline;
  smooth = smooth * 0.7 + dyn * 0.3;

  // step = smoothed signal crosses threshold going up, with a minimum gap
  if (smooth > STEP_THRESHOLD && prevSmooth <= STEP_THRESHOLD &&
      now - lastStep > MIN_STEP_GAP_MS) {
    steps++;
    lastStep = now;
  }
  prevSmooth = smooth;

  // serial plotter friendly (label:value pairs)
  Serial.print("accel:");  Serial.print(mag, 2);
  Serial.print(",filtered:"); Serial.print(smooth, 2);
  Serial.print(",threshold:"); Serial.print(STEP_THRESHOLD, 2);
  Serial.print(",steps:"); Serial.println(steps);
}
