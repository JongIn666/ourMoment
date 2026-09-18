Creating the React Native template:
npx create-expo-app@latest .

Checking warning/ Audit the code:
npm audit fix --force

Setup Django backend:
python3.13 -m venv backend/.venv
backend/.venv/bin/python -m pip install "Django>=5.2,<6.0" "djangorestframework>=3.16,<4.0" "django-cors-headers>=4.7,<5.0"
backend/.venv/bin/python -m pip install "psycopg[binary]>=3.2,<4.0" "python-dotenv>=1.0,<2.0"
backend/.venv/bin/python backend/manage.py migrate

Setup PostgreSQL:
docker compose up -d postgres
make postgres
make migrate
make postgres-shell

Run locally:
make backend
make start

Development build setup:
npx expo install expo-dev-client

Native simulator builds:
make ios
make android

Expo Go fallback:
make go

Makefile:
make help
make install
make migrate
make check
