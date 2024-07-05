# Usa una imagen base oficial de Node.js
FROM node:14

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el archivo package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm ci

# Copia el resto de los archivos del proyecto al contenedor
COPY . .

# Construye la aplicación Ember
RUN npm run build

# El directorio dist contiene la salida de la construcción
CMD ["sh", "-c", "cp -r /app/dist/* /output"]
