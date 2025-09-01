# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy everything into the container
COPY . .

# Install dependencies
RUN npm install

# Start the server
CMD ["node", "server.js"]
