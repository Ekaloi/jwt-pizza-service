const config = require('./config.js');
const os = require('os');

class Metrics {
    getCpuUsagePercentage() {
        const cpuUsage = os.loadavg()[0] / os.cpus().length;
        return cpuUsage.toFixed(2) * 100;
    }

     getMemoryUsagePercentage() {
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        const memoryUsage = (usedMemory / totalMemory) * 100;
        return memoryUsage.toFixed(2);
    }  

  constructor() {
    this.totalRequests = 0;
    this.postRequests = 0;
    this.getRequests = 0;
    this.delRequests = 0;
    this.putRequests = 0;
    this.activeUsers =  0;
    this.successfulLogins = 0;
    this.failedLogins = 0;
    this.pizzaSoldPerMinute = 0;
    this.creationFailures = 0;
    this.revenuePerMinute = 0;
    this.latency = [];

    // This will periodically sent metrics to Grafana
    const timer = setInterval(() => {
      this.sendMetricToGrafana('request', 'all', 'total', this.totalRequests);
      this.sendMetricToGrafana('request', 'post', 'total', this.postRequests);
      this.sendMetricToGrafana('request', 'delete', 'total', this.delRequests);
      this.sendMetricToGrafana('request', 'get', 'total', this.getRequests);
      this.sendMetricToGrafana('request', 'put', 'total', this.putRequests);
      this.sendMetricNonReqToGrafana('CPU Usage', 'CPU', this.getCpuUsagePercentage());
      this.sendMetricNonReqToGrafana('Memory Usage', 'Memory', this.getMemoryUsagePercentage());
      this.sendMetricNonReqToGrafana('Active users', 'users', this.activeUsers);
      this.sendMetricNonReqToGrafana('Successful Login', 'Login', this.successfulLogins);
      this.sendMetricNonReqToGrafana('Failed Login Attempts', 'Login Failed', this.failedLogins);
      this.sendMetricNonReqToGrafana('Pizzas Sold', 'Pizza', this.pizzaSoldPerMinute);
      this.sendMetricNonReqToGrafana('Creation Failures','creation failed', this.creationFailures);
      this.sendMetricNonReqToGrafana('Revenue per minute', 'Rev', this.revenuePerMinute);
      this.sendMetricNonReqToGrafana('Latency', 'Lat', this.latency);
    }, 10000);
    timer.unref();
  }

  middleware(req, res, next){
    let method = req.method;
    console.log(res);
    console.log(next);
    
    this.incrementRequests();
    if(method == 'POST'){
        this.incrementPostRequests();
    }else if(method == 'PUT'){
        this.incrementPutRequests();
    }else if(method == 'DELETE'){
        this.incrementDelRequests();
    }else if(method == 'GET'){
        this.incrementGetRequests();
    }

  }

  incrementPizzaSold(){
    this.pizzaSoldPerMinute++;
  }

  addRevenue(profit){
    this.revenuePerMinute += profit;
  }

  incrementSuccessfulLogin(){
    this.successfulLogins++;
  }

  incrementFailedLogins(){
    this.failedLogins++;
  }

  incrementActiveUsers(){
    this.activeUsers++;
  }

  decrementActiveUSers(){
    this.activeUsers--;
  }

  incrementRequests() {
    this.totalRequests++;
  }

  incrementPutRequests() {
    this.putRequests++;
  } 

  incrementGetRequests() {
    this.getRequests++;
  }

  incrementPostRequests() {
    this.postRequests++;
  }

  incrementDelRequests() {
    this.delRequests++;
  }

  sendMetricToGrafana(metricPrefix, httpMethod, metricName, metricValue) {
    const metric = `${metricPrefix},source=${config.source},method=${httpMethod} ${metricName}=${metricValue}`;

    fetch(`${config.url}`, {
      method: 'post',
      body: metric,
      headers: { Authorization: `Bearer ${config.userId}:${config.apiKey}` },
    })
      .then((response) => {
        if (!response.ok) {
          console.error('Failed to push metrics data to Grafana');
        } else {
          console.log(`Pushed ${metric}`);
        }
      })
      .catch((error) => {
        console.error('Error pushing metrics:', error);
      });
  }

  sendMetricNonReqToGrafana(metricPrefix, metricName, metricValue) {
    const metric = `${metricPrefix},source=${config.source} ${metricName}=${metricValue}`;

    fetch(`${config.url}`, {
      method: 'post',
      body: metric,
      headers: { Authorization: `Bearer ${config.userId}:${config.apiKey}` },
    })
      .then((response) => {
        if (!response.ok) {
          console.error('Failed to push metrics data to Grafana');
        } else {
          console.log(`Pushed ${metric}`);
        }
      })
      .catch((error) => {
        console.error('Error pushing metrics:', error);
      });
  }



     
}

const metrics = new Metrics();
module.exports = metrics;