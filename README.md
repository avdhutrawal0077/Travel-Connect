# Travel Connect

Premium ride-share platform connecting commuters for seamless urban travel. Features a Three.js animated landing page, real-time chat, ride posting/booking, and a modern dashboard UI.

## Project Structure

```
travel-connect/
├── backend/                  # Flask API server
│   ├── app.py                # App factory & frontend serving
│   ├── config.py             # Database & JWT configuration
│   ├── extensions.py         # SQLAlchemy & CORS instances
│   ├── models.py             # Database models (User, RidePost, Booking, Chat, etc.)
│   ├── requirements.txt      # Python dependencies
│   ├── .env                  # Environment variables (not committed)
│   └── routes/
│       ├── __init__.py
│       ├── auth.py           # /api/auth — register, login
│       ├── auth_middleware.py # JWT token_required decorator
│       ├── rides.py          # /api/rides — CRUD, search, book
│       └── chat.py           # /api/chat — inbox, messages, send
├── frontend/                 # Static frontend (served by Flask)
│   ├── index.html            # Landing page + main app shell
│   ├── script.js             # Three.js landing, auth, app UI logic
│   ├── api.js                # Backend API integration (rides, chat)
│   ├── styles.css            # Full application styles
│   ├── login_terms.html      # Terms & conditions page
│   └── assets/               # Images, SVGs, wallpapers
├── ca.pem.txt                # Aiven MySQL SSL certificate
├── venv/                     # Python virtual environment
├── .env.example              # Template for backend/.env
├── .gitignore
└── README.md
```

## Setup

### 1. Clone & create virtual environment

```bash
cd "travel connect"
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r backend/requirements.txt
```

### 3. Configure environment

Copy `.env.example` to `backend/.env` and fill in your Aiven MySQL credentials:

```
DATABASE_URL=mysql+pymysql://avnadmin:YOUR_PASSWORD@your-host:25176/defaultdb
JWT_SECRET_KEY=your-jwt-secret
```

### 4. Run the application

```bash
cd backend
python app.py
```

Open **http://localhost:5000** — Flask serves both the API and the frontend.

## API Endpoints

| Method | Endpoint                          | Auth | Description           |
| ------ | --------------------------------- | ---- | --------------------- |
| POST   | `/api/auth/register`              | No   | Create new account    |
| POST   | `/api/auth/login`                 | No   | Login, receive JWT    |
| GET    | `/api/rides/`                     | No   | List open rides       |
| POST   | `/api/rides/`                     | JWT  | Create a ride post    |
| POST   | `/api/rides/book`                 | JWT  | Book a ride           |
| GET    | `/api/rides/my-bookings`          | JWT  | My booked rides       |
| GET    | `/api/chat/inbox`                 | JWT  | Chat conversations    |
| GET    | `/api/chat/?user_id=<id>`         | JWT  | Messages with user    |
| POST   | `/api/chat/`                      | JWT  | Send a message        |
| GET    | `/api/chat/resolve_user/<ident>`  | JWT  | Look up user by ID    |
| GET    | `/health`                         | No   | Health check          |

## Tech Stack

- **Backend:** Flask, SQLAlchemy, PyMySQL, PyJWT
- **Database:** MySQL (Aiven Cloud) with SSL
- **Frontend:** Vanilla HTML/CSS/JS, Three.js, GSAP
