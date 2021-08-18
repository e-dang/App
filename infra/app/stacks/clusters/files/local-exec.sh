#!/bin/bash

DEFAULT_NODE=$(kubectl get nodes -o=name --kubeconfig <(echo $KUBECONFIG | base64 --decode) | grep default)
if [[ -n $DEFAULT_NODE ]]; then
    kubectl delete $DEFAULT_NODE --kubeconfig <(echo $KUBECONFIG | base64 --decode)
fi

kubectl taint nodes --all kubernetes.azure.com/scalesetpriority- --kubeconfig <(echo $KUBECONFIG | base64 --decode)
