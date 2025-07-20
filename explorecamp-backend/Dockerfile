# Use official Node.js LTS image as base
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose port your app listens on
EXPOSE 5000

# Start the app
CMD ["node", "src/index.js"]

# Create uploads directory inside the container
RUN mkdir -p /app/uploads

