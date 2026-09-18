.PHONY: help install postgres postgres-down postgres-logs postgres-shell backend django start ios android web go migrate check typecheck expo-check django-check db-check doctor-ios clean

PYTHON ?= python3.13
VENV := backend/.venv
PIP := $(VENV)/bin/python -m pip
MANAGE := $(VENV)/bin/python backend/manage.py

help:
	@echo "ourMoment commands"
	@echo ""
	@echo "  make install       Install npm and Django dependencies"
	@echo "  make postgres      Start PostgreSQL in Docker"
	@echo "  make postgres-down Stop PostgreSQL"
	@echo "  make postgres-logs Tail PostgreSQL logs"
	@echo "  make postgres-shell Open psql inside the PostgreSQL container"
	@echo "  make backend       Start PostgreSQL, then run Django on http://127.0.0.1:8010"
	@echo "  make django        Run Django without starting PostgreSQL"
	@echo "  make start         Start Expo for the development build"
	@echo "  make ios           Build/install iOS development build"
	@echo "  make android       Build/install Android development build"
	@echo "  make web           Start Expo web"
	@echo "  make go            Start Expo Go fallback"
	@echo "  make migrate       Run Django migrations"
	@echo "  make check         Run Expo, TypeScript, Django, and database checks"
	@echo "  make doctor-ios    Show selected Xcode and macOS SDK paths"
	@echo "  make clean         Remove local generated backend files"

install:
	npm install
	$(PYTHON) -m venv $(VENV)
	$(PIP) install -r backend/requirements.txt

postgres:
	docker compose up -d postgres

postgres-down:
	docker compose down

postgres-logs:
	docker compose logs -f postgres

postgres-shell:
	docker compose exec postgres psql -U ourmoment -d ourmoment

backend: postgres
	npm run backend

django:
	npm run backend

start:
	npm start

ios:
	unset SDKROOT; npm run ios

android:
	npm run android

web:
	npm run web

go:
	npm run start:go

migrate:
	$(MANAGE) migrate

check: expo-check typecheck django-check db-check

typecheck:
	npx tsc --noEmit

expo-check:
	npx expo install --check

django-check:
	$(MANAGE) check

db-check:
	$(MANAGE) migrate --check

doctor-ios:
	@echo "Developer directory:"
	@xcode-select -p
	@echo ""
	@echo "Xcode version:"
	@xcodebuild -version
	@echo ""
	@echo "macOS SDK path:"
	@xcrun --sdk macosx --show-sdk-path
	@echo ""
	@echo "SDKROOT environment value:"
	@printenv SDKROOT || true

clean:
	rm -f backend/db.sqlite3
	find backend -type d -name __pycache__ -prune -exec rm -rf {} +
