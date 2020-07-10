.DEFAULT_GOAL:=help

key.pem:  ## Generate certificates to be able to run `https` on `localhost`.
	openssl req -nodes -newkey rsa:2048 -x509  -days 365 -keyout key.pem -out cert.pem -subj "/C=FR/CN=localhost"

serve: build  ## Local HTTP server with auto rebuild (with LiveReload).
	python3 serve.py --watch

serve-ssl: key.pem build  ## Local HTTPS server with auto rebuild (without LiveReload).
	python3 serve.py --watch --ssl

install:  ## Install Python and JS dependencies.
	python3 -m pip install -U pip setuptools wheel
	python3 -m pip install -r requirements.txt
	npm install

##
## Run JS unit tests matching a given pattern/browser engine.
##
## Examples:
##    make test-unit grep=profil
##    make test-integration browser=webkit grep=suivi
##    make test browser=webkit

test: test-unit test-integration

ifdef grep
script_flags = -- --grep $(grep)
else
script_flags =
endif

test-unit:  ## Run JS unit tests.
	npm run-script test $(script_flags)

test-integration: build  ## Run JS browser tests.
ifdef browser
	npm run-script --browser=$(browser) test-integration $(script_flags)
else
	npm run-script --browser=chromium test-integration $(script_flags)
	npm run-script --browser=firefox test-integration $(script_flags)
	npm run-script --browser=webkit test-integration $(script_flags)
endif

check-links:  # Check that links to external pages are still valid.
	python3 check.py links

lint:  ## Run ESLint + check code style.
	npm run-script lint
	./node_modules/.bin/prettier src/*.js src/**/*.js src/**/**/*.js src/**/**/**/*.js src/style.css --check

pretty:  ## Run PrettierJS.
	./node_modules/.bin/prettier src/*.js src/**/*.js src/**/**/*.js src/**/**/**/*.js src/style.css --write

build:  ## Build the index from `template.html` + contenus markdown files.
	python3 build.py all
	npm run-script build

.PHONY: serve serve-ssl install test test-unit test-integration check-links build help

help:  ## Display this help.
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
