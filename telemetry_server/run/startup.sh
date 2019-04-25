#!/bin/bash -e
USER="$(whoami)"
[ -e "/srv/apps/$USER/$USER.sock" ] && rm "/srv/apps/$USER/$USER.sock"
umask 0

. ~/.nvm/nvm.sh
NODE_ENV=production PORT="/srv/apps/$USER/$USER.sock" \
    exec npm start
    #exec ~/calstar/telemetry-server/telemetry_server/html/index.html
