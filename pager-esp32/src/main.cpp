/*
 * ESP32 Pager - Food Ordering System
 * WebSocket Client + OLED Display
 * LED + BUZZER + OLED (ThingPulse library)
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include "SH1106Wire.h"  // ThingPulse OLED library

// ========================================
// KONFIGURACJA — skopiuj secrets.h.example jako secrets.h
// ========================================
#include "secrets.h"
#define PAGER_NUMBER "P001"    // Numer tego pagera
// ========================================

// GPIO Pins
#define LED_PIN 2              // Wbudowany LED
#define BUZZER_PIN 4           // Buzzer
#define OLED_SDA 21            // I2C SDA
#define OLED_SCL 22            // I2C SCL

// OLED Display - SH1106 (XFP1116-07A)
SH1106Wire display(0x3C, OLED_SDA, OLED_SCL);
bool oledAvailable = false;

// WebSocket Client
WebSocketsClient webSocket;

// Stan pagera
bool isNotifying = false;
unsigned long notificationStartTime = 0;
const unsigned long NOTIFICATION_DURATION = 10000; // 10 sekund
String currentOrderNumber = "";
String currentOrderStatus = "";  // pending, preparing, ready, completed

// ========================================
// Funkcje OLED Display
// ========================================

// Ekran idle - brak zamówienia
void displayIdle() {
  if (!oledAvailable) return;

  display.clear();
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.setFont(ArialMT_Plain_16);
  display.drawString(64, 15, "PAGER");
  display.setFont(ArialMT_Plain_24);
  display.drawString(64, 35, PAGER_NUMBER);
  display.display();
}

// Status systemowy (WiFi, WebSocket)
void displayStatus(String status) {
  if (!oledAvailable) return;

  display.clear();
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.setFont(ArialMT_Plain_10);
  display.drawString(64, 28, status);
  display.display();
}

// Zamówienie PENDING - Oczekiwanie
void displayOrderPending(String orderNumber) {
  if (!oledAvailable) return;

  display.clear();
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.setFont(ArialMT_Plain_16);
  display.drawString(64, 15, "Oczekiwanie...");
  display.setFont(ArialMT_Plain_16);
  display.drawString(64, 38, orderNumber);
  display.display();
}

// Zamówienie PREPARING - W trakcie realizacji
void displayOrderPreparing(String orderNumber) {
  if (!oledAvailable) return;

  display.clear();
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.setFont(ArialMT_Plain_10);
  display.drawString(64, 15, "W trakcie");
  display.drawString(64, 28, "realizacji");
  display.setFont(ArialMT_Plain_16);
  display.drawString(64, 45, orderNumber);
  display.display();
}

// Zamówienie READY - GOTOWE!
void displayOrderReady(String orderNumber) {
  if (!oledAvailable) return;

  display.clear();
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.setFont(ArialMT_Plain_16);
  display.drawString(64, 10, "GOTOWE!");
  display.setFont(ArialMT_Plain_16);
  display.drawString(64, 35, orderNumber);
  display.display();
}

void displayMessage(String line1, String line2 = "", String line3 = "", String line4 = "") {
  if (!oledAvailable) return;

  display.clear();
  display.setTextAlignment(TEXT_ALIGN_LEFT);
  display.setFont(ArialMT_Plain_10);

  int y = 0;
  if (line1.length() > 0) { display.drawString(0, y, line1); y += 12; }
  if (line2.length() > 0) { display.drawString(0, y, line2); y += 12; }
  if (line3.length() > 0) { display.drawString(0, y, line3); y += 12; }
  if (line4.length() > 0) { display.drawString(0, y, line4); }

  display.display();
}

// ========================================
// Obsługa zdarzeń WebSocket
// ========================================
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("[WS] Rozłączono!");
      digitalWrite(LED_PIN, LOW);
      displayStatus("Rozlaczono");
      break;

    case WStype_CONNECTED:
      Serial.println("[WS] Połączono z backendem!");
      digitalWrite(LED_PIN, HIGH);
      displayStatus("Polaczono!");
      delay(500);
      digitalWrite(LED_PIN, LOW);
      displayIdle();  // Pokaż ekran idle
      break;

    case WStype_TEXT:
      Serial.printf("[WS] Otrzymano wiadomość: %s\n", payload);

      // Parsuj JSON
      StaticJsonDocument<512> doc;
      DeserializationError error = deserializeJson(doc, payload);

      if (!error) {
        const char* type = doc["type"];

        // Sprawdź czy to powiadomienie dla pagera
        if (type && strcmp(type, "orderUpdate") == 0) {
          const char* status = doc["status"];
          const char* orderNumber = doc["orderNumber"];

          if (status && orderNumber) {
            Serial.printf("📟 Zamówienie %s - status: %s\n", orderNumber, status);

            // Zapisz dane zamówienia
            currentOrderNumber = String(orderNumber);
            currentOrderStatus = String(status);

            // Wyświetl odpowiedni ekran w zależności od statusu
            if (strcmp(status, "pending") == 0) {
              displayOrderPending(currentOrderNumber);
              isNotifying = false;  // Bez alarmu dla pending
            }
            else if (strcmp(status, "preparing") == 0) {
              displayOrderPreparing(currentOrderNumber);
              isNotifying = false;  // Bez alarmu dla preparing
            }
            else if (strcmp(status, "ready") == 0) {
              displayOrderReady(currentOrderNumber);
              // Włącz alarm (buzzer + LED)
              isNotifying = true;
              notificationStartTime = millis();
            }
            else if (strcmp(status, "completed") == 0 || strcmp(status, "cancelled") == 0) {
              // Zamówienie zakończone - wróć do idle
              displayIdle();
              currentOrderNumber = "";
              currentOrderStatus = "";
              isNotifying = false;
            }
          }
        }
      }
      break;
  }
}

// ========================================
// Połączenie z WiFi
// ========================================
void connectWiFi() {
  Serial.println("\n[WiFi] Łączenie z siecią: " + String(WIFI_SSID));
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] ✅ Połączono!");
    Serial.print("[WiFi] IP ESP32: ");
    Serial.println(WiFi.localIP());
    Serial.print("[WiFi] Siła sygnału: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");

    displayMessage("WiFi OK!", "IP: " + WiFi.localIP().toString(), "", "Laczenie...");
  } else {
    Serial.println("\n[WiFi] ❌ Nie udało się połączyć!");
    Serial.println("[WiFi] Sprawdź SSID i hasło w konfiguracji");

    displayMessage("WiFi ERROR!", "Sprawdz SSID");
  }
}

// ========================================
// SETUP
// ========================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=================================");
  Serial.println("ESP32 Pager - Food Ordering System");
  Serial.println("LED + BUZZER + OLED (SH1106)");
  Serial.println("=================================");

  // Konfiguracja pinów
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  // Inicjalizacja OLED Display
  display.init();
  display.flipScreenVertically();  // Ustaw orientację jeśli trzeba
  oledAvailable = true;
  Serial.println("[OLED] ✅ Wyświetlacz SH1106 zainicjalizowany (0x3C)");

  // Wyczyść ekran
  display.clear();
  display.display();
  delay(100);

  // Ekran startowy
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.setFont(ArialMT_Plain_10);
  display.drawString(64, 20, "ESP32 Pager");
  display.drawString(64, 35, "Startuje...");
  display.display();
  delay(1500);

  // Połącz z WiFi
  connectWiFi();

  // Konfiguracja WebSocket
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WS] Łączenie z backendem...");
    Serial.printf("[WS] Adres: ws://%s:%d\n", BACKEND_IP, BACKEND_PORT);

    webSocket.begin(BACKEND_IP, BACKEND_PORT, "/");
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(5000);

    Serial.println("[WS] WebSocket skonfigurowany");
    Serial.println("=================================");
    Serial.println("✅ Pager gotowy do pracy!");
    Serial.printf("📟 Numer pagera: %s\n", PAGER_NUMBER);
    Serial.println("=================================\n");

    // Pokaż ekran idle
    delay(500);
    displayIdle();
  }
}

// ========================================
// LOOP
// ========================================
void loop() {
  webSocket.loop();

  // Obsługa powiadomienia (LED + Buzzer + OLED)
  if (isNotifying) {
    unsigned long elapsed = millis() - notificationStartTime;

    if (elapsed < NOTIFICATION_DURATION) {
      // Migaj LED szybko
      digitalWrite(LED_PIN, (millis() / 200) % 2);

      // Włącz buzzer
      digitalWrite(BUZZER_PIN, (millis() / 200) % 2);

      // OLED wyświetla "GOTOWE!" (już ustawione)
    } else {
      // Wyłącz alarm po 10 sekundach
      isNotifying = false;
      digitalWrite(LED_PIN, LOW);
      digitalWrite(BUZZER_PIN, LOW);
      Serial.println("🔕 Alarm zakończony (OLED nadal pokazuje GOTOWE!)");

      // OLED NADAL pokazuje "GOTOWE!" - nie zmieniamy ekranu
      // Ekran zmieni się dopiero gdy przyjdzie status "completed"
    }
  } else {
    // Normalny stan - LED wskazuje połączenie (nie miga)
    if (WiFi.status() == WL_CONNECTED) {
      digitalWrite(LED_PIN, HIGH);
    } else {
      digitalWrite(LED_PIN, LOW);
    }
  }

  delay(10);
}
