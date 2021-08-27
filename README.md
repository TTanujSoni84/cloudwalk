# cloudwalk test task

## Prerequisites

* npm >=6.14.5
* node >=12.16.3

## Setup and Installation

### Setup

``` sh
        git clone https://github.com/TTanujSoni84/cloudwalk.git

        cd cloudwalk
```

### Build 

``` sh 
         npm run build
```

### Expose secrets 

``` sh 
        export EMAIL=${EMAIL_OF_SENDER}
        export PASSWORD=${EMAIL_PASSWORD_OF_SENDER}
        export auth_token=${AUTH_TOKEN_OF_API}         
```

> Set above config variables in Heroku's `config vars` after deploying 

### Run the app

``` sh 
        npm start

```

### APIs

1. Configure parameters of your Health checks:

```sh 
    curl -X POST \
    https://cloudwalk-test-task.herokuapp.com/configure \
    -H 'cache-control: no-cache' \
    -H 'content-type: application/json' \
    -d '{
        "email":  $EMAIL,
        "interval": $INTERVAL,
        "status": $STATUS,
        "timeout":$TIMEOUT,
        "healthy_threshold":$HEALTHY_THRESHOLD,
        "unhealthy_threshold":$UNHEALTHY_THRESHOLD
    }'

```

where, 

a. $EMAIL               = Email of the user to send health check alerts to.
b. $INTERVAL            = Interval in which to perform health checks
c. $TIMEOUT             = Timeout, number in seconds
d. $HEALTHY_THRESHOLD   = Healthy threshold limit
e. $UNHEALTHY_THRESHOLD = Unhealthy threshold limit


2. Check status of your API

```sh
    curl -X GET \
    https://cloudwalk-test-task.herokuapp.com/status \
    -H 'cache-control: no-cache' \
    -H 'content-type: application/json' 
```

3. Show RSS feeds 

```sh
    curl -X GET \
    https://cloudwalk-test-task.herokuapp.com/feeds/rss \
    -H 'cache-control: no-cache' \
    -H 'content-type: application/json' 
```