#!/bin/sh
set -e

# Wait for DATABASE_URL host:port to be available (simple parsing)
if [ -n "$DATABASE_URL" ]; then
  # extract host and port roughly
  HOST=$(echo $DATABASE_URL | sed -E 's#.*@([^:/]+).*#\1#')
  PORT=$(echo $DATABASE_URL | sed -E 's#.*:([0-9]+)/.*#\1#')
  if [ -n "$HOST" ] && [ -n "$PORT" ]; then
    echo "Waiting for $HOST:$PORT..."
    until nc -z $HOST $PORT; do
      echo "Waiting for database..."
      sleep 1
    done
  fi
fi

exec "$@"
