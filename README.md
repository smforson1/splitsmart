# SplitSmart - AI-Powered Expense Splitter

## 🎯 Overview
SplitSmart is a full-stack web application that helps groups track shared expenses and automatically calculates who owes whom. The standout feature is AI-powered receipt scanning that extracts expense details from photos.

## ✨ Features
- 📸 AI-powered receipt scanning using OpenAI Vision API
- 💰 Automatic debt calculation and simplification
- 👥 Group-based expense tracking
- 📊 Balance dashboard showing who owes what
- 💳 Settlement history tracking
- 📱 Mobile-responsive design
- 🎨 Clean, modern UI with Tailwind CSS

## 🛠️ Technologies Used

**Frontend:**
- React 18 with Vite
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls
- React Hot Toast for notifications

**Backend:**
- Node.js with Express.js
- PostgreSQL database
- Supabase for database hosting
- OpenAI Vision API for receipt scanning
- Multer for file uploads

**Deployment:**
- Frontend: Vercel
- Backend: Render
- Database: Supabase (cloud PostgreSQL)

## 💻 Local Development Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL or Supabase account
- OpenAI API key

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/splitsmart.git
cd splitsmart
```

2. **Setup Backend**
```bash
cd backend
npm install

# Create .env file with your credentials
cp .env.example .env
# Edit .env and add your DATABASE_URL and OPENAI_API_KEY

# Start backend server
npm start
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3000" > .env

# Start development server
npm run dev
```

4. **Access the application**
Open http://localhost:5173 in your browser

## 📝 Project Status
Currently in development - Phase 1 complete ✅

## 👤 Author
Built as a final project for Immersive Engineering Lab

## 📄 License
MIT License - feel free to use this project for learning purposes
