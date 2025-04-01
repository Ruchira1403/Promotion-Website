pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        TERRAFORM_DIR = 'terraform'
        ANSIBLE_DIR = 'ansible'
        AWS_REGION = 'us-east-1'
        WORKSPACE = 'C:\\ProgramData\\Jenkins\\.jenkins\\workspace\\Promotion-Website'
        NO_PROXY = '*.docker.io,registry-1.docker.io'
        TERRAFORM_PARALLELISM = '10'
        GIT_PATH = 'C:\\Program Files\\Git\\bin\\git.exe'
        WSL_SSH_KEY = '/home/myuser/.ssh/key.pem' // Adjust this path to your SSH key location in WSL
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/udaraDev/Promotion-Website.git'
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-cred', usernameVariable: 'DOCKER_HUB_USERNAME', passwordVariable: 'DOCKER_HUB_PASSWORD')]) {
                        def gitCommitHash = bat(script: "\"${env.GIT_PATH}\" rev-parse --short HEAD", returnStdout: true).trim().readLines().last()
                        bat """
                            docker build -t ${DOCKER_HUB_USERNAME}/dairy-backend:latest -t ${DOCKER_HUB_USERNAME}/dairy-backend:${gitCommitHash} ./backend
                            docker build -t ${DOCKER_HUB_USERNAME}/dairy-frontend:latest -t ${DOCKER_HUB_USERNAME}/dairy-frontend:${gitCommitHash} ./frontend
                        """
                    }
                }
            }
        }
        
        stage('Push Docker Images') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-cred', usernameVariable: 'DOCKER_HUB_USERNAME', passwordVariable: 'DOCKER_HUB_PASSWORD')]) {
                        def gitCommitHash = bat(script: "\"${env.GIT_PATH}\" rev-parse --short HEAD", returnStdout: true).trim().readLines().last()
                        bat "docker login -u %DOCKER_HUB_USERNAME% -p %DOCKER_HUB_PASSWORD%"
                        retry(3) {
                            bat """
                                docker push ${DOCKER_HUB_USERNAME}/dairy-backend:${gitCommitHash}
                                docker push ${DOCKER_HUB_USERNAME}/dairy-backend:latest
                                docker push ${DOCKER_HUB_USERNAME}/dairy-frontend:${gitCommitHash}
                                docker push ${DOCKER_HUB_USERNAME}/dairy-frontend:latest
                            """
                        }
                    }
                }
            }
        }
        
        stage('Terraform Initialize') {
            steps {
                dir(TERRAFORM_DIR) {
                    withCredentials([string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'), string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')]) {
                        bat "wsl terraform init -input=false -upgrade"
                    }
                }
            }
        }
        
        stage('Terraform Plan') {
            steps {
                dir(TERRAFORM_DIR) {
                    withCredentials([string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'), string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')]) {
                        script {
                            echo "Checking for existing Terraform state..."
                            def outputExists = bat(script: "wsl terraform output -json > nul 2>&1 && echo exists || echo notexists", returnStdout: true).trim().contains("exists")
                            echo "Terraform state exists: ${outputExists}"
                            
                            if (outputExists) {
                                try {
                                    env.EXISTING_EC2_IP = bat(script: "wsl terraform output -raw public_ip 2> nul || echo \"\"", returnStdout: true).trim().readLines().last()
                                    echo "Found existing infrastructure with IP: ${env.EXISTING_EC2_IP}"
                                } catch (Exception e) {
                                    env.EXISTING_EC2_IP = ""
                                    echo "No existing infrastructure detected or error retrieving IP: ${e.getMessage()}"
                                }
                            } else {
                                env.EXISTING_EC2_IP = ""
                                echo "No existing Terraform state detected"
                            }
                            
                            echo "Running Terraform plan..."
                            def planExitCode = bat(script: "wsl terraform plan -detailed-exitcode -var=\"region=${AWS_REGION}\" -out=tfplan", returnStatus: true)
                            
                            if (planExitCode == 2) {
                                env.TERRAFORM_CHANGES = 'true'
                                echo "Infrastructure changes detected - will apply changes"
                            } else if (planExitCode == 0) {
                                env.TERRAFORM_CHANGES = 'false'
                                echo "No infrastructure changes detected - will skip apply stage"
                            } else {
                                error "Terraform plan failed with exit code ${planExitCode}"
                            }
                        }
                    }
                }
            }
        }
        
        stage('Terraform Apply') {
            when { expression { return env.TERRAFORM_CHANGES == 'true' } }
            steps {
                dir(TERRAFORM_DIR) {
                    withCredentials([string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'), string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')]) {
                        script {
                            bat "wsl terraform apply -parallelism=${TERRAFORM_PARALLELISM} -input=false tfplan"
                            env.EC2_IP = bat(script: "wsl terraform output -raw public_ip", returnStdout: true).trim().readLines().last()
                            echo "Waiting 30 seconds for EC2 instance to initialize..."
                            sleep(30)
                        }
                    }
                }
            }
        }
        
        stage('Get Existing Infrastructure') {
            when { expression { return env.TERRAFORM_CHANGES == 'false' && env.EXISTING_EC2_IP?.trim() } }
            steps {
                script {
                    env.EC2_IP = env.EXISTING_EC2_IP
                    echo "Using existing infrastructure with IP: ${env.EC2_IP}"
                }
            }
        }
        
        stage('Ansible Deployment') {
            steps {
                dir(ANSIBLE_DIR) {
                    script {
                        if (!env.EC2_IP?.trim()) { error "EC2 IP not set. Cannot deploy." }
                        
                        bat """
                            wsl chmod 600 ${WSL_SSH_KEY}
                            wsl ls -la ${WSL_SSH_KEY}
                        """
                        
                        withCredentials([usernamePassword(credentialsId: 'dockerhub-cred', usernameVariable: 'DOCKER_HUB_USERNAME', passwordVariable: 'DOCKER_HUB_PASSWORD')]) {
                            def gitCommitHash = bat(script: "\"${env.GIT_PATH}\" rev-parse --short HEAD", returnStdout: true).trim().readLines().last()
                            
                            writeFile file: 'inventory.ini', text: """[ec2]
${env.EC2_IP} ansible_user=ubuntu ansible_ssh_private_key_file=${WSL_SSH_KEY}

[ec2:vars]
ansible_python_interpreter=/usr/bin/python3
ansible_ssh_common_args='-o StrictHostKeyChecking=no -o ConnectTimeout=60'
"""
                            def result = bat(script: "wsl ansible-playbook -i inventory.ini deploy.yml -u ubuntu --private-key ${WSL_SSH_KEY} -e \"docker_hub_username=${DOCKER_HUB_USERNAME} git_commit_hash=${gitCommitHash}\" -vvv", returnStatus: true)
                            
                            if (result != 0) {
                                error "Ansible deployment failed with exit code ${result}"
                            }
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                bat 'docker logout'
                cleanWs(
                    deleteDirs: true,
                    patterns: [
                        [pattern: '**/.git/**', type: 'EXCLUDE'],
                        [pattern: 'terraform/terraform.tfstate', type: 'EXCLUDE'],
                        [pattern: 'terraform/terraform.tfstate.backup', type: 'EXCLUDE']
                    ]
                )
            }
        }
        success {
            echo "Deployment completed successfully! Frontend: http://${env.EC2_IP}:5173, Backend: http://${env.EC2_IP}:4000"
        }
        failure {
            echo "Deployment failed!"
        }
    }
}