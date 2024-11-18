all: install run

install:
	@echo "------------------------------------------------------------"
	@echo "Step 1: Installing dependencies for the client..."
	@cd client && npm install
	@echo "Step 2: Installing dependencies for the server..."
	@cd server && npm install
	@echo "------------------------------------------------------------"
	@echo "Dependencies installed successfully!"
	@echo "------------------------------------------------------------"
	@echo "Step 3: Building an optimized production build..."
	@cd client && npm run build
	@echo "Production build created successfully!"
	
run:
	@echo "------------------------------------------------------------"
	@echo "Running the server and serving the production build..."
	@echo "Starting the client on port 3000..."
	@cd client && nohup serve -s build & 
	@echo "------------------------------------------------------------"
	@echo "Starting the server on port 3001..."
	@cd server &&  node server.js 
	@echo "------------------------------------------------------------"
	@echo "Server and build are now running in the background."


stop:
	@echo "------------------------------------------------------------"
	@echo "Stopping server and client processes..."
	@for port in 3001 3000; do \
		echo "Checking for processes associated with port $$port..."; \
		PIDS=$$(lsof -t -i :$$port); \
		if [ -z "$$PIDS" ]; then \
			echo "No process running on port $$port."; \
		else \
			for PID in $$PIDS; do \
				echo "Killing process $$PID associated with port $$port..."; \
				kill -9 $$PID 2>/dev/null; \
				if [ $$? -eq 0 ]; then \
					echo "Successfully killed process $$PID on port $$port."; \
				else \
					echo "Failed to kill process $$PID on port $$port."; \
				fi \
			done \
		fi \
	done
	@echo "------------------------------------------------------------"
	@echo "All processes stopped successfully."


clean:
	@echo "------------------------------------------------------------"
	@echo "Removing build, node_modules, and package-lock.json files..."
	@cd client && rm -rf build/ node_modules/ package-lock.json
	@cd server && rm -rf node_modules/ package-lock.json
	@sleep 2
	@echo "Clean up completed."

dev:
	@echo "Running both client and server in development mode..."
	@cd server &&  npm start     # Start server in background
	@cd client && nohup npm start &           # Start client in foreground
	@echo "------------------------------------------------------------"
	@echo "Both client and server are now running in development mode."



	
help:
	@echo "------------------------------------------------------------"
	@echo "Available Makefile targets:"
	@echo "------------------------------------------------------------"
	@echo "  all:       Installs dependencies, builds production build, and runs client and server."
	@echo "  install:   Installs dependencies for both client and server, builds production build, serves it, and starts both client and server."
	@echo "  run:       Runs the server and serves the production build."
	@echo "  stop:      Stops the server and client processes using their PIDs."
	@echo "  clean:     Stops processes, removes build files, and cleans up."
	@echo "  dev:       Starts the client in development mode with hot reload."
	@echo "  help:      Prints this help message."

.PHONY: all install run stop clean dev help
