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
# Install app dependencies
COPY jobtrakr-ang/package.json jobtrakr-ang/package-lock.json /app/
COPY aws_cred.json /app/aws_cred.json
RUN cd /app && npm set progress=false && npm install
# Copy project files into the docker image
COPY ./jobtrakr-ang  /app
RUN cd /app && npm run build

# STEP 2 build a small nginx image with static website
FROM nginx:alpine
## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*
## From 'builder' copy website to default nginx public folder
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
