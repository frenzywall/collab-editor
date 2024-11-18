# 🔄 Collaborative Real-Time Chat Room for your friends!

A collaborative real-time *chat* room built with **React**, **Node.js**, and **WebSocket**. This project consists of two main services:

- A **client** that provides the user interface
- A **server** that handles the backend and communication

## 📁 Project Structure
```
collaborative-editor/ .1
├── client/  .1            
├── server/  .1            
├── docker-compose.yml  .1
└── Makefile  .1         
├── Local-Dev(Test)/     .2
│   └── collaborative-editor-<Use for local development,(Docker not required)>-  .2
│       ├── client/      .2
│       ├── server/      .2
│       └── Makefile     .2
├── Quick-start/-<Get started quickly without any setup!(Docker-required)>-   .3      
  └── docker-compose.yml .3

```

## ✨ Features

* 🔄 Real-time collaboration in an editor
* ⚛️ React frontend with WebSocket communication to the backend
* 🐳 Dockerized environment for easy local development and production deployment
* ⚙️ Configurable settings for local and production setups

##  Requirements

* [Docker](https://www.docker.com/) and Docker Compose
* [Node.js](https://nodejs.org/) (for development, if you want to build locally)
* [GitHub Container Registry](https://ghcr.io/) (for pulling Docker images)

##  Setup use for .1 files, you need all .1 files.

- This context will build and run docker images based on current Dockerfile contexts in both client and server.

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/frenzywall/collaborative-editor.git
cd collaborative-editor
```

### 1️⃣ Build and Start Services with Docker Compose

Run the following command to build and start both the client and server containers:

```bash
docker-compose up -d
```

> **Note**: This will build Docker images for both services and start them in detached mode (-d)

## 2.Local Development Setup (Optional), Setup use for .2 files, you need all .2 files.

- This is intended for pure local developments, this setup would allow you to access localhost and devices connected across your network.

For a quick setup with default settings:

```bash

cd Local-Dev(Test)
make install
make run

```
- For help, do:
```bash
make help

```

> **Note**: Client runs on http://localhost:3000, Server on http://localhost:3001

## 🌐 Accessing the Application
## 🌐 Service Access

- Use the get_ip.sh script or the Get-IPV4 website page in this Git repo to get your current IPv4 address.

## (https://frenzywall.github.io/collab-editor/)

| Service  | URL                    | Description                    | On-Network                    |
|----------|------------------------|--------------------------------|-------------------------------|
| Frontend | http://localhost:3000  | Collaborative Editor Interface | http://<your-ipv4>:3000      |
| Backend  | http://localhost:3001  | WebSocket Server              | http://<your-ipv4>:3001      |

> **Note**: Replace `<your-ipv4>` with your machine's IPv4 address to access the services from other devices on your network.
> To find your IPv4 address:
> - Windows: Open CMD and type `ipconfig`
> - Linux/Mac: Open terminal and type `ifconfig` or `ip addr`

### Examples:
If your IP address is 192.168.1.100:
- Frontend: `http://192.168.1.100:3000`
- Backend: `http://192.168.1.100:3001`

### 3.Quick start!

- If you want to get started with the project without the hassle of setting up everything, this is for you!
- Simply download the compose file in collaborative-editor/Quick-Start/docker-compose.yl
- You don't need the rest of code, just the docker-compose.yml is enough.

```bash
cd Quick-start
```
- Run this where you have downloaded the .yml if you have not downloaded the entire repo.

```bash
docker-compose up -d

````
- And you are done!

##  Docker Images

Docker images are hosted on GitHub Container Registry (GHCR).

```bash
# Login to GitHub Container Registry
docker login ghcr.io

# Pull Images
docker pull ghcr.io/frenzywall/collab-editor/editor:client
docker pull ghcr.io/frenzywall/collab-editor/editor:server
```

##  Development

### Making Changes
- Frontend updates: Modify files in `client/src`
- Backend updates: Modify `server/server.js`
- Build & Run: Use `Makefile` or `docker-compose.yml`

## Contributing

1. Fork the repository
2.  Create a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3.  Commit your changes
   ```bash
   git commit -m 'Add amazing feature'
   ```
4.  Push to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5.  Open a Pull Request


##  Acknowledgments

- [React](https://reactjs.org/) - UI Library
- [Node.js](https://nodejs.org/) - Backend Runtime
- [Docker](https://www.docker.com/) - Containerization Platform
- [Makefile](https://www.gnu.org/software/make/#download) -GNU Project

---

