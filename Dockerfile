# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json if available
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Run utils.js during the build
RUN node utils.js

# Expose the port the app runs on
EXPOSE 3000

# Command to start the server
CMD [ "node", "server.js" ]
