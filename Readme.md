# Collaborative Editor

A collaborative real-time editor built with React, Node.js, and WebSocket. This project consists of two main services: a **client** that provides the user interface, and a **server** that handles the backend and communication.

## Project Structure

```plaintext
collaborative-editor/
├── client                    # React frontend
├── docker-compose.yml        # Docker Compose file for running the application
├── Local-Dev(Test)           # Local development test configuration
│   ├── collaborative-editor-<hash>
│   │   ├── client            # Local client configuration
│   │   ├── Makefile          # Build configuration for the local environment
│   │   └── server            # Local server configuration
├── Makefile                  # Global build and deploy script
├── Quick-start               # Quick start folder with a basic docker-compose file
│   └── docker-compose.yml
└── server                    # Node.js backend
Features
Real-time collaboration in an editor.
React frontend with WebSocket communication to the backend.
Dockerized environment for easy local development and production deployment.
Configurable settings for local and production setups.
Requirements
Docker and Docker Compose
Node.js (for development, if you want to build locally)
GitHub Container Registry (for pulling Docker images)
Setup
1. Clone the Repository
bash
Copy code
git clone https://github.com/frenzywall/collaborative-editor.git
cd collaborative-editor
2. Build and Start the Services with Docker Compose
Run the following command to build and start both the client and server containers using Docker Compose.

bash
Copy code
docker-compose up -d
This will:

Build the Docker images for both client and server services.
Start both services in detached mode (-d).
3. Quick Start (with pre-configured environment)
Navigate to the Quick-start directory and run the docker-compose.yml there to set up the project quickly with default settings:

bash
Copy code
cd Quick-start
docker-compose up -d
4. Running the Application Locally (Optional)
If you prefer to run the client and server locally without Docker, follow these steps:

Client: Navigate to the client folder and install dependencies:

bash
Copy code
cd client
npm install
npm start
Server: Navigate to the server folder and install dependencies:

bash
Copy code
cd server
npm install
npm start
This will run the client on http://localhost:3000 and the server on http://localhost:3001.

5. Accessing the Application
Frontend: Visit http://localhost:3000 to use the collaborative editor.
Backend: The backend server runs at http://localhost:3001, which handles WebSocket connections for real-time collaboration.
Docker Images
Docker images are stored on GitHub Container Registry (GHCR) and can be pulled directly from there. Make sure you log in with your GitHub credentials before pulling images if needed.

For example:

bash
Copy code
docker login ghcr.io
docker pull ghcr.io/frenzywall/collab-editor/editor:client
docker pull ghcr.io/frenzywall/collab-editor/editor:server
Development
To make changes or run the app locally:

Make changes in client/src for frontend updates.
Modify server/server.js for backend updates.
Use the Makefile or docker-compose.yml for building and running the containers.
Testing Locally (Optional)
You can run the application in a test environment by using the Local-Dev(Test) folder. This includes test configurations for both the client and server:

Go to Local-Dev(Test) folder:

bash
Copy code
cd Local-Dev(Test)
Use the Makefile to build and run locally:

bash
Copy code
make build
make up
Contributing
Fork the repository.
Create a new branch (git checkout -b feature-branch).
Commit your changes (git commit -am 'Add new feature').
Push to the branch (git push origin feature-branch).
Create a pull request.
License
Distributed under the MIT License. See LICENSE for more information.

Acknowledgments
React - JavaScript library for building user interfaces.
Node.js - JavaScript runtime used for the backend server.
Docker - Tool to containerize applications for consistent environments.
markdown
Copy code

### Key Points:
- **Project Overview**: Brief description of what the project does.
- **Directory Structure**: Description of the folder structure for easy navigation.
- **Setup Instructions**: Details for setting up the project using Docker and locally.
- **Running the Application**: Information on how to access the app after setup.
- **Docker Images**: Instructions for pulling images from GHCR if needed.
- **Development and Contributing**: Info on how to develop and contribute to the proj