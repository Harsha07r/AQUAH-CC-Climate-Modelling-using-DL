# AQUAH-CC — System Architecture Report

**Project:** AQUAH-CC — The Living Almanac, Jhelum Basin Agricultural Intelligence Platform
**Date:** May 2026
**Scope:** Technical overview of system layers, multilingual capabilities, and end-to-end data flow

---

## 1. Tech Stack by Layer

### Layer 1 — Frontend (Client)

| Concern | Technology | Version |
|---|---|---|
| Framework | React | 19.2 |
| Build Tool | Vite | 8.x |
| Styling | Tailwind CSS | 4.x |
| Icons | Lucide React | 1.9 |
| Charts | Recharts (AreaChart) | 3.8 |
| Auth UI | Firebase JS SDK | 12.x |
| Voice Input | Web Speech API (browser native) | — |
| Translation | Custom `translations.js` (no library) | — |
| Routing | State-based view switching (`currentView`) | — |

**Key pages / components:**

- `ChatInterface.jsx` — AI assistant conversation, widget cards, voice input, language switcher
- `HydrologyPage.jsx` — Live basin stats + Jhelum discharge forecast chart
- `CropsPage.jsx` — Per-season crop advisory cards ranked by suitability score
- `HydrologyDashboard.jsx` — Recharts AreaChart rendering PINN model discharge forecast
- `Settings.jsx` — Farm digital twin profile (soil type, water availability)
- `SideBar.jsx` — Navigation, user profile, logout
- `Layout.jsx` — Shell wrapper with sidebar toggle

---

### Layer 2 — Backend (Node.js API Gateway)

| Concern | Technology | Version |
|---|---|---|
| Runtime | Node.js (CommonJS) | — |
| Framework | Express | 5.2 |
| AI SDK | @google/generative-ai | 0.24 |
| AI Model | Gemini 2.5 Flash | — |
| Database ODM | Mongoose | 9.5 |
| HTTP Client | Native `fetch` + axios | — |
| Environment | dotenv | — |
| Dev Server | nodemon | — |
| CORS | cors middleware | — |

**Responsibilities:**

- Hosts the AI conversation endpoint (`POST /api/chat`)
- Orchestrates Gemini function calling (`get_crop_advisory` tool)
- Proxies Python ML API results to the frontend (`GET /api/report`)
- Persists chat history per session in MongoDB (`ChatSession` model)
- Stores and retrieves user farm profiles (`User` model)
- Injects user soil type from database profile into every Gemini prompt

---

### Layer 3 — Python ML API (Hydrology Engine)

| Concern | Technology | Notes |
|---|---|---|
| Deployment | Render.com (free tier) | Cold-starts after inactivity |
| Model Type | PINN (Physics-Informed Neural Network) | Jhelum basin discharge |
| Primary Endpoint | `GET /full_report` | Returns all data in one call |

**Data returned by `/full_report`:**

```json
{
  "hydrology": { "flood_risk": "MODERATE", "avg_flow_m3s": 412, "max_flow_m3s": 610, "forecast": [...] },
  "agriculture": { "Kharif": { "Rice": { "score": 87, "rating": "Excellent", "note": "..." }, ... } },
  "soil": { "texture": "Loamy", "ph": 6.8, "organic_carbon": 1.4 },
  "meteorology": { "avg_temp_c": 18.2 },
  "location": { "name": "Sangam, Kashmir", "lat": 33.7, "lon": 74.8 }
}
```

---

### Layer 4 — Database (MongoDB Atlas)

| Concern | Technology |
|---|---|
| Host | MongoDB Atlas (cloud) |
| ODM | Mongoose |
| Collections | `users`, `chatsessions` |

**`users` collection:** stores UID, email, name, `farmDetails.soilType`, `farmDetails.waterLevel`

**`chatsessions` collection:** stores session ID, array of `{ role, content, widgetData, language }` messages

---

### Layer 5 — Authentication

| Concern | Technology |
|---|---|
| Provider | Firebase Authentication |
| Methods | Google OAuth / Email+Password |
| Session | Firebase `onAuthStateChanged` listener in `App.jsx` |

---

## 2. Multilingual Support

### 2.1 Supported Languages

| Language | Code | Script | Display Label |
|---|---|---|---|
| English (India) | `en-IN` | Latin | 🇬🇧 EN |
| Hindi | `hi-IN` | Devanagari | 🇮🇳 हिंदी |
| Urdu | `ur-IN` | Nastaliq (Perso-Arabic) | 🇵🇰 اردو |
| Kashmiri | `ks-IN` | Nastaliq (Perso-Arabic) | 🇮🇳 كٲشُر |

---

### 2.2 UI Text Translation

**Mechanism:** A single `translations.js` file exports a plain JavaScript object keyed by language code. Each key maps to a flat dictionary of 26+ UI strings.

**Translation function:**
```js
const t = (key) => translations[currentLanguage]?.[key] || translations['en-IN'][key];
```

- Falls back to English if a key is missing in the selected language.
- Used for all UI labels: placeholders, button text, widget headers, profile settings, error messages, and API data values (e.g. crop names, flood risk levels).

**Widget language freeze:** When the AI returns a response with widget data, the current language is **snapshotted** into the message object (`language: currentLanguage`). The widget renders using that snapshot, not the live selector. This prevents past chat widgets from re-translating when the user switches languages.

```js
// Message saved with language snapshot
{ role: 'model', content: '...', widgetData: {...}, language: 'hi-IN' }

// Widget rendering uses a message-local translator
const tMsg = (key) => translations[msg.language || 'en-IN']?.[key] || translations['en-IN'][key];
```

**Translated data keys include:**
- Flood risk levels: `HIGH`, `MODERATE`, `LOW`, `UNKNOWN`
- Crop names: `Rice`, `Wheat`, `Maize`, `Soybean`, `Fodder`
- All 7 Kashmir soil types (Karewa, Alluvial, Loamy, Sandy Loam, Clay Loam, Glacial, Peaty)

---

### 2.3 AI Response Language

The backend injects a language directive into every Gemini prompt before sending:

| Language | Directive sent to Gemini |
|---|---|
| English | `You MUST respond in clear, natural English.` |
| Hindi | Translate final response into Hindi |
| Urdu | `Write in clear, natural Nastaliq Urdu script only. Do not use Roman letters.` |
| Kashmiri | `Write exclusively in Perso-Arabic/Nastaliq script. NEVER use Roman letters. Keep response concise.` |

The original user message (clean, without system directives) is saved to MongoDB. Gemini always receives the AI data from the Python API in English; the directive forces it to translate only the conversational reply text.

---

### 2.4 Voice Input (Speech-to-Text)

**API Used:** Browser-native Web Speech API (`window.SpeechRecognition || window.webkitSpeechRecognition`)

**Initialization:** A single `SpeechRecognition` instance is created once on component mount via `useRef`, avoiding re-creation on every render.

**BCP-47 Language Mapping:**

| App Language | Browser BCP-47 Tag | Notes |
|---|---|---|
| `en-IN` | `en-IN` | Full Chrome support |
| `hi-IN` | `hi-IN` | Full Chrome support |
| `ur-IN` | `ur-PK` | `ur-IN` has inconsistent support; `ur-PK` is stable |
| `ks-IN` | `ur-PK` | No browser engine supports `ks-IN`; shared Nastaliq script makes `ur-PK` the closest match |

The language tag is updated live whenever the user changes the language selector, without recreating the recognition instance:

```js
useEffect(() => {
  if (!recognitionRef.current) return;
  recognitionRef.current.lang = speechLangMap[currentLanguage] ?? currentLanguage;
}, [currentLanguage]);
```

**Behavior:**
- Interim results are shown in the input box as the user speaks.
- On `onend`, listening state is cleared.
- On `onerror`, listening state is cleared and the error is logged.
- The mic button pulses red when active, dark green when idle.

---

## 3. Architecture — Full Request & Response Flow

### 3.1 Chat Message Flow (AI Assistant)

```
User types / speaks a message
        │
        ▼
[ChatInterface.jsx]
  ① Language directive is appended to the message text
  ② POST /api/chat  →  { message, originalMessage, sessionId, uid }
        │
        ▼
[Node.js — server.js — POST /api/chat]
  ③ Look up user profile in MongoDB (by uid)
  ④ Inject soil type into prompt:
     "[SECRET SYSTEM CONTEXT: soil = Loamy Soil. Water level calculated by ML model.]"
  ⑤ Load chat history from MongoDB → build Gemini history array
  ⑥ Start Gemini chat session with history
  ⑦ Send augmented message to Gemini 2.5 Flash
        │
        ▼
[Gemini 2.5 Flash]
  ⑧ Decides: needs crop data → triggers function call: get_crop_advisory(soilType)
        │
        ▼
[Node.js — fetchPythonAdvisory()]
  ⑨ GET https://jhelum-forecast-api.onrender.com/full_report
        │
        ▼
[Python ML API — Render.com]
  ⑩ Runs PINN hydrology model on live Jhelum basin data
  ⑪ Returns: flood_risk, agriculture seasons, soil, meteorology, forecast[], location
        │
        ▼
[Node.js]
  ⑫ Extracts top crops (rating=Excellent or score≥80) from agriculture data
  ⑬ Sends function result back to Gemini
  ⑭ Gemini generates final text reply in the user's selected language
  ⑮ Save { user message, AI reply + widgetData } to MongoDB ChatSession
  ⑯ Return { reply, sessionId, widgetData } to frontend
        │
        ▼
[ChatInterface.jsx]
  ⑰ Append AI message bubble (text + language snapshot)
  ⑱ Render Flood Risk card + Top Crop card (using message-local tMsg)
  ⑲ Render HydrologyDashboard AreaChart (forecast data)
```

**Retry Logic:** All Gemini API calls use exponential backoff (2s → 4s → 6s) on HTTP 429 / 503 errors, up to 3 attempts.

---

### 3.2 Hydrology Tab Flow

```
User clicks "Hydrology" in sidebar
        │
        ▼
[App.jsx]  setCurrentView('hydrology')
        │
        ▼
[HydrologyPage.jsx]
  ① useEffect → GET http://127.0.0.1:5000/api/report
        │
        ▼
[Node.js — GET /api/report]
  ② Proxies → GET https://jhelum-forecast-api.onrender.com/full_report
        │
        ▼
[Python ML API]
  ③ Returns full report JSON
        │
        ▼
[HydrologyPage.jsx]
  ④ Renders 4 stat cards: Flood Risk, Avg Flow, Peak Flow, Avg Temperature
  ⑤ Renders location pill (name, lat/lon)
  ⑥ Passes forecast[], avgFlow, maxFlow, soil, temperature, location
     → HydrologyDashboard (Recharts AreaChart)
```

---

### 3.3 Crops Tab Flow

```
User clicks "Crops" in sidebar
        │
        ▼
[App.jsx]  setCurrentView('crops')
        │
        ▼
[CropsPage.jsx]
  ① useEffect → GET http://127.0.0.1:5000/api/report
        │
        ▼
[Node.js — GET /api/report]
  ② Proxies → GET https://jhelum-forecast-api.onrender.com/full_report
        │
        ▼
[Python ML API]
  ③ Returns full report JSON
        │
        ▼
[CropsPage.jsx]
  ④ Finds single best crop across all seasons (highest score)
  ⑤ Renders summary strip: Flood Risk · Top Pick · Excellent count · Soil pH
  ⑥ Renders dark-green hero banner for #1 crop
  ⑦ For each season → SeasonSection (collapsible)
       └── For each crop → CropCard (score bar, rating badge, reasoning note, #1 Pick crown)
```

---

### 3.4 Authentication Flow

```
App.jsx mounts
  ↓
onAuthStateChanged(auth) fires
  ↓
  ├── User logged in  → render Layout + current view
  └── No user        → render <Login /> (Firebase Google/Email auth)
                               ↓
                         onLoginSuccess() → setUser(true) → redirect to chat
```

---

### 3.5 Settings / Farm Profile Flow

```
User clicks "Settings" → setCurrentView('settings')
        │
        ▼
[Settings.jsx]
  ① User selects soil type + water level
  ② POST /api/user → { uid, email, name, soilType, waterLevel }
        │
        ▼
[Node.js — POST /api/user]
  ③ User.findOneAndUpdate({ uid }, { farmDetails }, { upsert: true })
     → Creates or updates user profile in MongoDB
        │
        ▼
[Next chat message]
  ④ POST /api/chat includes uid
  ⑤ Node.js fetches profile → injects soilType into Gemini prompt
  ⑥ Gemini uses saved soil for all crop/advisory decisions
```

---

## 4. Data Model Summary

### ChatSession (MongoDB)
```
sessionId     String   (hex, 16 bytes, unique per user)
messages[]
  role        String   ('user' | 'model')
  content     String   (clean text, no system directives)
  widgetData  Object   (flood_risk, recommended_crops, forecast[], soil, ...)
  language    String   (BCP-47 code snapshotted at message creation time)
```

### User (MongoDB)
```
uid                    String   (Firebase UID)
email                  String
name                   String
farmDetails.soilType   String   (e.g. 'Loamy Soil')
farmDetails.waterLevel String   (e.g. 'Moderate')
```

---

## 5. Environment Variables

| Variable | Used by | Purpose |
|---|---|---|
| `PORT` | Node.js | Server port (default 5000) |
| `GEMINI_API_KEY` | Node.js | Google Generative AI authentication |
| `PYTHON_API_URL` | Node.js | Base URL of Python PINN ML API |
| `MONGODB_URI` | Node.js | MongoDB Atlas connection string |
| Firebase config | Frontend | Auth, stored in `firebase.js` |
