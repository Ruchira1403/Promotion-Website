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
        
        stage('Terraform Plan') {
            steps {
                dir(TERRAFORM_DIR) {
                    withCredentials([
                        string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                        string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
                    ]) {
                        script {
                            // Check if output file exists using Windows commands
                            def outputExists = bat(
                                script: 'terraform output -json >nul 2>&1 && echo exists || echo notexists', 
                                returnStdout: true
                            ).trim().contains("exists")
                            
                            if (outputExists) {
                                try {
                                    env.EXISTING_EC2_IP = bat(
                                        script: 'terraform output -raw public_ip 2>nul || echo ""', 
                                        returnStdout: true
                                    ).trim().readLines().last()
                                    echo "Found existing infrastructure with IP: ${env.EXISTING_EC2_IP}"
                                } catch (Exception e) {
                                    env.EXISTING_EC2_IP = ""
                                    echo "No existing infrastructure detected"
                                }
                            }
                            
                            // Run terraform plan to detect changes
                            def planExitCode = bat(
                                script: "terraform plan -detailed-exitcode -var=\"region=${AWS_REGION}\" -out=tfplan", 
                                returnStatus: true
                            )
                            env.TERRAFORM_CHANGES = planExitCode == 2 ? 'true' : 'false'
                            
                            if (env.TERRAFORM_CHANGES == 'true') {
                                echo "Infrastructure changes detected - will apply changes"
                            } else {
                                echo "No infrastructure changes detected - will skip apply stage"
                            }
                        }
                    }
                }
            }
        }
        
        stage('Terraform Apply') {
            when {
                expression { return env.TERRAFORM_CHANGES == 'true' }
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
                            
                            // Add a small wait for EC2 instance to initialize
                            echo "Waiting 30 seconds for EC2 instance to initialize..."
                            sleep(30)
                        }
                    }
                }
            }
        }
        
        stage('Get Existing Infrastructure') {
            when {
                expression { return env.TERRAFORM_CHANGES == 'false' && env.EXISTING_EC2_IP?.trim() }
            }
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
                        // Verify EC2_IP is set
                        if (!env.EC2_IP?.trim()) {
                            error "EC2 IP address not set. Cannot proceed with deployment."
                        }
                        
                        echo "Waiting for EC2 instance at ${env.EC2_IP} to fully initialize..."
                        // Increase wait time for EC2 to properly initialize
                        sleep(120)
                        
                        // Create directories if they don't exist
                        bat '''
                            if not exist ansible mkdir ansible
                            wsl mkdir -p /home/myuser/.ssh
                        '''
                        
                        // Copy key file to both locations to ensure it's available
                        withCredentials([file(credentialsId: 'promotion-website-pem', variable: 'PEM_FILE')]) {
                            bat '''
                                copy %PEM_FILE% Promotion-Website.pem
                                wsl cp /mnt/c/ProgramData/Jenkins/.jenkins/workspace/promotion-website-diary/ansible/Promotion-Website.pem /home/myuser/.ssh/
                                wsl mkdir -p /root/.ssh
                                wsl cp /home/myuser/.ssh/Promotion-Website.pem /root/.ssh/
                            '''
                        }
                        
                        // Set proper permissions on key in both locations
                        bat '''
                            wsl chmod 600 /home/myuser/.ssh/Promotion-Website.pem
                            wsl chmod 600 /root/.ssh/Promotion-Website.pem
                            wsl ls -la /home/myuser/.ssh/Promotion-Website.pem
                            wsl ls -la /root/.ssh/Promotion-Website.pem
                        '''

                        // Test SSH connection before proceeding
                        echo "Testing SSH connection to ${env.EC2_IP}..."
                        def sshTestResult = bat(
                            script: "wsl ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 -i /home/myuser/.ssh/Promotion-Website.pem ubuntu@${env.EC2_IP} -C 'echo SSH_CONNECTION_SUCCESSFUL'",
                            returnStatus: true
                        )
                        
                        if (sshTestResult != 0) {
                            echo "SSH connection test failed. Waiting an additional 60 seconds..."
                            sleep(60)
                        }

                        withCredentials([
                            usernamePassword(credentialsId: 'dockerhub-cred',
                                         usernameVariable: 'DOCKER_HUB_USERNAME',
                                         passwordVariable: 'DOCKER_HUB_PASSWORD')
                        ]) {
                            def gitCommitHash = bat(script: 'wsl git rev-parse --short HEAD', returnStdout: true).trim().readLines().last()
                            
                            // Create inventory file with improved connection parameters
                            writeFile file: 'temp_inventory.ini', text: """[ec2]
${env.EC2_IP}

[ec2:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=/root/.ssh/Promotion-Website.pem
ansible_python_interpreter=/usr/bin/python3
ansible_ssh_common_args='-o StrictHostKeyChecking=no -o ConnectTimeout=180 -o ServerAliveInterval=30'
ansible_ssh_timeout=300
ansible_connection=ssh
ansible_ssh_retries=10
"""
                            // Run Ansible playbook with retry mechanism
                            def maxRetries = 3
                            def success = false
                            
                            for (int i = 0; i < maxRetries && !success; i++) {
                                echo "Ansible deployment attempt ${i+1} of ${maxRetries}"
                                
                                def result = bat(
                                    script: "wsl ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i temp_inventory.ini deploy.yml -v",
                                    returnStatus: true
                                )
                                
                                if (result == 0) {
                                    success = true
                                    echo "Ansible deployment succeeded on attempt ${i+1}"
                                } else {
                                    echo "Ansible deployment failed on attempt ${i+1} with exit code ${result}"
                                    if (i < maxRetries - 1) {
                                        echo "Waiting 60 seconds before next retry..."
                                        sleep(60)
                                    }
                                }
                            }
                            
                            if (!success) {
                                error "Ansible deployment failed after ${maxRetries} attempts"
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