resource "aws_secretsmanager_secret" "rubys" {
  name                    = "${var.project_name}/${var.environment}/application"
  description             = "RUBYS application and database runtime secrets"
  recovery_window_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-application-secrets"
  }
}
