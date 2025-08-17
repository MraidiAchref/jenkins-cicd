output "instance_id"  { value = aws_instance.jenkins_host.id }
output "public_ip"    { value = aws_instance.jenkins_host.public_ip }
output "public_dns"   { value = aws_instance.jenkins_host.public_dns }
output "ssh_example"  {
  value = "ssh -i /path/to/${var.key_name}.pem ubuntu@${aws_instance.jenkins_host.public_ip}"
}