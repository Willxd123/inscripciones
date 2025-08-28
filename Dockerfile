# Dockerfile para Academic Service
FROM node:20-alpine AS development

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json yarn.lock ./

# Instalar dependencias
RUN yarn install --frozen-lockfile

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando de desarrollo
CMD ["yarn", "start:dev"]

# Etapa de construcción
FROM node:20-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json yarn.lock ./

# Instalar todas las dependencias
RUN yarn install --frozen-lockfile

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN yarn build

# Etapa de producción
FROM node:20-alpine AS production

WORKDIR /app

# Crear usuario no privilegiado
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copiar archivos de dependencias
COPY package.json yarn.lock ./

# Instalar solo dependencias de producción
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copiar archivos construidos desde la etapa de build
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist

# Cambiar al usuario no privilegiado
USER nestjs

# Exponer puerto
EXPOSE 3000

# Comando de producción
CMD ["node", "dist/main.js"]