# Use bash for better scripting
SHELL := /bin/bash

# Default target
.DEFAULT_GOAL := help

## Install dependencies
install:
	npm install
	cd client && npm install
	cd server && npm install

## Build both client and server
build:
	cd client && npm run build
	cd server && npm run build

## Build client
build-client:
	cd client && npm run build

## Build server
build-server:
	cd server && npm run build

## Clean both client and server
clean:
	cd client && npm run clean
	cd server && npm run clean

## Run client dev server
dev-client:
	cd client && npm run dev

## Run server dev watcher
dev-server:
	cd server && npm run dev:watch

## Run both dev processes (uses npm's concurrently)
dev:
	npm run dev

## Format both client and server
format:
	cd client && npm run format
	cd server && npm run format

## Show available commands
help:
	@echo "Available targets:"
	@echo "  make install      - Install dependencies"
	@echo "  make build-client - Build client"
	@echo "  make build-server - Build server"
	@echo "  make build        - Build client and server"
	@echo "  make clean        - Clean client and server"
	@echo "  make dev          - Run both dev servers"
	@echo "  make dev-client   - Run client dev server"
	@echo "  make dev-server   - Run server dev watcher"
	@echo "  make format       - Format client and server"
