FROM icr.io/codeengine/node:12-alpine
RUN npm install --save express@4.18.2  express-session@1.17.3 passport@0.5.2 log4js@6.9.1 pug@3.0.2 ibmcloud-appid@7.0.0

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# If you are building your code for production
RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "node", "app.js" ]
