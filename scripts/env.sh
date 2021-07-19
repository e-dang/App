#!/bin/bash

# This script prints the tracker service's secrets to stdout in the format 'docker run' expects for environment
# variables to be placed in the container. This allows the docker container to run locally outside of the cluster.

ENV_VARS=""

# https://stackoverflow.com/questions/48512914/exporting-json-to-environment-variables
VALUES=$(sops -d flux/apps/dev/tracker/secret.yaml | yq -j e '.stringData' -)
for var in $(echo $VALUES | jq -r "to_entries|map(\"\(.key)=\(.value|tostring)\")|.[]"); do
    ENV_VARS+="-e ${var} "
done

printf "%s" "$ENV_VARS"
