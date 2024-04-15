terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}


provider "aws" {
      region = var.region
      access_key = var.accessKey
      secret_key = var.secretKey
}



# Define your security group allowing all traffic
resource "aws_security_group" "allow_all" {
  name        = "firewall-allow-all"
  description = "Allow all inbound and outbound traffic"

  # Allow all inbound traffic
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}


resource "tls_private_key" "TF_pemKey" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "local_file" "TF_pemKey" {
  filename = "${path.module}/TF_pemKey.pem"
  content  = tls_private_key.TF_pemKey.private_key_pem
}
data "local_file" "TF_pubKey" {
  depends_on = [local_file.TF_pemKey]
  filename   = local_file.TF_pemKey.filename
}

resource "aws_key_pair" "TF_keypair" {
  key_name   = "TF_pemKey"  # Specify the name for the AWS key pair
  public_key = data.local_file.TF_pubKey.content
}




resource "aws_instance" "os1"{
     ami = "ami-09ccb67fcbf1d625c"

#     instance_type = "t2.micro"

#     instance_type = lookup(var.processore_type , terraform.workspace)

     instance_type = var.workspace_of[terraform.workspace].inst_type

     security_groups = [aws_security_group.allow_all.name]

     key_name= aws_key_pair.TF_keypair.key_name


     connection{
        type="ssh"
        user = "ec2-user"
        private_key=local_file.TF_pemKey.filename
        host=aws_instance.os1.public_ip
     }

    provisioner "remote-exec" {
      inline=[
        "sudo yum update -y ",
        "sudo yum install httpd -y ",
        "sudo touch  /var/www/html/harinadh.html",
        "sudo echo 'Hello, World!' >> /var/www/html/harinadh.html",
        "sudo systemctl start httpd"
        ]
     }

}

output "instance_type"{
       value = aws_instance.os1.instance_type
}

output "publicIP"{
value = aws_instance.os1.public_ip
}


resource "local_file" "os_details" {
  filename = "${path.module}/os_details.txt"
  content  = aws_instance.os1.public_ip
}
