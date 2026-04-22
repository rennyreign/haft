.PHONY: setup run test clean

setup:
	python3 -m venv venv
	./venv/bin/pip install --upgrade pip
	./venv/bin/pip install -r requirements.txt
	@echo ""
	@echo "Setup complete. Copy .env.example to .env and configure:"
	@echo "  cp .env.example .env"

run:
	./venv/bin/python operator.py

test:
	./venv/bin/python -m pytest tests/ -v

clean:
	rm -rf venv __pycache__ scraper/__pycache__ delivery/__pycache__
