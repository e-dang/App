locals {
  resource_group = "<%= expansion('${var.resource_group}-:ENV') %>"
  cluster_name   = "<%= expansion('${var.cluster_name}-:ENV') %>"
}

resource "azurerm_resource_group" "stack" {
  name     = local.resource_group
  location = var.location
}

data "sops_file" "service_principal" {
  source_file = var.service_principal_file
}

resource "azurerm_kubernetes_cluster" "aks" { # tfsec:ignore:AZU008 tfsec:ignore:AZU009
  name                = local.cluster_name
  location            = azurerm_resource_group.stack.location
  resource_group_name = azurerm_resource_group.stack.name
  dns_prefix          = local.cluster_name
  kubernetes_version  = var.kubernetes_version

  default_node_pool {
    name            = "default"
    node_count      = 2
    vm_size         = "Standard_D2_v2"
    os_disk_size_gb = 30
  }

  service_principal {
    client_id     = data.sops_file.service_principal.data["client_id"]
    client_secret = data.sops_file.service_principal.data["client_password"]
  }

  role_based_access_control {
    enabled = true
  }
}
