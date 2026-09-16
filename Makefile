.PHONY: help install backend start ios android web go migrate check typecheck expo-check django-check clean

PYTHON ?= python3.13
VENV := backend/.venv
PIP := $(VENV)/bin/python -m pip
MANAGE := $(VENV)/bin/python backend/manage.py

help:
	@echo "ourMoment commands"
	@echo ""
	@echo "  make install       Install npm and Django dependencies"
	@echo "  make backend       Run Django on http://127.0.0.1:8010"
	@echo "  make start         Start Expo for the development build"
	@echo "  make ios           Build/install iOS development build"
	@echo "  make android       Build/install Android development build"
	@echo "  make web           Start Expo web"
	@echo "  make go            Start Expo Go fallback"
	@echo "  make migrate       Run Django migrations"
	@echo "  make check         Run Expo, TypeScript, and Django checks"
	@echo "  make clean         Remove local generated backend files"

install:
	npm install
	$(PYTHON) -m venv $(VENV)
	$(PIP) install -r backend/requirements.txt

backend:
	npm run backend

start:
	npm start

ios:
	npm run ios

android:
	npm run android

web:
	npm run web

go:
	npm run start:go

migrate:
	$(MANAGE) migrate

check: expo-check typecheck django-check

typecheck:
	npx tsc --noEmit

expo-check:
	npx expo install --check

django-check:
	$(MANAGE) check

clean:
	rm -f backend/db.sqlite3
	find backend -type d -name __pycache__ -prune -exec rm -rf {} +
