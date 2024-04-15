variable "networkname" {
  description = "Azure networkname"
  type        = string
}

variable "accessKey" {}
variable "secretKey" {}
variable "region" {}
variable "instance_type" {}
variable "workspace_of" {
  type = map
  default = {
    dev    = {
      inst_type    = "t2.micro"
      os_image         = "dev-image"
      firewall_group   = "dev-firewall"
      additional_value = "dev-additional"
    }
    test   = {
      inst_type    = "t2.small"
      os_image         = "test-image"
      firewall_group   = "test-firewall"
      additional_value = "test-additional"
    }
    deploy = {
      inst_type    = "t2.large"
      os_image         = "deploy-image"
      firewall_group   = "deploy-firewall"
      additional_value = "deploy-additional"
    }
  }
}


locals {
  selected_instance_type = var.instance_type != "" ? var.instance_type : var.workspace_of[var.workspace_of["default"]].instance_type
}
