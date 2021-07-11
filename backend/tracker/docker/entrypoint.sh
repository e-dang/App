#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

if [[ $1 = "run" ]]; then
    python manage.py migrate
    uvicorn config.asgi:application --host 0.0.0.0 --port 5000 --reload
fi
