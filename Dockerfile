# Root-level Dockerfile for the SERVER (used when deploying from repo root on Render)
FROM node:18-alpine

WORKDIR /app

# Copy server package files and install dependencies
COPY server/package*.json ./
RUN npm install --production

# Copy server source code
COPY server/ .

EXPOSE 5000

CMD ["node", "server.js"]
