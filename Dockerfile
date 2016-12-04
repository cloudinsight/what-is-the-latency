FROM mhart/alpine-node:6
ENV DB mydb
ENV INFLUXDB_HOST influxdb
ENV SCAN_INTERVAL 3000
WORKDIR /src
ADD . .
RUN npm install
CMD ["node","index.js"]
