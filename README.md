# momo - mongodb monitor

simple , fast mongodb data viewer and analyzer , create your dashboard in minutes.

momo is a web applicaiton, you can install it in your server or computer.

momo has a basicauth you can config in conf.json, and it just a data viewer. feel free to use in your server.

## Installation

`git clone https://github.com/tans/momo.git`

`npm install`

`npm start`

visit with your bowser at `http://localhost:3308`

## Configuration

```
#config.json
{
    "basicauth": {
        "name": "",
        "password": ""
    },
    "port": 3308,  //listen port
    "mongourl": "localhost", //  mongo url
    "limit": 100
}

```


