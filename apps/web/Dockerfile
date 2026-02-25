FROM node:20-alpine

WORKDIR /app

# untuk dev: install deps dulu agar node_modules tidak hilang
COPY package*.json ./
RUN npm install

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]