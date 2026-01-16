
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package files first (to cache dependencies)
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the code
COPY . .

# 6. Expose the port Vite runs on
EXPOSE 5173

# 7. Start the app
# --host is CRITICAL: it lets your PC access the container's localhost
CMD ["npm", "run", "dev", "--", "--host"]