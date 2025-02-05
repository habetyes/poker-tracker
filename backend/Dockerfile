# Use an official Node.js runtime as the base image
FROM node:16

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

EXPOSE 5000

CMD ["npm", "start"]


