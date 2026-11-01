# IAM role assumed by the RUBYS EC2 instance
resource "aws_iam_role" "rubys_ec2_ssm" {
  name = "${var.project_name}-${var.environment}-ec2-ssm-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "ec2.amazonaws.com"
        }

        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-ec2-ssm-role"
  }
}

# AWS-managed policy for Systems Manager access
resource "aws_iam_role_policy_attachment" "rubys_ssm" {
  role = aws_iam_role.rubys_ec2_ssm.name

  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Instance profile connecting the role to EC2
resource "aws_iam_instance_profile" "rubys_ec2" {
  name = "${var.project_name}-${var.environment}-ec2-instance-profile"
  role = aws_iam_role.rubys_ec2_ssm.name

  tags = {
    Name = "${var.project_name}-${var.environment}-ec2-instance-profile"
  }
}