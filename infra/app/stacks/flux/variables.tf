variable "github_owner" {
  description = "The owner of the Github repository."
  type        = string
}

variable "github_token_file" {
  description = "The file containing the personal access token for the owner of the Github repository."
  type        = string
  default     = "files/github-token.yaml" # tfsec:ignore:GEN001
}

variable "github_deploy_key_file" {
  description = "The file containing the deploy key to the Github repository that will be used by Flux."
  type        = string
  default     = "files/github-deploy-key.yaml"
}

variable "sops_key_file" {
  description = "The file containing the SOPS key to be used by Flux to decrypt secrets."
  type        = string
  default     = "files/sops-key.yaml"
}

variable "repository_name" {
  description = "The name of the Github repository."
  type        = string
}

variable "branch" {
  description = "The default branch in the Github repository."
  type        = string
  default     = "main"
}

variable "target_path" {
  description = "The target path for Flux to sync with in the Github repository."
  type        = string
  default     = "<%= expansion('flux/clusters/:ENV') %>"
}

variable "kube_context" {
  description = "The kubernetes context to use for deploy Flux."
  type        = string
}

variable "commit" {
  description = "Whether to commit the Flux files to Github or not."
  type        = bool
}
