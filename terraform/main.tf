variable "region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

provider "aws" {
  region = var.region
}

variable "environment" {
  description = "Deployment environment"
  default     = "dev"
}

# Use data source to find existing VPC
data "aws_vpc" "existing" {
  tags = {
    Environment = "dev"  # Adjust tags to match your existing VPC
  }
}

resource "aws_subnet" "main" {
  vpc_id                  = data.aws_vpc.existing.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true
  tags = {
    Name = "promotion-website-subnet"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = data.aws_vpc.existing.id
  tags = {
    Name = "promotion-website-igw"
  }
}

resource "aws_route_table" "main" {
  vpc_id = data.aws_vpc.existing.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = {
    Name = "promotion-website-rt"
  }
}

resource "aws_route_table_association" "main" {
  subnet_id      = aws_subnet.main.id
  route_table_id = aws_route_table.main.id
}

resource "aws_security_group" "promotion_website_sg" {
  name        = "promotion-website-security-group"
  description = "Security group for Promotion Website"
  vpc_id      = data.aws_vpc.existing.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access from anywhere"
  }

  ingress {
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Frontend access"
  }

  ingress {
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Backend API access"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "promotion-website-sg"
    Environment = var.environment
  }
}

resource "aws_instance" "promotion_website_ec2" {
  ami                    = "ami-084568db4383264d4"  # Ubuntu 22.04 in us-east-1
  instance_type          = "t3.micro"
  key_name               = "Promotion-Website"
  subnet_id              = aws_subnet.main.id
  vpc_security_group_ids = [aws_security_group.promotion_website_sg.id]
  user_data              = <<-EOF
    #!/bin/bash
    sudo apt-get update
    sudo apt-get install -y docker.io docker-compose
    sudo systemctl start docker
    sudo systemctl enable docker
  EOF

  tags = {
    Name = "Promotion-Website"
  }
}

output "public_ip" {
  value = aws_instance.promotion_website_ec2.public_ip
}

output "ssh_command" {
  value = "ssh -i ~/.ssh/Promotion-Website.pem ubuntu@${aws_instance.promotion_website_ec2.public_ip}"
}