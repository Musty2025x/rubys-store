resource "aws_eip" "rubys" {
  domain = "vpc"

  tags = {
    Name = "${var.project_name}-${var.environment}-eip"
  }
}

resource "aws_eip_association" "rubys" {
  instance_id   = aws_instance.rubys.id
  allocation_id = aws_eip.rubys.id
}
