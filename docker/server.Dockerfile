FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source
COPY apps/server ./apps/server
COPY packages/shared ./packages/shared

# Build shared package
RUN npm run build:shared

# Generate Prisma client
RUN npm run db:generate

WORKDIR /app

EXPOSE 3000

CMD ["npm", "run", "dev:server"]
