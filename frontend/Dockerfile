FROM node:alpine

WORKDIR /trans

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]

# RUN npm run build
# CMD ["npm", "run", "start"]
