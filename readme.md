
#  Athletes Performance Tracker

A simple web app for coaches to track athlete performance across physical tests.  
Input scores, view rankings, and monitor progress in real-time.

**Live Demo:**  
https://athletes-performance-tracker.vercel.app/

---

## Quick Start

### 1. Clone and setup backend
```bash
cd backend
npm install
echo "MONGODB_URI=your_connection_string" > .env
npm start
```

### 2. Setup frontend (in new terminal)
```bash
cd frontend
npm install
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
npm start
```

---

## 📁 Project Structure
```
athlete-performance-tracker/
├── backend/           # Node.js API server
├── frontend/          # React frontend
└── README.md
```

---

##  Features

- Add & Manage Athletes – Create athlete profiles  
- Input Test Scores – Record performance data  
- Live Leaderboard – See rankings update instantly  
- Smart Scoring – Fair points across different tests  
- Mobile-Friendly – Works on any device  

---

##  Tech Stack

**Frontend:** React, CSS  
**Backend:** Node.js, Express, MongoDB  

---

##  How to Use

1. Add Athletes – Go to "Athletes" tab and create profiles  
2. Record Scores – Use "Input Scores" to add test results  
3. View Rankings – Check "Leaderboard" for athlete standings  
4. Monitor Progress – Dashboard shows key stats  

---

## 🌍 Live Site
https://athletes-performance-tracker.vercel.app/
