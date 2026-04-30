<div align="center">
  <h1>KalaSetu</h1>
  <p>A platform for artists, art lovers, events, marketplace listings, and crowdfunding.</p>
</div>

### Overview
**KalaSetu** is a community platform built to connect artists and art lovers in one place. It combines social discovery, artist profiles, events and opportunities, a marketplace for products, direct messaging, orders and bookings, and a crowdfunding hub for creative campaigns.

The project is split into:

- **Frontend**: Next.js 16 + React 19
- **Backend**: Express + MongoDB + Socket.IO

### Setup Instructions

This project has separate frontend and backend apps. Install dependencies for both before running locally.

1. Clone the repository:
    ```sh
    git clone https://github.com/he1senbrg/fsd kalasetu
    cd kalasetu
    ```

2. Install backend dependencies:
    ```sh
    cd backend
    npm install
    ```

3. Install frontend dependencies:
    ```sh
    cd ../frontend
    npm install
    ```

4. Create environment files:
    Create a `.env` file inside `backend/` and a `.env.local` file inside `frontend/`.

5. Start the backend:
    ```sh
    cd backend
    npm run dev
    ```

6. Start the frontend:
    ```sh
    cd frontend
    npm run dev
    ```

7. Open the app:
    ```sh
    http://localhost:3000
    ```

The backend API will run at:

```sh
http://localhost:5000/api
```

### Configuration

Before running the project, configure the following environment variables.

#### Backend: `backend/.env`

- Configure environment:
   ```bash
   cp .env.sample .env
   ```

- **PORT**: Port for the Express API server
    ```env
    PORT=5000
    ```

- **NODE_ENV**: Runtime environment
    ```env
    NODE_ENV=development
    ```

- **MONGODB_URI**: MongoDB connection string
    ```env
    MONGODB_URI=mongodb://127.0.0.1:27017
    ```

- **JWT_SECRET**: Secret used to sign authentication tokens
    ```env
    JWT_SECRET=replace_with_a_secure_secret
    ```

- **JWT_EXPIRES_IN**: Access token expiry time
    ```env
    JWT_EXPIRES_IN=7d
    ```

- **JWT_REFRESH_EXPIRES_IN**: Refresh token expiry time
    ```env
    JWT_REFRESH_EXPIRES_IN=30d
    ```

- **FRONTEND_URL**: Allowed frontend origin for CORS and email links
    ```env
    FRONTEND_URL=http://localhost:3000
    ```

- **AZURE_STORAGE_CONNECTION_STRING**: Azure Blob Storage connection string for uploads
    ```env
    AZURE_STORAGE_CONNECTION_STRING=your_azure_blob_connection_string
    ```

- **AZURE_STORAGE_CONTAINER_NAME**: Azure Blob container name
    ```env
    AZURE_STORAGE_CONTAINER_NAME=uploads
    ```

- **SMTP_HOST**: SMTP server host for transactional emails
    ```env
    SMTP_HOST=smtp.example.com
    ```

- **SMTP_PORT**: SMTP server port
    ```env
    SMTP_PORT=587
    ```

- **SMTP_USER**: SMTP username / sender address
    ```env
    SMTP_USER=your_email@example.com
    ```

- **SMTP_PASS**: SMTP password or app password
    ```env
    SMTP_PASS=your_smtp_password
    ```

#### Frontend: `frontend/.env.local`

- Configure environment:
   ```bash
   cp .env.local.sample .env.local
   ```

- **NEXT_PUBLIC_API_URL**: Public API base URL used by the frontend
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5000/api
    ```

### Useful Commands

#### Backend

- Run development server:
    ```sh
    npm run dev
    ```

- Run production server:
    ```sh
    npm start
    ```

- Seed sample data:
    ```sh
    npm run seed
    ```

#### Frontend

- Run development server:
    ```sh
    npm run dev
    ```

- Build for production:
    ```sh
    npm run build
    ```

- Start production build:
    ```sh
    npx serve@latest out
    ```

### License
This project is licensed under the GNU Affero General Public License v3 (AGPLv3). See [LICENSE](LICENSE) for more details.
