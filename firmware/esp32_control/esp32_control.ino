#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

// --- Configuration ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Servo Driver Setup
Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();
#define SERVOMIN  150 
#define SERVOMAX  600 
#define SERVO_FREQ 50 

WebServer server(80);

// Current Servo Angles (State)
int currentAngles[6] = {90, 90, 90, 90, 90, 90};

void setup() {
  Serial.begin(115200);
  
  // Power Safety Start
  // Don't attach servos immediately if possible, or start slowly?
  // PCA9685 starts all off usually.
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println("\nWiFi connected.");
  Serial.print("IP: "); Serial.println(WiFi.localIP());

  pwm.begin();
  pwm.setOscillatorFrequency(27000000);
  pwm.setPWMFreq(SERVO_FREQ);
  
  // Initial Slow Move to Home
  int home[6] = {90, 90, 90, 90, 90, 90};
  moveServosSequential(home);

  server.on("/move", HTTP_POST, handleMove);
  server.on("/status", HTTP_GET, handleStatus);
  server.begin();
}

void loop() {
  server.handleClient();
}

void handleMove() {
  if (!server.hasArg("plain")) {
    server.send(400, "json", "{\"error\":\"Body missing\"}"); return;
  }
  DynamicJsonDocument doc(1024);
  deserializeJson(doc, server.arg("plain"));
  JsonArray angles = doc["angles"];
  
  if (angles.size() != 6) {
    server.send(400, "json", "{\"error\":\"6 angles required\"}"); return;
  }

  int targetAngles[6];
  for (int i=0; i<6; i++) targetAngles[i] = angles[i];

  // SEQUENTIAL MOVE (Power Safety)
  moveServosSequential(targetAngles);
  
  server.send(200, "json", "{\"status\":\"success\"}");
}

void handleStatus() {
  server.send(200, "json", "{\"status\":\"online\"}");
}

// --- SEQUENTIAL LOGIC ---
void moveServosSequential(int targets[6]) {
  // Move each servo one by one with a delay to prevent Amp spike
  for (int i = 0; i < 6; i++) {
    // Only move if angle changed significantly
    if (abs(currentAngles[i] - targets[i]) > 2) {
      int pulse = map(targets[i], 0, 180, SERVOMIN, SERVOMAX);
      pwm.setPWM(i, 0, pulse);
      currentAngles[i] = targets[i];
      
      // WAIT for motion to complete before starting next servo
      // Typical servo speed 0.15sec/60deg. 
      // Max move 180deg ~ 0.5s. 
      // Let's use a safe delay of 300ms-500ms
      delay(300); 
    }
  }
}
