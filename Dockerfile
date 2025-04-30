FROM node:18-alpine3.18

# Installer les dépendances système (sharp, etc.)
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/

COPY package.json package-lock.json ./
RUN npm install

ENV PATH /opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . .

RUN chown -R node:node /opt/app
USER node
RUN ["npm", "run", "develop"]

EXPOSE 1337
CMD ["npm", "run", "develop"]
