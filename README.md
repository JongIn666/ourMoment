# ourMoment

React Native Expo mobile app with a Django backend.

This project uses an Expo development build by default, not Expo Go.
Django uses PostgreSQL for local development.

## Get started

### Requirements

- Node.js 22.13.x or newer for Expo SDK 57
- Python 3.13
- Docker Desktop

This project was made with Bash in mind. It is recommended to run it on Mac and Linux (or Windows Subsystem for Linux).

### Install

```bash
make install
make postgres
make migrate
```

### Run

Start the backend in one terminal:

```bash
make backend
```

That starts PostgreSQL first, then runs Django on port `8010`.

Start Expo in another terminal:

```bash
make ios
```

That compiles and installs your own development build on the iOS Simulator. For Android Emulator, run:

```bash
make android
```

After the development build is installed once, start the dev server with:

```bash
make start
```

Expo Go is still available for quick experiments:

```bash
make go
```

### Native simulator builds

These scripts create native simulator builds:

```bash
make ios
make android
```

They run `expo run:ios` and `expo run:android`.

### Backend API

The health endpoint is:

```bash
http://127.0.0.1:8010/api/health/
```

It checks both Django and the PostgreSQL connection.

YourMoment endpoints require `Authorization: Token <token>`. Personal posts have no group and are accessible only to their author.

| Method | Endpoint | Action |
| --- | --- | --- |
| GET | `/api/posts/` | List your personal posts, newest selected date first |
| POST | `/api/posts/` | Create a personal post |
| GET | `/api/posts/<id>/` | Read your post |
| PATCH | `/api/posts/<id>/` | Edit content or the selected date |
| DELETE | `/api/posts/<id>/` | Delete your post |

Create requests accept `content` and an optional ISO 8601 `createdAt` timestamp, which defaults to now. Edit requests accept either or both fields. Existing registration and profile endpoints save user information to the configured database.

The Expo app defaults to a backend URL derived from the Expo dev-server host, with simulator fallbacks for iOS/web and Android emulator. Override it with `EXPO_PUBLIC_API_URL` when needed:

```bash
# Terminal 1
make backend

# Terminal 2
EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:8010 npm start
```

### Tunneling
Tunneling is to be used when network restrictions and firewalls make access over the local network unfeasible. It allows both the frontend and the backend to be accessible over the public Internet.

Requirements:
- `@expo/ngrok` package, which can be installed via `npm i -g @expo/ngrok`
- Ngrok, via Ngrok Agent or `npm install ngrok -g`
- A registered Expo Go account
- A registered Ngrok account

First, find your free fixed domain at [Domains](https://dashboard.ngrok.com/domains) in the Ngrok dashboard.

Then, create the file `.env.local` and input the following:

```
NGROK_API_DOMAIN=[paste your domain here]
```

To route the backend through Ngrok:
```bash
make ngrok
```

To start Expo through the tunnel:
```bash
make tunnel
```

### Database

PostgreSQL runs in Docker on your Mac at `127.0.0.1:55432` and inside Docker at `5432`.

```bash
make postgres
make migrate
make postgres-shell
```

The Django connection settings live in `backend/.env`. Use `backend/.env.example` as the template for a fresh machine.

For [Neon](https://neon.com/docs/guides/django), create a project and copy the direct connection details from its Connect dialog with connection pooling disabled. Update the existing values in `backend/.env`:

```dotenv
POSTGRES_DB=neondb
POSTGRES_USER=your_neon_user
POSTGRES_PASSWORD=your_neon_password
POSTGRES_HOST=your_endpoint.neon.tech
POSTGRES_PORT=5432
POSTGRES_CONN_MAX_AGE=60
POSTGRES_SSLMODE=require
POSTGRES_CHANNEL_BINDING=require
```

Use the database name, user, password, and host shown by Neon. Run `make migrate` to create the tables, then `make django` to start the backend without Docker. Existing local records require a separate data transfer.

## Project Structure

- `src/`: Expo Router app and React Native code
- `backend/`: Django project
- `backend/api/`: starter API app

## Useful Checks

```bash
npx expo install --check
npx tsc --noEmit
backend/.venv/bin/python backend/manage.py check
```

Or run all checks together:

```bash
make check
```

## iOS Troubleshooting

If `pod install` fails with a missing `MacOSX*.sdk`, check the selected Xcode and SDK:

```bash
make doctor-ios
```

`make ios` clears `SDKROOT` before running Expo so stale Command Line Tools SDK paths do not break CocoaPods.
