# Dokumentacja API - System Zamawiania Jedzenia z Integracją IoT

Base URL: http://localhost:5000/api
WebSocket URL: ws://localhost:5001

## Autentykacja

### Metoda Autentykacji
- Typ: JWT (JSON Web Token)
- Header: Authorization: Bearer <token>
- Przechowywanie tokenu: localStorage (frontend)
- Ważność tokenu: 24 godziny

### Role Użytkowników
- admin - Pełny dostęp do systemu
- kucharz - Dostęp do panelu kuchni

### Statusy Użytkowników
- pending - Oczekuje na zatwierdzenie przez administratora
- active - Konto zatwierdzone i aktywne
- rejected - Konto odrzucone

## Endpointy API

### 1. Autentykacja (/api/auth)

#### POST /auth/register
Rejestracja nowego użytkownika (domyślny status: pending)

Request Body:
```json
{
  "username": "string",
  "password": "string"
}
```

Response (201 Created):
```json
{
  "message": "Użytkownik zarejestrowany. Oczekuje na zatwierdzenie.",
  "user": {
    "_id": "string",
    "username": "string",
    "role": "kucharz",
    "status": "pending"
  }
}
```

Błędy:
- 400 - Nazwa użytkownika już istnieje
- 400 - Nieprawidłowe dane wejściowe

#### POST /auth/login
Logowanie użytkownika

Request Body:
```json
{
  "username": "string",
  "password": "string"
}
```

Response (200 OK):
```json
{
  "token": "jwt_token_string",
  "user": {
    "_id": "string",
    "username": "string",
    "role": "admin | kucharz",
    "status": "active"
  }
}
```

Błędy:
- 401 - Nieprawidłowe dane logowania
- 403 - Konto nieaktywne (pending lub rejected)

#### GET /auth/me
Pobierz informacje o zalogowanym użytkowniku

Headers:
```
Authorization: Bearer <token>
```

Response (200 OK):
```json
{
  "user": {
    "_id": "string",
    "username": "string",
    "role": "admin | kucharz",
    "status": "active",
    "createdAt": "ISO8601 datetime"
  }
}
```

Błędy:
- 401 - Brak tokenu lub nieprawidłowy token
- 403 - Konto nieaktywne

### 2. Produkty (/api/products)

#### GET /products
Pobierz wszystkie produkty

Response (200 OK):
```json
[
  {
    "_id": "string",
    "name": "string",
    "description": "string",
    "price": number,
    "category": "string",
    "imageUrl": "string",
    "preparationTime": number,
    "createdAt": "ISO8601 datetime"
  }
]
```

#### GET /products/category/:category
Pobierz produkty według kategorii

Parametry:
- category (path) - Nazwa kategorii

Response (200 OK):
```json
[
  {
    "_id": "string",
    "name": "string",
    "description": "string",
    "price": number,
    "category": "string",
    "imageUrl": "string",
    "preparationTime": number
  }
]
```

### 3. Zamówienia (/api/orders)

#### GET /orders
Pobierz wszystkie zamówienia (wymaga autentykacji)

Headers:
```
Authorization: Bearer <token>
```

Response (200 OK):
```json
[
  {
    "_id": "string",
    "orderNumber": "string",
    "items": [
      {
        "name": "string",
        "price": number,
        "quantity": number
      }
    ],
    "totalPrice": number,
    "status": "pending | preparing | ready | completed | cancelled",
    "notes": "string",
    "pagerNumber": "string",
    "createdAt": "ISO8601 datetime"
  }
]
```

Błędy:
- 401 - Brak autoryzacji

#### GET /orders/:id
Pobierz zamówienie po ID (wymaga autentykacji)

Parametry:
- id (path) - ID zamówienia

Response (200 OK):
```json
{
  "_id": "string",
  "orderNumber": "string",
  "items": [...],
  "totalPrice": number,
  "status": "string",
  "notes": "string",
  "pagerNumber": "string",
  "createdAt": "ISO8601 datetime"
}
```

Błędy:
- 401 - Brak autoryzacji
- 404 - Zamówienie nie znalezione

#### POST /orders
Utwórz nowe zamówienie

Request Body:
```json
{
  "items": [
    {
      "product": "product_id",
      "name": "string",
      "price": number,
      "quantity": number
    }
  ],
  "notes": "string",
  "pagerNumber": "string"
}
```

Response (201 Created):
```json
{
  "_id": "string",
  "orderNumber": "ORD0001",
  "items": [...],
  "totalPrice": number,
  "status": "pending",
  "notes": "string",
  "pagerNumber": "string",
  "createdAt": "ISO8601 datetime"
}
```

Efekty uboczne:
- Broadcast WebSocket do wszystkich klientów z typem NEW_ORDER
- Powiadomienie ESP32 przez WebSocket

Błędy:
- 400 - Nieprawidłowe dane wejściowe

#### PATCH /orders/:id/status
Aktualizuj status zamówienia (wymaga autentykacji)

Headers:
```
Authorization: Bearer <token>
```

Parametry:
- id (path) - ID zamówienia

Request Body:
```json
{
  "status": "pending | preparing | ready | completed | cancelled"
}
```

Response (200 OK):
```json
{
  "_id": "string",
  "orderNumber": "string",
  "status": "new_status",
  "items": [...],
  "totalPrice": number,
  "pagerNumber": "string",
  "createdAt": "ISO8601 datetime"
}
```

Efekty uboczne:
- Broadcast WebSocket do wszystkich klientów z typem ORDER_STATUS_UPDATED
- Powiadomienie ESP32 przez WebSocket
- Jeśli status to "ready": ESP32 aktywuje buzzer i LED

Błędy:
- 401 - Brak autoryzacji
- 404 - Zamówienie nie znalezione
- 400 - Nieprawidłowy status

#### DELETE /orders/:id
Usuń zamówienie (wymaga autentykacji)

Headers:
```
Authorization: Bearer <token>
```

Parametry:
- id (path) - ID zamówienia

Response (200 OK):
```json
{
  "message": "Zamówienie usunięte"
}
```

Efekty uboczne:
- Broadcast WebSocket do wszystkich klientów z typem ORDER_DELETED

Błędy:
- 401 - Brak autoryzacji
- 404 - Zamówienie nie znalezione

### 4. Administracja (/api/admin)

Wszystkie endpointy administracyjne wymagają autentykacji z rolą admin

Headers:
```
Authorization: Bearer <token>
```

#### GET /admin/users
Pobierz wszystkich użytkowników

Response (200 OK):
```json
[
  {
    "_id": "string",
    "username": "string",
    "role": "admin | kucharz",
    "status": "pending | active | rejected",
    "createdAt": "ISO8601 datetime"
  }
]
```

Błędy:
- 401 - Brak autoryzacji
- 403 - Brak uprawnień administratora

#### GET /admin/users/pending
Pobierz użytkowników oczekujących na zatwierdzenie

Response (200 OK):
```json
[
  {
    "_id": "string",
    "username": "string",
    "role": "kucharz",
    "status": "pending",
    "createdAt": "ISO8601 datetime"
  }
]
```

Błędy:
- 401 - Brak autoryzacji
- 403 - Brak uprawnień administratora

#### PATCH /admin/users/:id/approve
Zatwierdź użytkownika oczekującego

Parametry:
- id (path) - ID użytkownika

Response (200 OK):
```json
{
  "_id": "string",
  "username": "string",
  "role": "kucharz",
  "status": "active",
  "createdAt": "ISO8601 datetime"
}
```

Błędy:
- 401 - Brak autoryzacji
- 403 - Brak uprawnień administratora
- 404 - Użytkownik nie znaleziony

#### PATCH /admin/users/:id/reject
Odrzuć użytkownika oczekującego

Parametry:
- id (path) - ID użytkownika

Response (200 OK):
```json
{
  "_id": "string",
  "username": "string",
  "role": "kucharz",
  "status": "rejected",
  "createdAt": "ISO8601 datetime"
}
```

Błędy:
- 401 - Brak autoryzacji
- 403 - Brak uprawnień administratora
- 404 - Użytkownik nie znaleziony

#### PATCH /admin/users/:id/role
Zmień rolę użytkownika

Parametry:
- id (path) - ID użytkownika

Request Body:
```json
{
  "role": "admin | kucharz"
}
```

Response (200 OK):
```json
{
  "_id": "string",
  "username": "string",
  "role": "new_role",
  "status": "active",
  "createdAt": "ISO8601 datetime"
}
```

Błędy:
- 401 - Brak autoryzacji
- 403 - Brak uprawnień administratora
- 404 - Użytkownik nie znaleziony
- 400 - Nieprawidłowa rola

#### DELETE /admin/users/:id
Usuń użytkownika

Parametry:
- id (path) - ID użytkownika

Response (200 OK):
```json
{
  "message": "Użytkownik usunięty"
}
```

Błędy:
- 401 - Brak autoryzacji
- 403 - Brak uprawnień administratora lub próba usunięcia domyślnego admina
- 404 - Użytkownik nie znaleziony

#### POST /admin/products
Utwórz nowy produkt

Request Body:
```json
{
  "name": "string",
  "description": "string",
  "price": number,
  "category": "string",
  "imageUrl": "string",
  "preparationTime": number
}
```

Response (201 Created):
```json
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "price": number,
  "category": "string",
  "imageUrl": "string",
  "preparationTime": number,
  "createdAt": "ISO8601 datetime"
}
```

Błędy:
- 401 - Brak autoryzacji
- 403 - Brak uprawnień administratora
- 400 - Nieprawidłowe dane wejściowe

#### PUT /admin/products/:id
Zaktualizuj istniejący produkt

Parametry:
- id (path) - ID produktu

Request Body:
```json
{
  "name": "string",
  "description": "string",
  "price": number,
  "category": "string",
  "imageUrl": "string",
  "preparationTime": number
}
```

Response (200 OK):
```json
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "price": number,
  "category": "string",
  "imageUrl": "string",
  "preparationTime": number,
  "createdAt": "ISO8601 datetime"
}
```

Błędy:
- 401 - Brak autoryzacji
- 403 - Brak uprawnień administratora
- 404 - Produkt nie znaleziony
- 400 - Nieprawidłowe dane wejściowe

#### DELETE /admin/products/:id
Usuń produkt

Parametry:
- id (path) - ID produktu

Response (200 OK):
```json
{
  "message": "Produkt usunięty"
}
```

Błędy:
- 401 - Brak autoryzacji
- 403 - Brak uprawnień administratora
- 404 - Produkt nie znaleziony

## Protokół WebSocket

### Połączenie
```javascript
const ws = new WebSocket('ws://localhost:5001');
```

### Typy Wiadomości (Serwer → Klient)

#### 1. CONNECTED
Wysyłane zaraz po nawiązaniu połączenia
```json
{
  "type": "CONNECTED",
  "message": "Połączono z serwerem WebSocket",
  "timestamp": "ISO8601 datetime"
}
```

#### 2. NEW_ORDER
Broadcast przy utworzeniu nowego zamówienia
```json
{
  "type": "NEW_ORDER",
  "order": {
    "_id": "string",
    "orderNumber": "string",
    "items": [...],
    "totalPrice": number,
    "status": "pending",
    "pagerNumber": "string",
    "createdAt": "ISO8601 datetime"
  }
}
```

#### 3. ORDER_STATUS_UPDATED
Broadcast przy zmianie statusu zamówienia
```json
{
  "type": "ORDER_STATUS_UPDATED",
  "order": {
    "_id": "string",
    "orderNumber": "string",
    "status": "new_status",
    "items": [...],
    "pagerNumber": "string",
    "createdAt": "ISO8601 datetime"
  }
}
```

#### 4. ORDER_DELETED
Broadcast przy usunięciu zamówienia
```json
{
  "type": "ORDER_DELETED",
  "orderId": "string"
}
```

#### 5. orderUpdate (specyficzne dla ESP32)
Wysyłane do pagerów ESP32 przy aktualizacji statusu
```json
{
  "type": "orderUpdate",
  "status": "pending | preparing | ready | completed",
  "orderNumber": "string",
  "pagerNumber": "string",
  "timestamp": "ISO8601 datetime"
}
```

### Typy Wiadomości (Klient → Serwer)

Klienci mogą wysyłać dowolne wiadomości JSON. Serwer odpowiada komunikatem ACK:
```json
{
  "type": "ACK",
  "message": "Wiadomość otrzymana",
  "timestamp": "ISO8601 datetime"
}
```

## Schemat Bazy Danych

### Kolekcja Users
```javascript
{
  _id: ObjectId,
  username: String (unikalny, wymagany),
  password: String (hash bcrypt, wymagany),
  role: String (enum: ['admin', 'kucharz'], domyślnie: 'kucharz'),
  status: String (enum: ['pending', 'active', 'rejected'], domyślnie: 'pending'),
  createdAt: Date (domyślnie: Date.now)
}
```

### Kolekcja Products
```javascript
{
  _id: ObjectId,
  name: String (wymagany),
  description: String (wymagany),
  price: Number (wymagany),
  category: String (wymagany),
  imageUrl: String (wymagany),
  preparationTime: Number (domyślnie: 10),
  createdAt: Date (domyślnie: Date.now)
}
```

### Kolekcja Orders
```javascript
{
  _id: ObjectId,
  orderNumber: String (unikalny, auto-generowany: ORD0001, ORD0002...),
  items: [
    {
      product: ObjectId (ref: 'Product'),
      name: String (snapshot),
      price: Number (snapshot),
      quantity: Number
    }
  ],
  totalPrice: Number (wymagany),
  status: String (enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'], domyślnie: 'pending'),
  notes: String,
  pagerNumber: String (wymagany),
  createdAt: Date (domyślnie: Date.now)
}
```

## Zabezpieczenia

1. Hashowanie haseł - bcrypt z salt rounds
2. Autentykacja JWT - tokeny ważne 24 godziny
3. Kontrola dostępu oparta na rolach (RBAC) - role admin i kucharz
4. Kontrola dostępu oparta na statusie - użytkownicy pending nie mogą się logować
5. Chronione trasy - middleware sprawdza autentykację i autoryzację
6. CORS włączony - żądania cross-origin dozwolone dla frontendu

## Uruchomienie

### Start Backend
```bash
cd backend
npm install
npm run dev
```

### Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### Utworzenie Domyślnego Admina
```bash
cd backend
node src/seedAdmin.js
```

Domyślne dane logowania:
- Nazwa użytkownika: admin
- Hasło: admin

## Uwagi

- Numery zamówień są generowane automatycznie sekwencyjnie (ORD0001, ORD0002, itd.)
- OrderItems przechowują nazwę i cenę produktu jako snapshoty (nie są dotknięte aktualizacjami produktów)
- Połączenia WebSocket automatycznie łączą się ponownie co 3 sekundy w przypadku rozłączenia
- ESP32 wyświetla status zamówienia na OLED i aktywuje buzzer gdy status to "ready"
