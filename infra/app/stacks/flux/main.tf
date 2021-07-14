data "sops_file" "github_token" {
  source_file = var.github_token_file
}

data "sops_file" "github_deploy_key" {
  source_file = var.github_deploy_key_file
}

data "sops_file" "sops_key" {
  source_file = var.sops_key_file
}

provider "kubernetes" {
  config_path    = "~/.kube/config"
  config_context = var.kube_context
}


provider "kubectl" {
  config_path    = "~/.kube/config"
  config_context = var.kube_context
}


provider "github" {
  owner = var.github_owner
  token = data.sops_file.github_token.data["token"]
}

data "flux_install" "main" {
  target_path      = var.target_path
  network_policy   = false
  components_extra = ["image-reflector-controller", "image-automation-controller"]
}

data "flux_sync" "main" {
  target_path = var.target_path
  url         = "ssh://git@github.com/${var.github_owner}/${var.repository_name}.git"
  branch      = var.branch
}

resource "kubernetes_namespace" "flux_system" {
  metadata {
    name = "flux-system"
  }

  lifecycle {
    ignore_changes = [
      metadata[0].labels,
    ]
  }
}

data "kubectl_file_documents" "install" {
  content = data.flux_install.main.content
}

data "kubectl_file_documents" "sync" {
  content = data.flux_sync.main.content
}

locals {
  install = [for v in data.kubectl_file_documents.install.documents : {
    data : yamldecode(v)
    content : v
    }
  ]
  sync = [for v in data.kubectl_file_documents.sync.documents : {
    data : yamldecode(v)
    content : v
    }
  ]
}

resource "kubectl_manifest" "install" {
  for_each   = { for v in local.install : lower(join("/", compact([v.data.apiVersion, v.data.kind, lookup(v.data.metadata, "namespace", ""), v.data.metadata.name]))) => v.content }
  depends_on = [kubernetes_namespace.flux_system]
  yaml_body  = each.value
}

resource "kubectl_manifest" "sync" {
  for_each   = { for v in local.sync : lower(join("/", compact([v.data.apiVersion, v.data.kind, lookup(v.data.metadata, "namespace", ""), v.data.metadata.name]))) => v.content }
  depends_on = [kubernetes_namespace.flux_system]
  yaml_body  = each.value
}

resource "kubernetes_secret" "github" {
  depends_on = [kubectl_manifest.install]

  metadata {
    name      = data.flux_sync.main.secret
    namespace = data.flux_sync.main.namespace
  }

  data = {
    identity       = data.sops_file.github_deploy_key.data["identity"]
    "identity.pub" = data.sops_file.github_deploy_key.data["identity.pub"]
    known_hosts    = data.sops_file.github_deploy_key.data["known_hosts"]
  }
}

resource "kubernetes_secret" "sops" {
  depends_on = [kubectl_manifest.install]

  metadata {
    name      = "sops-gpg"
    namespace = data.flux_sync.main.namespace
  }

  data = {
    "sops.asc" = data.sops_file.sops_key.data["key"]
  }
}

resource "kubectl_manifest" "image_update_automation" {
  depends_on = [
    kubectl_manifest.install
  ]

  yaml_body = yamlencode({
    apiVersion = "image.toolkit.fluxcd.io/v1beta1"
    kind       = "ImageUpdateAutomation"
    metadata = {
      name      = "flux-system"
      namespace = "flux-system"
    }
    spec = {
      interval = "1m0s"

      sourceRef = {
        kind = "GitRepository"
        name = "flux-system"
      }

      git = {
        checkout = {
          ref = {
            branch = "main"
          }
        }

        commit = {
          author = {
            email = "fluxcdbot@dne.com"
            name  = "fluxcdbot"
          }
          messageTemplate = "{{range .Updated.Images}}{{println .}}{{end}}"
        }

        push = {
          branch = "main"
        }
      }

      update = {
        path     = "flux/apps/dev"
        strategy = "Setters"
      }
    }
  })
}


locals {
  combined_sync = <<EOF
${data.flux_sync.main.content}
---
${kubectl_manifest.image_update_automation.yaml_body_parsed}
EOF
}


resource "github_repository_file" "install" {
  repository          = var.repository_name
  file                = data.flux_install.main.path
  content             = data.flux_install.main.content
  branch              = var.branch
  overwrite_on_create = true
}

resource "github_repository_file" "sync" {
  repository          = var.repository_name
  file                = data.flux_sync.main.path
  content             = local.combined_sync
  branch              = var.branch
  overwrite_on_create = true
}

resource "github_repository_file" "kustomize" {
  repository          = var.repository_name
  file                = data.flux_sync.main.kustomize_path
  content             = data.flux_sync.main.kustomize_content
  branch              = var.branch
  overwrite_on_create = true
}
