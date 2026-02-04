# 🪣 MinIO Bucket Manager

> The missing UI for managing MinIO bucket visibility and public access policies easily.

![MinIO Manager](https://via.placeholder.com/1200x600?text=MinIO+Manager+Dashboard+Preview)

A lightweight, secure, and modern web interface to manage your MinIO storage. Toggle **Public/Private** access, explore files, and manage buckets without dealing with complex JSON policies or CLI commands.

---

## ✨ Features

- **🚀 Instant Access Control**: Toggle buckets between **Public** (Read-only) and **Private** with a simple switch.
- **📂 File Explorer**: Browse folders, preview images/videos, and download files securely using presigned URLs.
- **🔐 Secure**: JWT-based authentication. No direct exposure of MinIO admin ports required.
- **🎨 Modern UI**: "Glassmorphism" design, Dark/Light mode, and fully responsive.
- **🌍 Multi-language**: 🇺🇸 English, 🇪🇸 Español, 🇧🇷 Portugués, 🇫🇷 Français, 🇯🇵 日本語, 🇨🇳 中文.
- **🐳 Docker Ready**: Zero-config deployment using GitHub Container Registry.

---

## 🚀 Quick Start (Production)

You don't need to clone the code. Just use `docker-compose`.

### 1. Create a `docker-compose.yml`

```yaml
version: "3.8"

services:
  minio-manager:
    image: ghcr.io/ameth1208/minio-bucket-manager:latest
    container_name: minio-manager
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: always
```

### 2. Configure Credentials (`.env`)

Create a `.env` file in the same directory:

```bash
# App Access Credentials (You choose these)
ADMIN_USER=admin
ADMIN_PASS=supersecretpassword
JWT_SECRET=change_this_to_something_random

# Your Existing MinIO Server Connection
MINIO_ENDPOINT=minio.example.com
MINIO_PORT=9000
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=your_minio_access_key
MINIO_SECRET_KEY=your_minio_secret_key
```

### 3. Run

```bash
docker-compose up -d
```

Visit `http://localhost:3000`. Done! 🎉

---

## 🛠️ Development (Local)

If you want to contribute or modify the code:

1.  **Clone the repo:**

    ```bash
    git clone https://github.com/ameth1208/minio-bucket-manager.git
    cd minio-bucket-manager
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Run with MinIO (All-in-one):**
    This starts a local MinIO instance + the App.

    ```bash
    docker-compose up --build
    ```

    - **App:** `http://localhost:3000`
    - **MinIO Console:** `http://localhost:9001` (User: `minioadmin`, Pass: `minioadmin`)

4.  **Run App Standalone (Node.js):**
    ```bash
    # Build frontend/backend
    npm run build
    # Start server
    npm start
    ```

---

## ⚙️ Configuration Variables

| Variable           | Description                            | Default     |
| :----------------- | :------------------------------------- | :---------- |
| `PORT`             | App listening port                     | `3000`      |
| `ADMIN_USER`       | Username for the Manager login         | `admin`     |
| `ADMIN_PASS`       | Password for the Manager login         | `admin`     |
| `JWT_SECRET`       | Secret to sign session tokens          | `secret`    |
| `MINIO_ENDPOINT`   | MinIO Host/IP (Do NOT include http://) | `localhost` |
| `MINIO_PORT`       | MinIO API Port                         | `9000`      |
| `MINIO_USE_SSL`    | Set to `true` if MinIO uses HTTPS      | `false`     |
| `MINIO_ACCESS_KEY` | MinIO Access Key                       | -           |
| `MINIO_SECRET_KEY` | MinIO Secret Key                       | -           |

---

## 📦 CI/CD

This repo includes a **GitHub Action** that automatically builds and publishes the Docker image to **GitHub Container Registry (GHCR)** on every push to `main`.

---

&copy; 2026 [Ameth Galarcio](https://amethgm.com). Open Source under MIT License.
