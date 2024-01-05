
# Azure Provider source and version being used
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.85"
    }
  }
}



# Configure the Microsoft Azure Provider
provider "azurerm" {
  features {}


subscription_id = "3e174af4-b1d5-41d7-8775-e351fc0fec65"
  client_id       = "9e61e14b-a4c1-4e6a-9e0e-8c95a4e408dd"
  client_secret   = "fX68Q~-hzRwRpQ0lRnc65woyvC2NBoRGboTzFaWY"
  tenant_id       = "8292aee4-c449-4f25-b860-7d4e0bbe134b"

}


resource "azurerm_resource_group" "TFResgrp2" {
  name     = "TFresGr2"
  location = "East US"  # Change this to your desired Azure region
}

resource "azurerm_virtual_network" "TFnetwork2" {
  name                = "TFnetwork2"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.TFResgrp2.location
  resource_group_name = azurerm_resource_group.TFResgrp2.name
}

resource "azurerm_subnet" "TFsubnet2" {
  name                 = "TFsubnet2"
  resource_group_name  = azurerm_resource_group.TFResgrp2.name
  virtual_network_name = azurerm_virtual_network.TFnetwork2.name
  address_prefixes    = ["10.0.1.0/24"]
}



# Create public IP addresses
resource "azurerm_public_ip" "TFpublicIP2" {
  count             = var.instances_count
  name              = "TFpublicIP2-${count.index}"
  resource_group_name = azurerm_resource_group.TFResgrp2.name
  location          = azurerm_resource_group.TFResgrp2.location
  allocation_method = "Dynamic"
}

# Create network interfaces with associated public IPs
resource "azurerm_network_interface" "TFnetIF2" {
  count               = var.instances_count
  name                = "TFnetIF-${count.index}"
  location            = azurerm_resource_group.TFResgrp2.location
  resource_group_name = azurerm_resource_group.TFResgrp2.name

  ip_configuration {
    name                          = "TFipconfig2"
    subnet_id                     = azurerm_subnet.TFsubnet2.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.TFpublicIP2[count.index].id
  }
}

# Create virtual machines
resource "azurerm_linux_virtual_machine" "TFVM2" {
  count = var.instances_count

  name                = "2TFVM-${count.index}"
  location            = azurerm_resource_group.TFResgrp2.location
  resource_group_name = azurerm_resource_group.TFResgrp2.name

  size                         = "Standard_DS1_v2"
  disable_password_authentication = false
  admin_username               = "harinadh"
  admin_password               = "P@ssw0rd1234"

  network_interface_ids = [azurerm_network_interface.TFnetIF2[count.index].id]

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }

  connection {

	 type        = "ssh"
	 user        = "harinadh"
      password    = "P@ssw0rd1234"
	host	  = azurerm_linux_virtual_machine.TFVM2[0].public_ip_address
 	#host="192.168.126.128"


  }

  provisioner "remote-exec"{
	inline=[
		"sudo apt update -y ",
		"sudo apt install apache2 -y ",
		"sudo touch /var/www/html/harinadh.txt",
		"sudo systemctl start apache2",
		"sudo systemctl enable apache2",
		"sudo touch file1harinadh.txt",
	]
	
  }

}


output "publicipis"{
	value = azurerm_linux_virtual_machine.TFVM2[0].public_ip_address

}
