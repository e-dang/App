# SUBSCRIPTION_HASH is a short 4-char consistent hash of the longer subscription id.
# This is useful because azure storage account names are not allowed special characters and are limited to 24 chars.
terraform {
  backend "azurerm" {
    resource_group_name  = "<%= expansion('terraform-resources') %>"
    storage_account_name = "<%= expansion('ts:SUBSCRIPTION_HASH') %>"
    container_name       = "terraform-state"
    key                  = "<%= expansion(':LOCATION/:ENV/:BUILD_DIR/terraform.tfstate') %>"
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 2.68.0"
    }

    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.3.2"
    }

    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "~> 1.11.2"
    }

    flux = {
      source  = "fluxcd/flux"
      version = "~> 0.2.0"
    }

    sops = {
      source  = "carlpett/sops"
      version = "~> 0.6.3"
    }

    github = {
      source  = "integrations/github"
      version = "~> 4.12.1"
    }
  }

  required_version = "~> 1.0.0"
}
