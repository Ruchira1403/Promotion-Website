pipeline {
    agent any
    
    parameters {
        booleanParam(defaultValue: false, description: 'Create new infrastructure', name: 'CREATE_NEW_INFRASTRUCTURE')
    }
    
    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        TERRAFORM_DIR = 'terraform'
        ANSIBLE_DIR = 'ansible'
        AWS_REGION = 'us-east-1'
        WORKSPACE = 'C:\\ProgramData\\Jenkins\\.jenkins\\workspace\\Promotion-Website'
        NO_PROXY = '*.docker.io,registry-1.docker.io'
        TERRAFORM_PARALLELISM = '10'
        GIT_PATH = 'C:\\Program Files\\Git\\bin\\git.exe'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/udaraDev/Promotion-Website.git'
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                         usernameVariable: 'DOCKER_HUB_USERNAME', passwordVariable: 'DOCKER_HUB_PASSWORD')]) {
                        def gitCommitHash = bat(
                            script: "\"${env.GIT_PATH}\" rev-parse --short HEAD",
                            returnStdout: true
                        ).trim().readLines().last()
                        
                        // Configure Docker to bypass proxy for Docker Hub
                        bat '''
                            echo {"proxies":{"default":{"httpProxy":"","httpsProxy":"","noProxy":"*.docker.io,registry-1.docker.io"}}} > %USERPROFILE%\\.docker\\config.json
                        '''
                        
                        // Build backend image
                        bat """
                            docker build -t ${DOCKER_HUB_USERNAME}/dairy-backend:latest -t ${DOCKER_HUB_USERNAME}/dairy-backend:${gitCommitHash} ./backend
                        """
                        
                        // Build frontend image
                        bat """
                            docker build -t ${DOCKER_HUB_USERNAME}/dairy-frontend:latest -t ${DOCKER_HUB_USERNAME}/dairy-frontend:${gitCommitHash} ./frontend
                        """
                    }
                }
            }
        }
        
        stage('Push Docker Images') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                         usernameVariable: 'DOCKER_HUB_USERNAME', passwordVariable: 'DOCKER_HUB_PASSWORD')]) {
                        def gitCommitHash = bat(
                            script: "\"${env.GIT_PATH}\" rev-parse --short HEAD",
                            returnStdout: true
                        ).trim().readLines().last()
                        
                        // Login to Docker Hub
                        bat "echo %DOCKER_HUB_PASSWORD% | docker login -u %DOCKER_HUB_USERNAME% --password-stdin"
                        
                        // Push backend images
                        retry(3) {
                            bat """
                                docker push ${DOCKER_HUB_USERNAME}/dairy-backend:${gitCommitHash}
                                docker push ${DOCKER_HUB_USERNAME}/dairy-backend:latest
                            """
                        }
                        
                        // Push frontend images
                        retry(3) {
                            bat """
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
                    withCredentials([
                        string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                        string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
                    ]) {
                        // Use Windows terraform directly
                        bat "terraform init -input=false -upgrade"
                    }
                }
            }
        }
        
        stage('Get Infrastructure Info') {
            steps {
                dir(TERRAFORM_DIR) {
                    withCredentials([
                        string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                        string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
                    ]) {
                        script {
                            try {
                                env.EXISTING_EC2_IP = bat(
                                    script: 'terraform output -raw public_ip 2>nul || echo ""', 
                                    returnStdout: true
                                ).trim()
                                
                                // Remove any extra lines that might be in the output
                                if (env.EXISTING_EC2_IP.contains("\n")) {
                                    env.EXISTING_EC2_IP = env.EXISTING_EC2_IP.readLines().last()
                                }
                                
                                if (env.EXISTING_EC2_IP?.trim()) {
                                    echo "Found existing infrastructure with IP: ${env.EXISTING_EC2_IP}"
                                    // Set EC2_IP to existing value
                                    env.EC2_IP = env.EXISTING_EC2_IP
                                } else {
                                    echo "No existing infrastructure IP found"
                                }
                            } catch (Exception e) {
                                echo "Error getting existing infrastructure: ${e.message}"
                                env.EXISTING_EC2_IP = ""
                            }
                            
                            // Only run terraform plan if we want to create new infrastructure
                            if (params.CREATE_NEW_INFRASTRUCTURE) {
                                bat "terraform plan -var=\"region=${AWS_REGION}\" -out=tfplan"
                                echo "Infrastructure plan created and will apply if requested"
                            } else {
                                echo "Skipping infrastructure plan as CREATE_NEW_INFRASTRUCTURE is false"
                            }
                        }
                    }
                }
            }
        }
        
        stage('Terraform Apply') {
            when {
                expression { 
                    return params.CREATE_NEW_INFRASTRUCTURE && !env.EXISTING_EC2_IP?.trim()
                }
            }
            steps {
                dir(TERRAFORM_DIR) {
                    withCredentials([
                        string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                        string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
                    ]) {
                        script {
                            // Apply with tfplan file
                            bat "terraform apply -parallelism=${TERRAFORM_PARALLELISM} -input=false tfplan"
                            
                            // Get the EC2 IP
                            env.EC2_IP = bat(
                                script: 'terraform output -raw public_ip',
                                returnStdout: true
                            ).trim().readLines().last()
                            
                            // Add a wait for EC2 instance to initialize
                            echo "Waiting 120 seconds for EC2 instance to initialize..."
                            sleep(120)
                        }
                    }
                }
            }
        }
        
        stage('Ansible Deployment') {
            steps {
                dir(ANSIBLE_DIR) {
                    script {
                        // Verify EC2_IP is set
                        if (!env.EC2_IP?.trim()) {
                            error "EC2 IP address not set. Cannot proceed with deployment."
                        }
                        
                        echo "Starting deployment to EC2 instance at IP: ${env.EC2_IP}"
                        
                        // Create directories if they don't exist
                        bat '''
                            if not exist ansible mkdir ansible
                            wsl mkdir -p /home/myuser/.ssh
                            wsl mkdir -p /root/.ssh
                        '''
                        
                        // Copy PEM file to WSL locations if using credential
                        withCredentials([file(credentialsId: 'promotion-website-pem', variable: 'PEM_FILE')]) {
                            bat '''
                                copy %PEM_FILE% .\\Promotion-Website.pem
                                wsl cp /mnt/c/ProgramData/Jenkins/.jenkins/workspace/promotion-website-diary/ansible/Promotion-Website.pem /home/myuser/.ssh/
                                wsl cp /mnt/c/ProgramData/Jenkins/.jenkins/workspace/promotion-website-diary/ansible/Promotion-Website.pem /root/.ssh/
                            '''
                        }
                        
                        // Set proper permissions on the key files
                        bat '''
                            wsl chmod 600 /home/myuser/.ssh/Promotion-Website.pem
                            wsl chmod 600 /root/.ssh/Promotion-Website.pem
                        '''
                        
                        // Wait for SSH to be available
                        echo "Waiting for SSH to become available on ${env.EC2_IP}..."
                        def sshReady = false
                        def maxRetries = 10
                        
                        for (int i = 0; i < maxRetries && !sshReady; i++) {
                            def sshResult = bat(
                                script: "wsl ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 -i /home/myuser/.ssh/Promotion-Website.pem ubuntu@${env.EC2_IP} -C 'echo SSH_CONNECTION_SUCCESSFUL' || echo CONNECTION_FAILED",
                                returnStdout: true
                            ).trim()
                            
                            if (sshResult.contains("SSH_CONNECTION_SUCCESSFUL")) {
                                echo "SSH connection successful on attempt ${i+1}"
                                sshReady = true
                            } else {
                                echo "SSH connection attempt ${i+1}/${maxRetries} failed, waiting 30 seconds..."
                                sleep(30)
                            }
                        }

                        withCredentials([
                            usernamePassword(credentialsId: 'dockerhub-cred',
                                         usernameVariable: 'DOCKER_HUB_USERNAME',
                                         passwordVariable: 'DOCKER_HUB_PASSWORD')
                        ]) {
                            def gitCommitHash = bat(script: 'wsl git rev-parse --short HEAD', returnStdout: true).trim().readLines().last()
                            
                            // Create inventory file with improved settings
                            writeFile file: 'temp_inventory.ini', text: """[ec2]
${env.EC2_IP}

[ec2:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=/home/myuser/.ssh/Promotion-Website.pem
ansible_python_interpreter=/usr/bin/python3
ansible_ssh_common_args='-o StrictHostKeyChecking=no -o ConnectTimeout=180 -o ServerAliveInterval=30 -o ServerAliveCountMax=10'
ansible_ssh_retries=10
ansible_connection_timeout=300
ansible_timeout=300
"""
                            // Use a retry loop for the Ansible playbook
                            def maxAttempts = 3
                            def playbookSuccess = false
                            
                            for (int attempt = 1; attempt <= maxAttempts && !playbookSuccess; attempt++) {
                                echo "Ansible playbook execution attempt ${attempt}/${maxAttempts}"
                                
                                def result = bat(
                                    script: "wsl ANSIBLE_HOST_KEY_CHECKING=False ANSIBLE_TIMEOUT=180 ansible-playbook -i temp_inventory.ini deploy.yml -e \"DOCKER_HUB_USERNAME=tharuka2001 GIT_COMMIT_HASH=${gitCommitHash}\" -v",
                                    returnStatus: true
                                )
                                
                                if (result == 0) {
                                    echo "Ansible playbook executed successfully on attempt ${attempt}"
                                    playbookSuccess = true
                                } else {
                                    echo "Ansible playbook failed on attempt ${attempt} with exit code ${result}"
                                    if (attempt < maxAttempts) {
                                        echo "Waiting 60 seconds before retry..."
                                        sleep(60)
                                    }
                                }
                            }
                            
                            if (!playbookSuccess) {
                                error "Ansible deployment failed after ${maxAttempts} attempts"
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
                    cleanWhenSuccess: true,
                    cleanWhenFailure: true,
                    cleanWhenAborted: true,
                    patterns: [[pattern: '**/.git/**', type: 'EXCLUDE']]
                )
            }
        }
        success {
            echo 'Deployment completed successfully!'
            echo "Frontend URL: http://${env.EC2_IP}:5173"
            echo "Backend URL: http://${env.EC2_IP}:4000"
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}