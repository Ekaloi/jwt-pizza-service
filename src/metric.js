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
    
    calcPizzaLatency(){
        if(this.pizzaLatency.length == 0){
            return 0
        }
        const sum = this.pizzaLatency.reduce((acc, num) => acc + num, 0);
        const avg = sum / this.pizzaLatency.length;
        this.pizzaLatency = [];
        return avg;
    }

    calcServiceLatency(){
        if(this.serviceLatency.length == 0){
            return 0
        }
        const sum = this.serviceLatency.reduce((acc, num) => acc + num, 0);
        const avg = sum / this.serviceLatency.length;
        this.serviceLatency = [];
        return avg;
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
    this.pizzaLatency = [];
    this.serviceLatency = [];

    // This will periodically sent metrics to Grafana
    const timer = setInterval(() => {
      this.sendMetricToGrafana('request', 'all', 'total', this.totalRequests);
      this.sendMetricToGrafana('request', 'post', 'total', this.postRequests);
      this.sendMetricToGrafana('request', 'delete', 'total', this.delRequests);
      this.sendMetricToGrafana('request', 'get', 'total', this.getRequests);
      this.sendMetricToGrafana('request', 'put', 'total', this.putRequests);
      this.sendMetricNonReqToGrafana('cpu_usage', 'cpu', this.getCpuUsagePercentage());
      this.sendMetricNonReqToGrafana('memory_usage', 'memory', this.getMemoryUsagePercentage());
      this.sendMetricNonReqToGrafana('active_users', 'users', this.activeUsers);
      this.sendMetricNonReqToGrafana('successful_login', 'login', this.successfulLogins);
      this.sendMetricNonReqToGrafana('failed_login', 'logfailed', this.failedLogins);
      this.sendMetricNonReqToGrafana('pizzas_sold', 'pizza', this.pizzaSoldPerMinute);
      this.sendMetricNonReqToGrafana('creation_failures','creation', this.creationFailures);
      this.sendMetricNonReqToGrafana('revenue_minute', 'rev', this.revenuePerMinute);
      this.sendMetricNonReqToGrafana('pizza_latency', 'p', this.calcPizzaLatency());
      this.sendMetricNonReqToGrafana('service_latency', 's', this.calcServiceLatency());
    }, 10000);
    timer.unref();
  }

  middleware(req, _, next){
    let method = req.method;
    
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
    

    next();
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

  decrementActiveUsers(){
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

  incrementCreationsFailed(){
    this.creationFailures++;
  }

  sendMetricToGrafana(metricPrefix, httpMethod, metricName, metricValue) {
    const metric = `${metricPrefix},source=${config.metrics.source},method=${httpMethod} ${metricName}=${metricValue}`;

    fetch(`${config.metrics.url}`, {
      method: 'post',
      body: metric,
      headers: { Authorization: `Bearer ${config.metrics.userId}:${config.metrics.apiKey}` },
    })
      .then((response) => {
        if (!response.ok) {
          console.error(`Failed to push ${metric} data to Grafana`);
        } else {
          console.log(`Pushed ${metric}`);
        }
      })
      .catch((error) => {
        console.error('Error pushing metrics:', error);
      });
  }

  sendMetricNonReqToGrafana(metricPrefix, metricName, metricValue) {
    const metric = `${metricPrefix},source=${config.metrics.source} ${metricName}=${metricValue}`;
    fetch(`${config.metrics.url}`, {
      method: 'post',
      body: metric,
      headers: { Authorization: `Bearer ${config.metrics.userId}:${config.metrics.apiKey}` },
    })
      .then((response) => {
        if (!response.ok) {
            console.error(`Failed to push ${metricName} data to Grafana`);
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