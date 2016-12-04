# what-is-the-latency

[![Docker Pulls](https://img.shields.io/docker/pulls/cloudinsight/what-is-the-latency.svg?style=flat-square)](https://hub.docker.com/r/cloudinsight/what-is-the-latency/)

> 监控仪表盘里最后一个有数据的点距离当前时间的差

![](https://github.com/cloudinsight/node-statsd-base-line/raw/master/screenshot.png)

可近似地认为这个值是用户对于系统实时性的感受，不过这个值会受到很多因素的影响

- 主机的时间
- 服务器的时间
- 网络延迟
- 消息系统的延迟
- 上传数据的间隔
- Bucket 的大小

### 启动

```
docker run --link influxdb cloudinsight/what-is-the-latency
```

### 环境变量

| 变量            | 默认值      | 说明               |
|-----------------|-------------|--------------------|
|INFLUXDB_HOST    | influxdb    | influxdb 的地址    |
|DB               | mydb        | 新建数据库的名字   |
|SCAN_INTERVAL    | 3000        | 请求间隔           |
