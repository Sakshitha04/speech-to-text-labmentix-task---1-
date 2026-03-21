Speech-to-Text web technology project

## Overview

This is a full-stack Speech-to-Text web application that allows users to record or upload audio and convert it into text using AI.
The app stores transcription history and provides a smooth end-to-end experience from recording to viewing results.


## 🚀 Features

* 🎤 Record audio directly from the browser
* 📤 Upload audio files
* 🤖 AI-powered transcription using AssemblyAI
* 📝 Display transcription results instantly
* 📚 View saved transcription history
* ☁️ Data stored securely using Supabase


##  Tech Stack

### Frontend

* React (Vite)
* JavaScript
* CSS

### Backend

* Node.js
* Express.js
* Multer (file uploads)
* Axios (API requests)

### Database & APIs

* Supabase (Database)
* AssemblyAI (Speech-to-Text API)


## Backend Setup

1. Install dependencies
2. Create `.env` file
3. Run backend


## 🎨 Frontend Setup

1. Install dependencies
2. Create `.env` file
3. Run frontend

##  API Endpoints
### Backend Routes

* "GET /" → Check server status
* "POST /upload" → Upload audio & get transcription
* "POST /save" → Save transcription
* "GET /history" → Fetch transcription history


##  Deployment
### Backend

* Deploy using Vercel / Render / Railway
* Add environment variables in dashboard

### Frontend

* Deploy using Vercel / Netlify
* Update `VITE_BACKEND_URL` with deployed backend URL



## 👩‍💻 Author
S.A.SAKSHITHA
Developed as part of a full-stack learning project.


