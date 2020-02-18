FROM node:9
WORKDIR /app
COPY package-lock.json .
COPY package.json .
RUN npm install
COPY dist .
COPY .scripts/wait-for-it.sh .
CMD node index.js