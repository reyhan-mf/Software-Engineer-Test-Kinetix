# Kinetix Blog Platform

A full-stack blog platform where users can register, write blog posts (with
Markdown), browse and search posts, comment in threads, and manage their own
profile. Built as the Kinetix Software Engineer technical assessment.

**Live demo:** https://kinetix-blog-platform.vercel.app

---

## Tech Stack

| Layer    | Technology                                            |
| -------- | ----------------------------------------------------- |
| Frontend | React 19 (Vite), React Router, Tailwind CSS, Axios    |
| Backend  | Node.js, Express 5, MongoDB (Mongoose)                |
| Auth     | JWT + bcrypt, Google OAuth (`@react-oauth/google`)    |
| Storage  | Vercel Blob (images), MongoDB Atlas (data)            |
| Markdown | `react-markdown` + `remark-gfm`                       |
| Hosting  | Vercel (frontend static + serverless API, one project)|

---

## Features

### Core requirements
- **Posts CRUD** — create, read, edit, delete. Only the author can edit/delete.
- **Home page** — lists posts with title, description, category, author and date.
- **Post detail** — full post; edit/delete controls shown only to the author,
  read-only for everyone else.
- **Comments** — threaded comments (reply to any comment, including replies);
  authors can edit/delete their own; deleting a comment removes its whole reply
  subtree.
- **Authentication** — register, login, logout; JWT kept in `localStorage` and
  sent via an Axios request interceptor.
- **Profile** — view your profile and a list of your own posts.
- **Responsive** — works across desktop, tablet and mobile (Tailwind).
- **Validation & error handling** — required-field checks on the client and the
  server; clear messages such as `Post not found`, `User already exists` and
  authorization errors.

### Plus points (all implemented)
- **Search** — by post title or content (`GET /api/posts?search=`).
- **Pagination** — `GET /api/posts?page=&limit=`.
- **Markdown** — posts are written and rendered as Markdown (GFM).
- **Profile picture upload** — images stored in Vercel Blob.

### Extra
- **Google Login** — "Continue with Google" on the login/register pages.

---

## Project Structure

```
.
├── api/index.js          # Vercel serverless entry → re-exports backend/api/index.js
├── vercel.json           # Build + routing config (frontend static + /api function)
├── package.json          # Root deps for the serverless function
├── backend/
│   ├── app.js            # Express app (middleware, routes, error handler)
│   ├── db.js             # Cached Mongoose connection (serverless-friendly)
│   ├── server.js         # Local dev entry (app.listen)
│   ├── api/index.js      # Serverless handler (connect DB, delegate to app)
│   ├── middleware/       # auth (JWT), upload (multer memoryStorage)
│   ├── models/           # User, Post, Comment
│   └── routes/           # auth, posts, comment, user, upload
└── frontend/
    └── src/
        ├── api/axios.js  # Axios instance + JWT interceptor
        ├── context/      # AuthContext
        ├── components/   # PostCard, CommentSection, auth/, ...
        └── pages/        # Home, PostDetail, Create/Edit, Profile, Login, Register
```

---

## Running Locally

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local `mongodb://localhost:27017/...` or Atlas)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # then fill in the values
npm run dev                 # starts on http://localhost:5000
```

`backend/.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/blog_platform
JWT_SECRET=your_secret_here
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
# Optional — leave blank to store uploads on local disk:
BLOB_READ_WRITE_TOKEN=
# Optional — only needed for Google login:
GOOGLE_CLIENT_ID=
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # then fill in the values
npm run dev                 # starts on http://localhost:5173
```

`frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
# Optional — only needed for Google login:
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## API Reference

Base URL: `/api` (locally `http://localhost:5000/api`). Protected routes require
an `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint              | Auth | Body                          | Description                       |
| ------ | --------------------- | ---- | ----------------------------- | --------------------------------- |
| POST   | `/auth/register`      | —    | `{ name, email, password }`   | Register; returns `{ token, user }` |
| POST   | `/auth/login`         | —    | `{ email, password }`         | Login; returns `{ token, user }`  |
| POST   | `/auth/logout`        | —    | —                             | Stateless logout acknowledgement  |
| POST   | `/auth/google`        | —    | `{ access_token }`            | Sign in with a Google access token |

### Posts
| Method | Endpoint        | Auth          | Description                                   |
| ------ | --------------- | ------------- | --------------------------------------------- |
| GET    | `/posts`        | —             | List posts. Query: `page`, `limit`, `search`  |
| GET    | `/posts/:id`    | —             | Get a single post                             |
| POST   | `/posts`        | yes           | Create a post `{ title, content, category?, coverImage? }` |
| PUT    | `/posts/:id`    | yes (author)  | Update a post                                 |
| DELETE | `/posts/:id`    | yes (author)  | Delete a post                                 |

### Comments
| Method | Endpoint                   | Auth          | Description                          |
| ------ | -------------------------- | ------------- | ------------------------------------ |
| GET    | `/posts/:id/comments`      | —             | List comments for a post             |
| POST   | `/posts/:id/comments`      | yes           | Add a comment `{ content, parent? }` |
| PUT    | `/comments/:id`            | yes (author)  | Edit a comment                       |
| DELETE | `/comments/:id`            | yes (author)  | Delete a comment (and its replies)   |

### Users
| Method | Endpoint              | Auth | Description                          |
| ------ | --------------------- | ---- | ------------------------------------ |
| GET    | `/users/profile`      | yes  | Current user's profile              |
| GET    | `/users/:id/posts`    | —    | Posts written by a user             |
| PUT    | `/users/profile`      | yes  | Update `{ name?, avatar? }`         |

### Upload
| Method | Endpoint    | Auth | Description                                          |
| ------ | ----------- | ---- | --------------------------------------------------- |
| POST   | `/upload`   | yes  | Multipart field `image`; returns `{ url }`          |

---

## Design Decisions & Assumptions

- **Stateless JWT auth.** Tokens are signed on the server and stored client-side.
  `logout` simply discards the token on the client, so no server session/blacklist
  is needed.
- **Threaded comments.** Comments are stored flat with an optional `parent`
  reference and rendered as flattened threads (Instagram/YouTube style), so any
  comment — including a reply — can be replied to. Deleting a comment walks and
  removes its entire descendant subtree to avoid orphans.
- **Unified Google login.** The client uses Google's implicit OAuth flow to obtain
  an access token; the backend verifies the token's audience matches our client ID,
  fetches the profile, then issues our **own** JWT. The rest of the app is unaware
  of how the user signed in. Accounts are linked by email, so a user who registered
  with a password can also use Google later.
- **Image storage.** Uploads use Vercel Blob in production (the serverless
  filesystem is read-only) and fall back to local disk during development.
- **Single Vercel project.** The frontend is served as static files and the API
  runs as a serverless function under `/api`, so the frontend calls the API
  **same-origin** (`VITE_API_URL=/api`) and there is no CORS in production. Vercel
  was chosen as the single platform hosting both the frontend and backend (an
  equivalent of the suggested Heroku + Netlify split).

---

## Deployment

Deployed to Vercel as one project:
- Frontend built with `vite build` → served from `frontend/dist`.
- Backend exposed as a serverless function at `/api/*`.
- Environment variables (`MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`,
  `VITE_*`, `BLOB_READ_WRITE_TOKEN`) are configured in the Vercel project.
- MongoDB Atlas network access allows `0.0.0.0/0` (Vercel uses dynamic IPs).
