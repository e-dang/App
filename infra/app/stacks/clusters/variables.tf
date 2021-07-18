variable "resource_group" {
  description = "The name of the resource group to place the cluster in."
  default     = "tracker-stack"
}

variable "location" {
  description = "The location to deploy the AKS cluster."
  default     = "westus"
}

variable "service_principal_file" {
  description = "The path to the file that contains the service principal credentials."
  default     = "./files/service-principal.yaml"
}

variable "kubernetes_version" {
  description = "The version of kubernetes to deploy on the cluster."
  default     = "1.20.5"
}
