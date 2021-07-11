#!/bin/bash

# This script exports the tracker service's secrets to environment variables so that commands can be run locally. For
# example, in order to run unit tests, the dev environment variables need to be set, thus this script can be sources
# and the unit tests subsquently run.

# https://stackoverflow.com/questions/48512914/exporting-json-to-environment-variables
VALUES=$(sops -d flux/apps/dev/tracker/secret.yaml | yq -j e '.stringData' -)
for var in $(echo $VALUES | jq -r "to_entries|map(\"\(.key)=\(.value|tostring)\")|.[]" ); do
    export $var
done
