FROM node:12.16.3

WORKDIR /app

COPY ./package.json ./

RUN npm install

COPY ./ ./

EXPOSE 7070

CMD ["npm", "start"]