# STEP 1 build static website
# initial environment installations
FROM node:alpine as builder
RUN apk update && apk add --no-cache git
RUN apk add --no-cache --virtual .gyp \
        python2 \
        python \
        make \
        g++ \
    && apk del .gyp
RUN export PATH="$PATH:/usr/local/bin/python"

# set environmental variables
ENV NODE_ENV=prod

# app directory
WORKDIR /app
RUN ls

# copy required files
COPY jobtrakr-ang/package*.json ./
COPY aws_cred.json /
RUN ls

# install dependencies
RUN npm set progress=false && npm install
RUN ls /app

# copy project files into the docker image
COPY ./jobtrakr-ang  /app
RUN ls /app
RUN ls /app/src

# build angular app
RUN npm run-script deploy


# STEP 2 build a small nginx image with static website
FROM nginx:alpine
# remove default nginx website
RUN rm -rf /usr/share/nginx/html/*
# from 'builder' copy website to default nginx public folder
COPY --from=builder /app/dist/jobtrakr-ang /usr/share/nginx/html

# replace nginx conf file
RUN rm /etc/nginx/conf.d/default.conf
COPY server/jobtrak/client.conf /etc/nginx/conf.d/default.conf

# expose port 80
EXPOSE 80

# run image command
CMD ["nginx", "-g", "daemon off;"]
