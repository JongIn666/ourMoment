# ourMoment

React Native Expo mobile app with a Django backend.

This project uses an Expo development build by default, not Expo Go.
Django uses PostgreSQL for local development.

## Get started

### Requirements

- Node.js 22.13.x or newer for Expo SDK 57
- Python 3.13
- Docker Desktop

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

That starts PostgreSQL first, then runs Django at `http://127.0.0.1:8010`.

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

The Expo app defaults to `http://127.0.0.1:8010` on iOS/web and `http://10.0.2.2:8010` on Android emulator. Override it with `EXPO_PUBLIC_API_URL` when needed:

```bash
# Terminal 1
backend/.venv/bin/python backend/manage.py runserver 0.0.0.0:8010

# Terminal 2
EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:8010 npm start
```

### Database

PostgreSQL runs in Docker on your Mac at `127.0.0.1:55432` and inside Docker at `5432`.

```bash
make postgres
make migrate
make postgres-shell
```

The Django connection settings live in `backend/.env`. Use `backend/.env.example` as the template for a fresh machine.

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
