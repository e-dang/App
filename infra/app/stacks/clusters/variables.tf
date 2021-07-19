variable "resource_group" {
  description = "The name of the resource group to place the cluster in."
  type        = string
}

variable "cluster_name" {
  description = "The name of the AKS cluster."
  type        = string
}

variable "location" {
  description = "The location to deploy the AKS cluster."
  type        = string
  default     = "<%= expansion(':LOCATION') %>"
}

variable "service_principal_file" {
  description = "The path to the file that contains the service principal credentials."
  type        = string
}

variable "kubernetes_version" {
  description = "The version of kubernetes to deploy on the cluster."
  type        = string
}
