# FROM node:14-alpine

# # Create app directory
# RUN mkdir -p /usr/src/app/
# WORKDIR /usr/src/app/
# COPY . /usr/src/app/
# # Copy initial files

# ENV PORT=4000
# EXPOSE ${PORT}
# # Populate npmrc, install dependencies
# RUN yarn install --production
# RUN yarn build
# # Bundle app source

# CMD node ./dist/src/server.js && npx prisma migrate deploy

FROM node:14 AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package.json ./
COPY yarn.lock ./
COPY prisma ./prisma/

# Install app dependencies
RUN yarn

COPY . .

RUN yarn build

FROM node:14

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
EXPOSE 4000


CMD [ "yarn", "start" ]