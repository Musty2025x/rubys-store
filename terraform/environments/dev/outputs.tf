output "instance_id" {
  description = "RUBYS EC2 instance ID"
  value       = aws_instance.rubys.id
}

output "security_group_id" {
  description = "RUBYS EC2 security group ID"
  value       = aws_security_group.rubys.id
}

output "instance_public_ip" {
  description = "Permanent RUBYS EC2 public IP"
  value       = aws_eip.rubys.public_ip
}

output "instance_public_dns" {
  description = "Permanent RUBYS EC2 public DNS"
  value       = aws_eip.rubys.public_dns
}

output "application_url" {
  description = "RUBYS application URL"
  value       = "http://${aws_eip.rubys.public_ip}"
}

output "application_secret_arn" {
  description = "RUBYS application secret ARN"
  value       = aws_secretsmanager_secret.rubys.arn
}