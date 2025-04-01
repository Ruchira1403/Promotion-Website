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
                        if (!env.EC2_IP?.trim()) {
                            error "EC2 IP address not set. Cannot proceed with deployment."
                        }
                        
                        // Create a temporary directory for SSH key
                        bat 'if not exist temp mkdir temp'
                        
                        // Create inventory file with proper permissions
                        writeFile file: 'inventory.ini', text: """[ec2]
${env.EC2_IP} ansible_user=ubuntu ansible_connection=ssh

[ec2:vars]
ansible_python_interpreter=/usr/bin/python3
ansible_ssh_common_args='-o StrictHostKeyChecking=no -o ConnectTimeout=60'
"""
                        
                        withCredentials([file(credentialsId: 'promotion-website-pem', variable: 'SSH_KEY')]) {
                            // Copy SSH key to a temporary file - use PowerShell to copy with better error handling
                            bat '''
                                powershell -Command "Copy-Item -Path \\"$env:SSH_KEY\\" -Destination .\\temp\\Promotion-Website.pem -Force"
                            '''
                        }

                        withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                                usernameVariable: 'DOCKER_HUB_USERNAME',
                                passwordVariable: 'DOCKER_HUB_PASSWORD')]) {
                            def gitCommitHash = bat(
                                script: "\"${env.GIT_PATH}\" rev-parse --short HEAD",
                                returnStdout: true
                            ).trim().readLines().last()
                            
                            // Create the volume path properly with double backslashes
                            def ansiblePath = bat(script: 'cd && echo %CD%', returnStdout: true).trim().replaceAll('\\\\', '/').split('\n').last()
                            def tempPath = "${ansiblePath}/temp".replaceAll('\\\\', '/')
                            
                            // Use the Windows Subsystem for Linux (WSL) approach if available
                            try {
                                // Try WSL approach first
                                bat """
                                    wsl mkdir -p /tmp/ansible-keys
                                    wsl cp "${tempPath}/Promotion-Website.pem" /tmp/ansible-keys/
                                    wsl chmod 600 /tmp/ansible-keys/Promotion-Website.pem
                                    
                                    wsl ansible-playbook -i "${ansiblePath}/inventory.ini" "${ansiblePath}/deploy.yml" \\
                                    -e "docker_hub_username=${DOCKER_HUB_USERNAME}" \\
                                    -e "git_commit_hash=${gitCommitHash}" \\
                                    --private-key=/tmp/ansible-keys/Promotion-Website.pem -v
                                    
                                    wsl rm -rf /tmp/ansible-keys
                                """
                            } catch (Exception e) {
                                // Fallback to Docker-based approach with adjustments
                                echo "WSL approach failed, trying Docker-based approach: ${e.message}"
                                
                                // Run Ansible in Docker with host networking
                                bat """
                                    docker run --rm --network host \\
                                    -v "${ansiblePath}:/ansible" \\
                                    -v "${tempPath}:/keys:Z" \\
                                    -e ANSIBLE_HOST_KEY_CHECKING=False \\
                                    cytopia/ansible:latest-tools sh -c "chmod 600 /keys/Promotion-Website.pem && ansible-playbook -i /ansible/inventory.ini /ansible/deploy.yml \\
                                    -e \\"docker_hub_username=${DOCKER_HUB_USERNAME}\\" \\
                                    -e \\"git_commit_hash=${gitCommitHash}\\" \\
                                    --private-key=/keys/Promotion-Website.pem -v"
                                """
                            }
                            
                            // Clean up temporary files
                            bat 'rd /s /q temp'
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