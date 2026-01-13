FROM node:18-bullseye

# Install netcat for simple TCP wait
RUN apt-get update && apt-get install -y netcat && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy package.json first to install deps

# Copy package.json first to install deps
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy entrypoint script and make it executable
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Copy the rest of the source
COPY . .

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
CMD ["npm", "start"]
