variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-1" 
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "Existing EC2 key pair name"
  type        = string
}

variable "ssh_cidr" {
  description = "CIDR allowed to SSH"
  type        = string
  default     = "0.0.0.0/0"
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default = {
    Project = "cicd-jenkins"
    Env     = "dev"
  }
}
