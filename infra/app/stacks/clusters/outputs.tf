output "resource_group" {
  description = "The name of the resource group"
  value       = local.resource_group
}

output "cluster_name" {
  description = "The name of the cluster"
  value       = local.cluster_name
}

output "cluster_endpoint" {
  description = "The Kubernetes cluster server host."
  value       = azurerm_kubernetes_cluster.aks.kube_config.0.host
  sensitive   = true
}

output "client_certificate" {
  description = "Base64 encoded public certificate used by clients to authenticate to the Kubernetes cluster."
  value       = azurerm_kubernetes_cluster.aks.kube_config.0.client_certificate
  sensitive   = true
}

output "client_key" {
  description = "Base64 encoded private key used by clients to authenticate to the Kubernetes cluster."
  value       = azurerm_kubernetes_cluster.aks.kube_config.0.client_key
  sensitive   = true
}

output "cluster_ca_certificate" {
  description = "Base64 encoded public CA certificate used as the root of trust for the Kubernetes cluster."
  value       = azurerm_kubernetes_cluster.aks.kube_config.0.cluster_ca_certificate
  sensitive   = true
}
