FROM node:12-alpine as builder

WORKDIR /app
COPY package.json /app/package.json
RUN npm install
COPY . /app
RUN npm run build

FROM node:12-alpine
WORKDIR /app
COPY --from=builder /app/build /app
COPY package.json /app/package.json
RUN npm install

EXPOSE 9000 
USER node
CMD ["node", "index.js"]