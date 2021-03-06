#!/bin/bash

CLUSTER_NAME=${1:-"dev"}
RESOURCE_GROUP=${2:-"dev-stack"}
kubectl config unset users.clusterAdmin_${RESOURCE_GROUP}_${CLUSTER_NAME}
kubectl config unset clusters.${CLUSTER_NAME}
kubectl config unset contexts.${CLUSTER_NAME}-admin
az aks get-credentials -n ${CLUSTER_NAME} --resource-group ${RESOURCE_GROUP} --admin
