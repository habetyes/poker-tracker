#!/bin/sh
set -e

# If BACKEND_HOST is not provided, set a fallback (could be blank or some default).
if [ -z "$BACKEND_HOST" ]; then
  echo "WARNING: BACKEND_HOST not set. Defaulting to 127.0.0.1:5000"
  export BACKEND_HOST="127.0.0.1:5000"
fi

# Use envsubst to replace $BACKEND_HOST in default.conf.template
envsubst '$BACKEND_HOST' < /etc/nginx/conf.d/default.conf.template \
  > /etc/nginx/conf.d/default.conf

# Finally, start nginx (in foreground)
exec nginx -g 'daemon off;'
