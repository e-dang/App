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
    name       = "default"
    node_count = 1
    vm_size    = "Standard_A2_v2"
  }

  service_principal {
    client_id     = data.sops_file.service_principal.data["client_id"]
    client_secret = data.sops_file.service_principal.data["client_password"]
  }

  role_based_access_control {
    enabled = true
  }
}

resource "azurerm_kubernetes_cluster_node_pool" "spot_nodes" {
  name                  = "spotnodepool"
  kubernetes_cluster_id = replace(azurerm_kubernetes_cluster.aks.id, "resourceGroups", "resourcegroups") # https://stackoverflow.com/questions/67825862/terraform-forces-aks-node-pool-replacement-without-any-changes
  priority              = "Spot"
  vm_size               = "Standard_A2_v2"
  enable_auto_scaling   = true
  node_count            = 1
  min_count             = 1
  max_count             = 3
  eviction_policy       = "Delete"
  spot_max_price        = -1
  os_disk_size_gb       = 32
}

resource "null_resource" "delete_default_node_pool" {
  depends_on = [
    azurerm_kubernetes_cluster_node_pool.spot_nodes
  ]

  triggers = {
    always_run = "${timestamp()}"
  }

  provisioner "local-exec" {
    command = "./files/local-exec.sh"

    interpreter = ["/bin/bash", "-c"]
    environment = {
      KUBECONFIG = base64encode(azurerm_kubernetes_cluster.aks.kube_config_raw)
    }
  }
}
