#include <Wire.h>

const uint8_t ACC_ADDR = 0x19;
const uint8_t MAG_ADDR = 0x1E;

void writeReg(uint8_t addr, uint8_t reg, uint8_t val) {
  Wire.beginTransmission(addr);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

bool readRegs(uint8_t addr, uint8_t reg, uint8_t *buf, uint8_t n) {
  Wire.beginTransmission(addr);
  Wire.write(reg);
  if (Wire.endTransmission(false) != 0) return false;
  if (Wire.requestFrom(addr, n) != n) return false;
  for (uint8_t i = 0; i < n; i++) buf[i] = Wire.read();
  return true;
}

void setup() {
  Serial.begin(115200);
  while (!Serial);
  Wire.begin();

  // accel: 100hz, all axes on
  writeReg(ACC_ADDR, 0x20, 0x57);
  // accel: high resolution, +/-2g
  writeReg(ACC_ADDR, 0x23, 0x08);

  // mag: temp sensor enabled, 30hz output rate
  writeReg(MAG_ADDR, 0x00, 0x94);
  // mag: +/-1.3 gauss
  writeReg(MAG_ADDR, 0x01, 0x20);
  // mag: continuous conversion
  writeReg(MAG_ADDR, 0x02, 0x00);

  Serial.println("lsm303dlhc test started");
}

void loop() {
  uint8_t a[6], m[6], t[2];

  // accel (0x80 bit = auto-increment)
  if (readRegs(ACC_ADDR, 0x28 | 0x80, a, 6)) {
    // 12-bit left-justified, 1 mg/lsb at +/-2g in hr mode
    int16_t ax = (int16_t)(a[0] | (a[1] << 8)) >> 4;
    int16_t ay = (int16_t)(a[2] | (a[3] << 8)) >> 4;
    int16_t az = (int16_t)(a[4] | (a[5] << 8)) >> 4;
    Serial.print("accel mg  x: "); Serial.print(ax);
    Serial.print("  y: ");         Serial.print(ay);
    Serial.print("  z: ");         Serial.println(az);
  } else {
    Serial.println("accel read failed");
  }

  // mag (register order is x, z, y; big-endian)
  if (readRegs(MAG_ADDR, 0x03, m, 6)) {
    int16_t mx = (int16_t)((m[0] << 8) | m[1]);
    int16_t mz = (int16_t)((m[2] << 8) | m[3]);
    int16_t my = (int16_t)((m[4] << 8) | m[5]);
    // gain at +/-1.3 gauss: 1100 lsb/gauss (x,y), 980 lsb/gauss (z)
    Serial.print("mag gauss x: "); Serial.print(mx / 1100.0, 3);
    Serial.print("  y: ");         Serial.print(my / 1100.0, 3);
    Serial.print("  z: ");         Serial.println(mz / 980.0, 3);
  } else {
    Serial.println("mag read failed");
  }

  // temperature (12-bit, 8 lsb/degC, relative value)
  if (readRegs(MAG_ADDR, 0x31, t, 2)) {
    int16_t raw = (int16_t)((t[0] << 8) | t[1]) >> 4;
    Serial.print("temp degC (relative): "); Serial.println(raw / 8.0, 1);
  }

  Serial.println();
  delay(200);
}
