# Connectto

Connectto is a small social app. You sign up, share posts (with a photo if you like), follow people, like and comment on what they share, and chat with them in real time.

## What you can do

- Write posts with an optional photo, and delete your own.
- Follow people. Home shows posts from you and the people you follow, or from everyone if you switch tabs.
- Like posts and leave comments.
- Search people by name and open a profile to see their posts, follower counts and who they follow.
- Message anyone directly. New messages show up instantly, with a dot on the chat icon until you read them.
- Light and dark themes.

## How it works

**Sessions.** Passwords are hashed with bcrypt. Signing in sets a JWT in an httpOnly cookie, so page scripts never see the token. Every API route except sign-up and sign-in checks it, and "who is asking" always comes from the token, never from an id in the request body or URL.

**Feed.** Posts load ten at a time using the id of the last post as a cursor (`?before=42`). New posts at the top don't shift the pages, and page 50 is as fast as page 1. One query returns each post with its author, like count, comment count and whether you've liked it.

**Likes and follows.** Both are join tables with composite primary keys, so the database itself rules out liking a post twice or following someone twice. The endpoints are idempotent: `PUT` to like or follow, `DELETE` to undo.

**Chat.** Sending a message is a plain `POST`. The server saves it first, then pushes it over Socket.IO to both people's rooms, so every open tab updates and nothing appears on screen that wasn't stored. The socket signs in with a one-minute token from `/api/auth/socket-token`, because in production it connects to a different domain where the session cookie isn't sent.

**Photos.** Images are kept in Postgres (`bytea`) and served from `/api/posts/:id/image` with a long cache header. The feed only carries a `has_image` flag, so lists stay small. At real scale they'd move to object storage.

## Architecture

```
React (Vercel)  ──/api──▶  Express API + Socket.IO (Render)  ──▶  PostgreSQL (Neon)
      │                              ▲
      └────── websocket (chat) ──────┘
```

- The web app calls `/api` on its own domain and Vercel forwards it to Render, so the session cookie is first-party.
- Vercel can't forward websockets, so the chat socket connects to Render directly through `VITE_SOCKET_URL`.

## Tech

React, React Router, Tailwind CSS, Socket.IO, Node.js, Express, PostgreSQL (`pg`, plain SQL), JWT, bcrypt, Zod, Multer.

## Running locally

You need Node 20+ and a PostgreSQL database.

```bash
# API
cd server
cp .env.example .env      # set DATABASE_URL and JWT_SECRET
npm install
npm run dev               # http://localhost:4000, creates tables on first start

# Web app
cd client
npm install
npm run dev               # http://localhost:5173, proxies /api and the chat socket to :4000
```

## Running with Docker

The database, the API and the web app start with one command, no env file needed.

```bash
docker compose up --build
```

Then open http://localhost:8081.

- `db` is Postgres 17. Data lives in the `pgdata` volume and survives restarts. It's also published on port 5434 if you want to look inside.
- `api` is the Express server. It starts once Postgres is healthy and creates the tables on boot. Compose gives it a development JWT secret; to use your own, put `JWT_SECRET=...` in a `.env` file next to `docker-compose.yml`.
- `web` builds the React app and serves it with nginx, which forwards `/api` to the API and upgrades `/socket.io` to a websocket for chat.

```bash
docker compose logs -f api     # follow the API logs
docker compose ps              # status and health of each container
docker compose down            # stop everything
docker compose down -v         # stop and wipe the database
```

## Deploying

**Database (Neon).** Create a project and copy the connection string (it ends with `sslmode=require`). Tables are created when the API starts.

**API (Render).** Create a Web Service from this repo with root directory `server`, build command `npm ci` and start command `npm start`, or use the included `render.yaml`. Set:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Neon connection string |
| `JWT_SECRET` | a long random string |
| `CLIENT_URL` | your Vercel URL, so the chat socket accepts it |
| `NODE_ENV` | `production` |
| `TRUST_PROXY` | `2` (Vercel and Render both sit in front of the API) |

**Web app (Vercel).** Import the repo with root directory `client`. Replace `YOUR-RENDER-SERVICE` in `client/vercel.json` with your Render URL, and add the environment variable `VITE_SOCKET_URL=https://your-api.onrender.com`.

## API

| Method | Path | |
| --- | --- | --- |
| POST | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` | Session in an httpOnly cookie |
| GET | `/api/auth/me`, `/api/auth/socket-token` | Current user, short-lived chat token |
| GET | `/api/users?q=` | Search by name, or suggestions without `q` |
| GET | `/api/users/:id`, `/api/users/:id/following` | Profile with counts, who they follow |
| PUT, DELETE | `/api/users/:id/follow` | Follow, unfollow |
| GET, POST | `/api/posts` | Feed (`scope`, `author`, `before`), new post (multipart, field `image`) |
| DELETE | `/api/posts/:id` | Delete your post |
| GET | `/api/posts/:id/image` | The post's photo |
| PUT, DELETE | `/api/posts/:id/like` | Like, unlike |
| GET, POST | `/api/posts/:id/comments` | Comments |
| GET | `/api/messages` | Your conversations, newest first |
| GET, POST | `/api/messages/:userId` | Messages with one person (`before` for older), send one |

Socket.IO event: `message`, sent to both people whenever a message is saved.

## Layout

```
docker-compose.yml  db + api + web for local runs
client/   React app (pages, components, small api client)
  Dockerfile, nginx.conf
server/
  Dockerfile
  src/routes/     auth, users, posts, messages
  src/socket.js   Socket.IO setup and rooms
  src/schema.sql  tables and indexes
```
