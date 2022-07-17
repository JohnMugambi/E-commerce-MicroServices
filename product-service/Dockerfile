FROM node:12.16.3

WORKDIR /app

COPY ./package.json ./

RUN npm install

COPY ./ ./

EXPOSE 8080

CMD ["npm", "start"]