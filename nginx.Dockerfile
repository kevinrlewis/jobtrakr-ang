# STEP 2 build a small nginx image with static website
FROM nginx:alpine
# remove default nginx website
RUN rm -rf /usr/share/nginx/html/*
# from 'builder' copy website to default nginx public folder
COPY /app/dist/jobtrakr-ang /usr/share/nginx/html

# replace nginx conf file
RUN rm /etc/nginx/conf.d/default.conf
COPY server/jobtrak/client.conf /etc/nginx/conf.d/default.conf

# expose port 80
EXPOSE 80

# run image command
CMD ["nginx", "-g", "daemon off;"]
