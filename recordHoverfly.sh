#!/usr/bin/env bash
# General-purpose recording script, which starts Hoverfly in capture mode to record REST request/response data during the course of automation run

# Set proxy
PROXY_HOST_AND_PORT=www-proxy.us.oracle.com:80
PROXY_URL="http://$PROXY_HOST_AND_PORT"
NO_PROXY_HOSTS=localhost,127.0.0.1,100.96.188.222,100.96.188.203,.oraclecorp.com,.us.oracle.com,.oc9qadev.com,.oc-test.com
export http_proxy="$PROXY_URL" HTTP_PROXY="$PROXY_URL" https_proxy="$PROXY_URL" HTTPS_PROXY="$PROXY_URL" rsync_proxy="$PROXY_HOST_AND_PORT" RSYNC_PROXY="$PROXY_HOST_AND_PORT" no_proxy="$NO_PROXY_HOSTS" NO_PROXY="$NO_PROXY_HOSTS"

# Stop Hoverfly
hoverctl stop

# Start Hoverfly in capture mode
hoverctl start --cors --disable-tls --listen-on-host 0.0.0.0
hoverctl mode capture --stateful
hoverctl destination "(fscm|crm|hcm)RestApi"
echo -e "Hoverfly proxy server in capture mode is ready!\n(Type \"hoverctl --help\" to see the list of available commands.)\n"
