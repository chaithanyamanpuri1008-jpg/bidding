# Secure Online Bidding and Winner Determination System

> **GitHub Repository:** [https://github.com/chaithanyamanpuri1008-jpg/bidding](https://github.com/chaithanyamanpuri1008-jpg/bidding)

A modern, scalable MERN stack web application for online bidding with real-time Socket.io integration and AI-assisted auction descriptions using Groq LLM.

## Tech Stack
* **Frontend:** React (Vite), TailwindCSS, Zustand, Framer Motion, Socket.io-client, Shadcn-like Custom UI.
* **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io, JWT, bcrypt, Helmet.
* **AI Integration:** Groq API (llama-3.1-8b-instant) for smart item descriptions.

## Prerequisites
* Node.js v18+
* MongoDB URI
* Groq API Key

## Local Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/chaithanyamanpuri1008-jpg/bidding.git
   cd bidding
   ```
2. **Setup Server:**
   ```bash
   cd server
   npm install
   # Create a .env file based on the template
   npm run dev
   ```

3. **Setup Client:**
   ```bash
   cd client
   npm install --legacy-peer-deps
   # Create a .env file based on the template
   npm run dev
   ```

## Production Deployment (Docker)

A `docker-compose.yml` file is provided for easy deployment.

1. Ensure Docker and Docker Compose are installed.
2. Configure `.env` files in both `client` and `server` roots.
3. Build and Run:
   ```bash
   docker-compose up --build -d
   ```
4. Access the application on `http://localhost`.

## Security Features
- **Helmet Middleware**: Protects against common web vulnerabilities.
- **Express Rate Limiting**: Prevents brute-force API requests.
- **JWT Authorization**: Secures robust authenticated routes.
- **Bcrypt**: Encrypts password data efficiently.
- **Input Validation:** Prevents bad requests early at the schema level.

## AI Description Generator
Powered by the Groq API (llama-3.1-8b-instant), this feature assists Admins in generating rich, premium, and SEO-friendly descriptions based on minimal input text.

## Real-Time Engine Structure
- Uses **Socket.io rooms** for isolated auction environments.
- Automatically pushes active `new_bid` events.
- Client state naturally updates through `zustand`.
