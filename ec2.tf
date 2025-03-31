resource "aws_instance" "web" {
  ami           = "ami-084568db4383264d4" 
  instance_type = "t3.micro"

  tags = {
    Name = "Promotion-Website"
  }
}