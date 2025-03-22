FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Add these environment variables
ENV HOST=0.0.0.0
ENV PORT=5173

EXPOSE 5173

# Modified command to ensure Vite is accessible
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"] 