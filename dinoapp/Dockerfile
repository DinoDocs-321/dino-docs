# Dockerfile for React app (dinoapp)
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy over package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install the dependencies
RUN npm install

# Copy all the source files from your local machine to the container
COPY . .

# Build the React app for production
RUN npm run build

# Use a production-ready image to serve the built files
FROM nginx:alpine
COPY --from=0 /usr/src/app/build /usr/share/nginx/html

# Expose port 80 to the host machine
EXPOSE 80

# Start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]
