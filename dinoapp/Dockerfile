# Dockerfile for React Frontend
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install && npm install bson

# Copy the rest of the application files
COPY . .

# Expose the necessary port
EXPOSE 3000

# Command to run the React server
CMD ["npm", "start"]
