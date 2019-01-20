# STEP 1 build static website
FROM node:alpine as builder
RUN apk update && apk add --no-cache git
RUN apk add --no-cache --virtual .gyp \
        python2 \
        python \
        make \
        g++ \
    && apk del .gyp
RUN export PATH="$PATH:/usr/local/bin/python"

# Create app directory
WORKDIR /app
RUN ls
# Install app dependencies
COPY jobtrakr-ang/package.json jobtrakr-ang/package-lock.json ./
COPY aws_cred.json ./
RUN ls
RUN npm set progress=false && npm install
RUN ls /app
# Copy project files into the docker image
RUN ls
COPY ./jobtrakr-ang  /app
RUN ls /app
RUN npm run build


# STEP 2 build a small nginx image with static website
FROM nginx:alpine
## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*
## From 'builder' copy website to default nginx public folder
COPY --from=builder /app/dist/jobtrakr-ang /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
