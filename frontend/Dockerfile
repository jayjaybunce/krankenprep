FROM node:22

WORKDIR /app

# Copy only package manifests first
COPY package.json package-lock.json ./

# Install deps IN the container
RUN npm install

# Then copy the rest of your source
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
