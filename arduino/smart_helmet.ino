#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "DHT.h"
#include <WiFi.h>
#include <HTTPClient.h>

// ---------------------------
// WiFi & API Configuration
// ---------------------------
const char* ssid = "YOUR_WIFI_SSID";           // Replace with your WiFi name
const char* password = "YOUR_WIFI_PASSWORD";   // Replace with your WiFi password
// IMPORTANT: Replace YOUR_COMPUTER_IP with your computer's local IP address (e.g., 192.168.1.5)
const char* serverName = "http://YOUR_COMPUTER_IP:8000/backend/api/sensor-data.php"; 

String helmetID = "H1"; // Unique identifier for this helmet

// ---------------------------
// Hardware Configuration
// ---------------------------
// LCD (change address if needed: 0x27 or 0x3F)
LiquidCrystal_I2C lcd(0x27, 16, 2);

// DHT Sensor
#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// Pins
#define MQ135_PIN 34
#define MOISTURE_PIN 32
#define TRIG_PIN 5
#define ECHO_PIN 18
#define BUZZER 19

long duration;
float distance;

void setup() {
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER, OUTPUT);

  lcd.init();
  lcd.backlight();

  dht.begin();

  lcd.setCursor(0, 0);
  lcd.print("SMART HELMET");

  // Connect to WiFi
  WiFi.begin(ssid, password);
  lcd.setCursor(0, 1);
  lcd.print("Connecting WiFi");
  
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WiFi Connected!");
  Serial.println("\nWiFi Connected!");
  delay(2000);
  lcd.clear();
}

void loop() {
  // 1. Read Sensors
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  int gas = analogRead(MQ135_PIN);
  int moisture = analogRead(MOISTURE_PIN);

  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  duration = pulseIn(ECHO_PIN, HIGH);
  distance = duration * 0.034 / 2;

  // 2. Alert Conditions Check
  bool alert = false;
  if (gas > 2000 || temp > 40 || moisture > 2000 || distance < 50) {
    alert = true;
    digitalWrite(BUZZER, HIGH);
  } else {
    digitalWrite(BUZZER, LOW);
  }

  // 3. Send Data to Web Server
  if(WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    // Construct JSON string
    String httpRequestData = "{\"gas\": " + String(gas) + 
                             ", \"temperature\": " + String(temp) + 
                             ", \"humidity\": " + String(hum) + 
                             ", \"distance\": " + String(distance) + 
                             ", \"moisture\": " + String(moisture) + 
                             ", \"helmet_id\": \"" + helmetID + "\"}";

    int httpResponseCode = http.POST(httpRequestData);

    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("HTTP POST Failed, Error code: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected. Attempting to reconnect...");
    WiFi.reconnect();
  }

  // 4. Update LCD Display (Screen 1)
  lcd.setCursor(0, 0);
  lcd.print("T:");
  lcd.print(temp);
  lcd.print(" H:");
  lcd.print(hum);

  lcd.setCursor(0, 1);
  lcd.print("G:");
  lcd.print(gas);
  lcd.print(" D:");
  lcd.print(distance);

  delay(2000);
  lcd.clear();

  // 5. Update LCD Display (Screen 2)
  lcd.setCursor(0, 0);
  lcd.print("Moist:");
  lcd.print(moisture);

  lcd.setCursor(0, 1);
  if (alert) {
    lcd.print("!! ALERT !!");
  } else {
    lcd.print("SAFE");
  }

  delay(2000);
  lcd.clear();
}
