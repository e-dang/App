terraform {
  backend "s3" {
    bucket         = "terraform-state-cc155d919b2cd551"
    key            = "<%= expansion(':REGION/:ENV/:BUILD_DIR/terraform.tfstate') %>"
    region         = "<%= expansion(':REGION') %>"
    encrypt        = true
    dynamodb_table = "terraform_locks"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.49.0"
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
