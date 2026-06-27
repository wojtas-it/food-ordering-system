# Architektura Oprogramowania - System Zamawiania Jedzenia z Integracją IoT

## 1. Wprowadzenie

System zamawiania jedzenia z integracją IoT to aplikacja webowa umożliwiająca składanie zamówień przez klientów, zarządzanie zamówieniami przez personel kuchni oraz powiadamianie klientów o gotowości zamówienia za pomocą urządzeń IoT opartych na mikrokontrolerze ESP32.

## 2. Architektura Systemu

System zbudowany jest w architekturze trójwarstwowej (3-tier architecture):

**Warstwa Prezentacji (Frontend)**
- Aplikacja webowa SPA (Single Page Application)
- Interfejs użytkownika dla klientów, kucharzy i administratorów
- Komunikacja z backendem poprzez REST API i WebSocket

**Warstwa Logiki Biznesowej (Backend)**
- Serwer aplikacyjny obsługujący logikę systemu
- API REST dla operacji CRUD
- Serwer WebSocket dla komunikacji w czasie rzeczywistym
- Autentykacja i autoryzacja użytkowników

**Warstwa Danych (Database)**
- Baza danych NoSQL (MongoDB)
- Przechowywanie danych użytkowników, produktów i zamówień

**Warstwa IoT (ESP32)**
- Urządzenia ESP32 jako pagery dla klientów
- Wyświetlacze OLED do prezentacji statusu zamówienia
- Powiadomienia dźwiękowe i świetlne

## 3. Technologie

### Frontend
- React 19 - biblioteka do budowy interfejsu użytkownika
- Vite - narzędzie do budowania i developmentu
- React Router v7 - routing i nawigacja w aplikacji
- Axios - klient HTTP do komunikacji z API
- WebSocket API - komunikacja w czasie rzeczywistym
- Context API - zarządzanie stanem globalnym (koszyk, autentykacja)

### Backend
- Node.js - środowisko uruchomieniowe JavaScript
- Express.js - framework do tworzenia API REST
- MongoDB - baza danych NoSQL
- Mongoose - ODM (Object Data Modeling) dla MongoDB
- JWT (jsonwebtoken) - tokeny do autentykacji
- bcryptjs - hashowanie haseł użytkowników
- ws - biblioteka WebSocket dla Node.js
- CORS - obsługa Cross-Origin Resource Sharing

### IoT (ESP32)
- PlatformIO - środowisko deweloperskie dla ESP32
- Arduino Framework - framework programowania mikrokontrolerów
- ESP32-WROOM-32 - mikrokontroler z WiFi
- ArduinoJson - parsowanie JSON na ESP32
- WebSocketsClient - klient WebSocket dla ESP32
- ThingPulse ESP8266/ESP32 OLED - biblioteka do obsługi wyświetlaczy OLED
- SH1106 OLED Display - wyświetlacz 128x64 pikseli

## 4. Struktura Projektu

### 4.1 Frontend

**Strony**
- HomePage - strona główna z przyciskiem do złożenia zamówienia
- MenuPage - przeglądanie menu i dodawanie produktów do koszyka
- CartPage - przeglądanie koszyka, modyfikacja zamówienia
- OrderConfirmationPage - potwierdzenie złożonego zamówienia
- KitchenGate - bramka z hasłem do dostępu dla personelu
- LoginPage - logowanie do systemu
- RegisterPage - rejestracja nowego konta kucharza
- KitchenDisplay - panel kuchni z listą zamówień
- AdminPanel - panel administratora (zarządzanie użytkownikami i produktami)

**Konteksty**
- AuthContext - zarządzanie stanem autentykacji, logowanie/wylogowanie
- CartContext - zarządzanie koszykiem zakupów, persistencja w localStorage

**Hooki**
- useWebSocket - hook do komunikacji WebSocket z auto-reconnect

**Komponenty**
- ProtectedRoute - komponent ochrony tras wymagających autoryzacji

**Serwisy**
- api.js - konfiguracja Axios, interceptory JWT, API endpoints

### 4.2 Backend

**Modele**
- User - model użytkownika (username, password, role, status)
- Product - model produktu (name, description, price, category, imageUrl, preparationTime)
- Order - model zamówienia (orderNumber, items, totalPrice, status, pagerNumber)

**Trasy**
- auth.js - trasy autentykacji (/register, /login, /me)
- productRoutes.js - trasy produktów (GET /products)
- orderRoutes.js - trasy zamówień (CRUD operations)
- admin.js - trasy administracyjne (zarządzanie użytkownikami i produktami)

**Kontrolery**
- authController.js - logika rejestracji, logowania, pobierania danych użytkownika
- productController.js - logika zarządzania produktami
- orderController.js - logika zarządzania zamówieniami, broadcast WebSocket
- adminController.js - logika zatwierdzania użytkowników, zarządzania produktami

**Middleware**
- auth.js - middleware JWT (authenticate, requireAdmin, generateToken)

**Serwisy**
- pagerService.js - serwis do powiadamiania pagerów ESP32 przez WebSocket

**Konfiguracja**
- database.js - połączenie z MongoDB
- server.js - inicjalizacja Express, WebSocket, routing

### 4.3 IoT (ESP32)

**main.cpp**
- Konfiguracja WiFi - połączenie z siecią bezprzewodową
- WebSocket Client - komunikacja z backendem
- OLED Display - wyświetlanie statusów zamówień
- Buzzer + LED - powiadomienia dźwiękowe i świetlne
- Event Handlers - obsługa zdarzeń WebSocket

## 5. Przepływ Danych

### 5.1 Składanie Zamówienia

1. Klient przegląda menu (MenuPage)
2. Klient dodaje produkty do koszyka (CartContext)
3. Koszyk zapisywany w localStorage (persistencja)
4. Klient przechodzi do koszyka (CartPage)
5. Klient wypełnia formularz (numer pagera, uwagi)
6. Frontend wysyła POST /api/orders do Backend
7. Backend zapisuje zamówienie w MongoDB
8. Backend generuje unikalny numer zamówienia (ORD0001, ORD0002...)
9. Backend emituje broadcast WebSocket typu NEW_ORDER do wszystkich klientów
10. Backend wywołuje pagerService.notifyPager() - wysyła powiadomienie WebSocket do ESP32
11. KitchenDisplay odbiera WebSocket i aktualizuje listę zamówień
12. ESP32 odbiera powiadomienie WebSocket i wyświetla status "Oczekiwanie" na OLED
13. Frontend przekierowuje klienta do OrderConfirmationPage

### 5.2 Przetwarzanie Zamówienia przez Kuchnię

1. Kucharz loguje się do systemu (LoginPage → JWT token)
2. Kucharz wchodzi do KitchenDisplay (chroniona trasa)
3. Kucharz widzi listę zamówień w statusie "pending" lub "preparing"
4. Kucharz klika "Rozpocznij przygotowanie" → status zmienia się na "preparing"
5. Frontend wysyła PATCH /api/orders/:id/status do Backend
6. Backend aktualizuje status w MongoDB
7. Backend emituje broadcast WebSocket typu ORDER_STATUS_UPDATED
8. Backend wywołuje pagerService.notifyPager() z nowym statusem
9. ESP32 odbiera powiadomienie i wyświetla "W trakcie realizacji" na OLED
10. Po zakończeniu przygotowania, Kucharz klika "Oznacz jako gotowe" → status: "ready"
11. ESP32 odbiera powiadomienie o statusie "ready"
12. ESP32 wyświetla "GOTOWE!" na OLED
13. ESP32 włącza buzzer i LED (alarm przez 10 sekund)
14. Klient odbiera pager z sygnalizacją dźwiękową i świetlną
15. Po odebraniu zamówienia, Kucharz klika "Zakończ zamówienie" → status: "completed"
16. ESP32 wraca do stanu "Idle" (PAGER P001)

### 5.3 Zarządzanie Użytkownikami (Admin)

1. Nowy użytkownik rejestruje się (RegisterPage)
2. Frontend wysyła POST /api/auth/register do Backend
3. Backend tworzy użytkownika ze statusem "pending" w MongoDB
4. Admin loguje się do panelu (AdminPanel)
5. Admin widzi oczekujące konta w zakładce "Oczekujące konta"
6. Admin klika "Zatwierdź" lub "Odrzuć"
7. Frontend wysyła PATCH /admin/users/:id/approve lub /admin/users/:id/reject
8. Backend aktualizuje status użytkownika na "active" lub "rejected"
9. Użytkownik z statusem "active" może się zalogować
10. Użytkownik z statusem "rejected" otrzymuje błąd przy próbie logowania

## 6. Bezpieczeństwo

### 6.1 Autentykacja
- JWT (JSON Web Tokens) - tokeny przechowywane w localStorage przeglądarki
- Ważność tokenu: 24 godziny
- Middleware JWT - sprawdza autentykację przed dostępem do chronionych endpointów
- Header Authorization: Bearer <token>

### 6.2 Autoryzacja
- Role-Based Access Control (RBAC):
  - admin - pełny dostęp do panelu administracyjnego
  - kucharz - dostęp do panelu kuchni
- Status-Based Access:
  - pending - użytkownik nie może się zalogować
  - active - użytkownik może się zalogować
  - rejected - użytkownik nie może się zalogować

### 6.3 Ochrona Haseł
- bcryptjs - hashowanie haseł z salt rounds
- Hasła nigdy nie są przechowywane w formie jawnej
- Hash zapisywany w MongoDB

### 6.4 Walidacja
- Backend - walidacja wszystkich danych wejściowych
- Frontend - walidacja formularzy (min długość hasła, wymagane pola)
- Mongoose schemas - walidacja na poziomie bazy danych

### 6.5 CORS
- Cross-Origin Resource Sharing - umożliwia frontendowi komunikację z backendem
- Konfiguracja: backend akceptuje requesty z frontendu

## 7. Komunikacja w Czasie Rzeczywistym

### 7.1 WebSocket - Backend ↔ Frontend
- Protokół: WebSocket (ws://)
- Port: 5001
- Cel: Aktualizacje zamówień w czasie rzeczywistym dla KitchenDisplay

Typy wiadomości:
- CONNECTED - potwierdzenie połączenia
- NEW_ORDER - nowe zamówienie utworzone
- ORDER_STATUS_UPDATED - status zamówienia zmieniony
- ORDER_DELETED - zamówienie usunięte

### 7.2 WebSocket - Backend ↔ ESP32
- Protokół: WebSocket (ws://)
- Port: 5001
- Cel: Powiadomienia o statusach zamówień dla pagerów

Typy wiadomości:
- orderUpdate - aktualizacja statusu zamówienia dla pagera (pola: type, status, orderNumber, pagerNumber, timestamp)

### 7.3 Auto-Reconnect
- Frontend: WebSocket hook z auto-reconnect co 3 sekundy
- ESP32: Logika reconnect w przypadku utraty połączenia

## 8. Baza Danych

### 8.1 MongoDB - NoSQL
- Typ: Dokumentowa baza danych NoSQL
- ODM: Mongoose (Object Data Modeling)
- Kolekcje: Users, Products, Orders

### 8.2 Schemat Users
- _id: ObjectId (automatyczny)
- username: String (unikalny)
- password: String (hash bcrypt)
- role: String (enum: admin, kucharz)
- status: String (enum: pending, active, rejected)
- createdAt: Date

### 8.3 Schemat Products
- _id: ObjectId
- name: String
- description: String
- price: Number
- category: String
- imageUrl: String
- preparationTime: Number (minuty)
- createdAt: Date

### 8.4 Schemat Orders
- _id: ObjectId
- orderNumber: String (unikalny, auto: ORD0001)
- items: Array of OrderItem
  - product: ObjectId (ref Products)
  - name: String (snapshot)
  - price: Number (snapshot)
  - quantity: Number
- totalPrice: Number
- status: String (enum: pending, preparing, ready, completed, cancelled)
- notes: String
- pagerNumber: String
- createdAt: Date

### 8.5 Snapshots w OrderItems
Zamówienia przechowują snapshot nazwy i ceny produktu w momencie składania zamówienia. Dzięki temu zmiana ceny produktu w menu nie wpływa na historyczne zamówienia.

## 9. Skalowanie i Wydajność

### 9.1 Frontend
- Vite - szybkie budowanie i hot module replacement (HMR)
- Code splitting - React Router automatycznie dzieli kod na chunki
- localStorage - redukcja zapytań do API (koszyk, token)

### 9.2 Backend
- Node.js asynchroniczny I/O - obsługa wielu połączeń jednocześnie
- Connection pooling - Mongoose zarządza połączeniami do MongoDB
- WebSocket broadcast - efektywne przesyłanie aktualizacji do wielu klientów

### 9.3 Baza Danych
- Indeksy - MongoDB automatycznie indeksuje _id
- Unikalność - username i orderNumber mają indeks UNIQUE

## 10. Obsługa Błędów

### 10.1 Frontend
- Try-catch w requestach async/await
- Komunikaty błędów wyświetlane użytkownikowi
- Loading states - informowanie o trwających operacjach

### 10.2 Backend
- Global Error Handler - middleware Express przechwytuje błędy
- HTTP Status Codes:
  - 200 - OK
  - 201 - Created
  - 400 - Bad Request
  - 401 - Unauthorized
  - 403 - Forbidden
  - 404 - Not Found
  - 500 - Internal Server Error

### 10.3 ESP32
- Serial Monitor - logowanie błędów do monitora szeregowego
- Auto-reconnect - próba ponownego połączenia z WiFi i WebSocket
- Timeout handling - obsługa timeoutów połączeń

## 11. Testowanie

### 11.1 Możliwości Testowania
- Frontend: Brak testów jednostkowych (możliwe rozszerzenie o Jest + React Testing Library)
- Backend: Testy manualne poprzez Postman/curl
- Integration testing: Testowanie pełnego flow zamówienia end-to-end
- IoT: Testowanie fizyczne z ESP32 + OLED + buzzer

## 12. Deployment

### 12.1 Środowisko Deweloperskie
- Frontend: npm run dev - Vite dev server (port 5173)
- Backend: npm run dev - nodemon z auto-reload (port 5000, 5001)
- ESP32: PlatformIO Upload - flash programu na mikrokontroler

### 12.2 Środowisko Produkcyjne (potencjalnie)
- Frontend: npm run build → hosting statyczny (Vercel, Netlify)
- Backend: npm start → hosting Node.js (Heroku, Railway, VPS)
- Database: MongoDB Atlas (cloud)
- ESP32: Działanie standalone po zaprogramowaniu

## 13. Podsumowanie

System zamawiania jedzenia z integracją IoT to kompleksowe rozwiązanie łączące technologie webowe (React, Node.js, MongoDB) z Internetem Rzeczy (ESP32). Architektura trójwarstwowa zapewnia separację warstw prezentacji, logiki biznesowej i danych. Komunikacja w czasie rzeczywistym poprzez WebSocket umożliwia natychmiastowe aktualizacje statusów zamówień zarówno w interfejsie webowym, jak i na urządzeniach IoT. System wykorzystuje nowoczesne podejścia do autentykacji (JWT), autoryzacji (RBAC) oraz bezpieczeństwa danych (hashowanie haseł). Modularna budowa pozwala na łatwe rozszerzanie funkcjonalności w przyszłości.
