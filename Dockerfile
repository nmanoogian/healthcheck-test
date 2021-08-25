FROM node:14.17.3

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN npm install --production

COPY . .

CMD [ "node", "check.js" ]
