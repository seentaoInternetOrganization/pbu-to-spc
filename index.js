/**
 * @author Chenzhyc
 * @description 注册到spring cloud
 */

const Eureka = require('eureka-js-client').Eureka;
const url = require('url');

function getIPAddr() {
    const os = require('os');
    const ifaces = os.networkInterfaces();

    let ipAddr = '';

    Object.keys(ifaces).forEach(function (ifname) {
        let alias = 0;

        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                // console.log(ifname + ':' + alias, iface.address);
                ipAddr = iface.address;
            } else {
                // this interface has only one ipv4 adress
                // console.log(ifname, iface.address);
                ipAddr = iface.address;
            }
            ++alias;
        });
    });

    return ipAddr;
}

module.exports.registToSpringCloud = function(config, app, appName) {
    const ipAddr = getIPAddr();

    const eurekaHost = url.parse(config.businessApiUrl).hostname;

    const client = new Eureka({
        instance: {
            app: appName,
            instanceId: ipAddr + ':' + app.get('port'),
            preferIpAddress: true,
            hostName: 'localhost',
            ipAddr: ipAddr,
            port: {
                '$': app.get('port'),
                '@enabled': 'true',
            },
            vipAddress: ipAddr,
            dataCenterInfo: {
                '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
                name: 'MyOwn',
            },
        },
        eureka: {
            // eureka server host / port
            host: eurekaHost,
            port: 8088,
            servicePath: '/eureka/apps/',
        },
    });

    client.start(function(error) {
        // console.log(error || 'complete');
    });
};
