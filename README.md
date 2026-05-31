# 🎤 VoiceScribe — Speech-to-Text Application

A full-stack web application that converts spoken audio into written text using **Java Spring Boot** backend and **React.js** frontend, powered by the **Deepgram Nova-2** speech recognition API.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2 |
| REST API | Spring Web (MVC) |
| Security | Spring Security (CORS + CSRF config) |
| Database ORM | Spring Data JPA + Hibernate |
| Database | MySQL 8 |
| Speech API | Deepgram Nova-2 |
| Frontend | React.js |
| Build Tool | Maven |

---

## 📁 Project Structure

```
voicescribe/
├── pom.xml                                          # Maven dependencies
├── schema.sql                                       # MySQL setup script
├── src/
│   └── main/
│       ├── java/com/voicescribe/
│       │   ├── VoiceScribeApplication.java          # Main entry point
│       │   ├── controller/
│       │   │   └── TranscriptionController.java     # REST API endpoints
│       │   ├── service/
│       │   │   ├── TranscriptionService.java        # Business logic
│       │   │   └── DeepgramService.java             # Deepgram API client
│       │   ├── repository/
│       │   │   └── TranscriptionRepository.java     # Database queries
│       │   ├── model/
│       │   │   └── Transcription.java               # JPA Entity
│       │   ├── dto/
│       │   │   └── TranscriptionDTO.java            # Request/Response DTOs
│       │   └── config/
│       │       ├── SecurityConfig.java              # Spring Security + CORS
│       │       └── GlobalExceptionHandler.java      # Error handling
│       └── resources/
│           └── application.properties               # App configuration
└── frontend/
    └── SpeechToText.jsx                             # React frontend
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- Java 17+ installed
- MySQL 8+ running locally
- Maven installed (`mvn -version`)
- Node.js 18+ (for frontend)
- Deepgram account (free at https://console.deepgram.com)

### 2. MySQL Database Setup

Open MySQL and run:
```sql
CREATE DATABASE voicescribe_db;
```
Or just run the schema file:
```bash
mysql -u root -p < schema.sql
```

### 3. Configure application.properties

Edit `src/main/resources/application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
deepgram.api.key=YOUR_DEEPGRAM_API_KEY
```

Get a free Deepgram API key at: https://console.deepgram.com

### 4. Run the Backend

```bash
# From the voicescribe/ directory
mvn spring-boot:run
```

Backend starts at: `http://localhost:8080`

### 5. Run the Frontend

```bash
cd frontend
npm install
npm start
```

Frontend starts at: `http://localhost:3000`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/transcribe` | Upload audio file → get transcript |
| `POST` | `/api/transcribe/microphone` | Save browser mic transcript |
| `GET` | `/api/history` | Get all transcriptions |
| `GET` | `/api/history/{id}` | Get single transcription |
| `DELETE` | `/api/history/{id}` | Delete a transcription |
| `GET` | `/api/download/{id}` | Download transcript as .txt |
| `GET` | `/api/stats` | Get usage statistics |

### Example API calls (Postman)

**Upload audio file:**
```
POST http://localhost:8080/api/transcribe
Body → form-data → Key: file, Value: [select audio file]
```

**Save mic transcript:**
```
POST http://localhost:8080/api/transcribe/microphone
Body → raw JSON:
{
  "text": "Hello this is my transcription",
  "duration": 5
}
```

**Get history:**
```
GET http://localhost:8080/api/history
```

---

## ✨ Features

- 🎙 **Live microphone recording** with real-time Web Speech API transcription
- 📁 **Audio file upload** — MP3, WAV, M4A, OGG, FLAC supported
- 💾 **MySQL persistence** — all transcriptions saved to database
- 📋 **History view** — browse all past transcriptions
- ⬇️ **Download** transcripts as `.txt` files
- 📊 **Stats dashboard** — total transcriptions, words, characters
- 🔒 **Spring Security** with CORS configured for React frontend

---

## 🏛️ System Architecture

```
React Frontend (localhost:3000)
        │
        │  HTTP REST API calls
        ▼
Spring Boot Backend (localhost:8080)
        │
        ├──► Deepgram API (speech recognition)
        │
        └──► MySQL Database (transcription history)
```

---

## 📝 Notes

- The Deepgram Nova-2 model provides high accuracy and is free for up to 200 hours/month
- `spring.jpa.hibernate.ddl-auto=update` auto-creates the `transcriptions` table on first run
- File uploads are limited to 50MB (configurable in `application.properties`)
