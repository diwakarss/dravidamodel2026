# IAM Role for Lambda
resource "aws_iam_role" "backend" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
  tags = local.common_tags
}

# IAM Policy for Lambda (SES + Logs)
resource "aws_iam_role_policy" "backend" {
  name = "${var.project_name}-lambda-policy"
  role = aws_iam_role.backend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*" # Restrict this if desired, e.g., to the verified identity ARN
        Condition = {
          StringEquals = {
            "ses:FromAddress" = var.feedback_email_source
          }
        }
      }
    ]
  })
}

# Zip the Lambda code (including node_modules)
data "archive_file" "backend" {
  type        = "zip"
  source_dir  = "${path.module}/../../lambda"
  output_path = "${path.module}/backend.zip"
  excludes    = ["package-lock.json", "local-test.js", ".gitignore", "README.md"]
}

# Lambda Function
resource "aws_lambda_function" "feedback" {
  filename         = data.archive_file.backend.output_path
  function_name    = "${var.project_name}-feedback"
  role             = aws_iam_role.backend.arn
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  source_code_hash = data.archive_file.backend.output_base64sha256
  timeout          = 10

  environment {
    variables = {
      HCAPTCHA_SECRET_KEY = var.hcaptcha_secret
      SES_FROM_EMAIL      = var.feedback_email_source
      FEEDBACK_TO_EMAIL   = var.feedback_email_destination
      ALLOWED_ORIGIN      = "https://${var.domain_name}"
    }
  }
  tags = local.common_tags
}

# HTTP API Gateway
resource "aws_apigatewayv2_api" "backend" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["https://${var.domain_name}", "http://localhost:3000"] # Add localhost for testing
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["content-type", "h-captcha-response"]
    max_age       = 300
  }
  tags = local.common_tags
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.backend.id
  name        = "$default"
  auto_deploy = true
  tags        = local.common_tags
}

resource "aws_apigatewayv2_integration" "lambba" {
  api_id           = aws_apigatewayv2_api.backend.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.feedback.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "feedback" {
  api_id    = aws_apigatewayv2_api.backend.id
  route_key = "POST /feedback"
  target    = "integrations/${aws_apigatewayv2_integration.lambba.id}"
}

# Permission for API Gateway to invoke Lambda
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.feedback.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.backend.execution_arn}/*/*"
}
