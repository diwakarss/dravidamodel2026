variable "project_name" {
  description = "Project name for resource naming"
  default     = "dravidamodel2026"
}

variable "domain_name" {
  description = "Domain name for the site"
  default     = "dravidamodel2026.top"
}

variable "aws_region" {
  description = "AWS region for resources"
  default     = "us-east-1"
}

variable "hcaptcha_secret" {
  description = "Secret key for hCaptcha verification"
  type        = string
  sensitive   = true
}

variable "feedback_email_source" {
  description = "Email address to send feedback from (must be verified in SES)"
  default     = "noreply@b2sell.com"
}

variable "feedback_email_destination" {
  description = "Email address to receive feedback"
  type        = string
}

variable "budget_limit" {
  description = "Monthly budget limit in USD"
  type        = number
  default     = 10
}

variable "budget_emails" {
  description = "List of email addresses to notify when budget is exceeded"
  type        = list(string)
  default     = ["nalan19ai@gmail.com"]
}
