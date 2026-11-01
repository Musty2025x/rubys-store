variable "aws_region" {
  description = "AWS region for RUBYS infrastructure"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "rubys"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.small"
}

variable "ami_id" {
  description = "Ubuntu 24.04 LTS AMI ID"
  type        = string
  default     = "ami-0d6dd9e8265d48906"
}

variable "vpc_id" {
  description = "Existing default VPC"
  type        = string
  default     = "vpc-0d502902b70281399"
}

variable "subnet_id" {
  description = "Existing public subnet"
  type        = string
  default     = "subnet-0c724790ea68de3b9"
}

variable "key_name" {
  description = "Existing EC2 SSH key pair"
  type        = string
  default     = "rubys-ec2-key"
}

variable "ssh_allowed_cidr" {
  description = "Public IP allowed to SSH into EC2"
  type        = string
}

variable "domain" {
  description = "RUBYS production domain"
  type        = string
  default     = "rubys.mustydevops.com.ng"
}