# 🔄 Collaborative Real-Time Chat Room for your friends!

A collaborative real-time *chat* room built with **React**, **Node.js**, and **WebSocket**. This project consists of two main services:

- A **client** that provides the user interface.
- A **server** that handles the backend and communication.

<div style="display: flex; justify-content: space-between;">
  <img src="https://raw.githubusercontent.com/frenzywall/collab-editor/main/client/src/assets/1.gif" alt="GIF 1" style="width: 100%; height: auto;"/>
</div>


## 📁 Project Structure
```
collab-editor/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── config/                 # Monitoring configuration
│   ├── datasource.yml      # Grafana datasource
│   ├── prometheus.yml      # Prometheus config
│   └── rules.yml           # Alert rules
├── Quick-start/            # Ready-to-run deployment( Preferred Method, download just this folder)
└── docker-compose.yml      # Container orchestration

```

## ✨ Features.

* 🔄 Real-time collaboration in an editor
* ⚛️ React frontend with WebSocket communication to the backend
* 🐳 Dockerized environment for easy local development and production deployment
* ⚙️ Configurable settings for local and production setups
* 📊 Metrics collection and visualization with **Prometheus** and **Grafana**
* 🌐 Nginx-powered static content delivery with built in cache.

##  Requirements

* [Docker](https://www.docker.com/) and Docker Compose
* [Node.js](https://nodejs.org/) (for development, if you want to build locally)
* [GitHub Container Registry](https://ghcr.io/) (for pulling Docker images)


### 1.Quick start!(Suggested!)[Method-1]

<div style="display: flex; justify-content: space-between;">
  <img src="https://raw.githubusercontent.com/frenzywall/collab-editor/main/client/src/assets/2.gif" alt="GIF 2" style="width: 48%; height: auto;"/>
  <img src="https://raw.githubusercontent.com/frenzywall/collab-editor/main/client/src/assets/3.gif" alt="GIF 3" style="width: 48%; height: auto;"/>
</div>


- If you want to get started with the project without the hassle of setting up everything, this is for you!
- Simply download the folder(If you are in main branch, main is default) in collaborative-editor/Quick-Start/
- You don't need the rest of code! How cool!!

```bash
cd Quick-start
```
- Run this where you have downloaded the .yml if you have not downloaded the entire repo.

```bash
docker-compose up -d

````
- And you are done!

### 2. Clone the Repository[Method-2]

```bash
git clone https://github.com/frenzywall/collaborative-editor.git
cd collaborative-editor
```

###  Build and Start Services with Docker Compose

-  Setup use for .1 files, you need all .1 files.

- This context will build and run docker images based on current Dockerfile contexts in both client and server.

Run the following command to build and start both the client and server containers:

```bash
docker-compose up -d
```

> **Note**: This will build Docker images for both services and start them in detached mode (-d)



## 🌐 Accessing the Application
## 🌐 Service Access

- Use the get_ip.sh script or the Get-IPV4 website page in this Git repo to get your current IPv4 address.

## (https://frenzywall.github.io/collab-editor/)

| Service  | URL                    | Description                    | On-Network                     |
|----------|------------------------|--------------------------------|--------------------------------|
| Frontend | http://localhost:3000  | Collaborative Editor Interface | http://(your-ipv4):3000        |
| Backend  | http://localhost:3001  | WebSocket Server               | http://(your-ipv4):3001        |

> **Note**: Replace (your-ipv4) with your machine's IPv4 address to access the services from other devices on your network.
> To find your IPv4 address:
> - Windows: Open CMD and type `ipconfig`
> - Linux/Mac: Open terminal and type `ifconfig` or `ip addr`

### Examples:
If your IP address is 192.168.1.100:
- Frontend: `http://192.168.1.100:3000`
- Backend: `http://192.168.1.100:3001`

## 💡 Metrics with Prometheus and Grafana

### Setup Metrics

This project includes **Prometheus** for metrics collection and **Grafana** for visualization.

### Running Prometheus and Grafana

Prometheus and Grafana are included in the `docker-compose.yml` file. Start them using:

```bash
docker-compose up -d prometheus grafana
```

### Accessing the Metrics Dashboards

| Service    | URL                                            | Default Credentials |
| ---------- | ---------------------------------------------- | ------------------- |
| Prometheus | [http://localhost:9090](http://localhost:9090) | N/A                 |
| Grafana    | [http://localhost:3002](http://localhost:3002) | admin/admin         |

#### Prometheus Configuration

Prometheus configuration is located in `prometheus/prometheus.yml` and includes scrape jobs to monitor the application.

1. You can add services to the prometheus.yml with an metrics end point exposed. Currently, only server(container-name), prometheus and docker itself are configured to expose their metric end points.

2. Access [http://localhost:9090], check status dashboard to see what serives are being discovered, it should list the three services and should report healthy.

3. Alerts are also configured to alert if the server state change(down/up/stopped/unhealthy) to the users(Needs manual config of alertmanager and grafana setup,(to be provisioned in later updated!))

- TRY OUT!
In you docker console, check manually stopping the server container, you should see the alert getting triggered!

### Steps to Access Grafana

1. Open `http://localhost:3002` in your browser.
2. Login with the default credentials (`admin`/`admin`). (Will be autofilled.)
3. Add a new dashboard or explore the pre-configured dashboard in the `grafana/provisioning/` directory.
4. Automatically configured to use prometheus url, no manual config is required except logging in with the    default credentials provided(You can change them in "docker-compose.yml" file)
5. Visualize metrics like active users, message counts, and system health.


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

