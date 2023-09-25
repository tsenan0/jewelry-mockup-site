FROM ubuntu:20.04

# Install Node.js and npm
RUN apt-get update \
    && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /workspace/application/prototypes/betaPrototype
 
# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port on which the application listens (if needed)
 EXPOSE 8080

# Set the command to run the Node.js application
CMD [ "npm", "start" ]
