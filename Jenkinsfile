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
        WSL_SSH_KEY = '/home/myuser/.ssh/Promotion-Website.pem'
        CREATE_NEW_INFRASTRUCTURE = 'false' // Set this to 'true' to create new infrastructure
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/udaraDev/Promotion-Website.git'
            }
        }
        
        stage('Build Docker Images with Docker Compose') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                         usernameVariable: 'DOCKER_HUB_USERNAME', passwordVariable: 'DOCKER_HUB_PASSWORD')]) {
                        def gitCommitHash = bat(
                            script: "\"${env.GIT_PATH}\" rev-parse --short HEAD",
                            returnStdout: true
                        ).trim().readLines().last()
                        
                        // Create a .env file for Docker Compose
                        writeFile file: '.env', text: """
                            DOCKER_HUB_USERNAME=${DOCKER_HUB_USERNAME}
                            GIT_COMMIT_HASH=${gitCommitHash}
                        """
                        
                        // Configure Docker to bypass proxy for Docker Hub
                        bat '''
                            echo {"proxies":{"default":{"httpProxy":"","httpsProxy":"","noProxy":"*.docker.io,registry-1.docker.io"}}} > %USERPROFILE%\\.docker\\config.json
                        '''
                        
                        // Build images using docker-compose
                        bat "docker-compose -f ${DOCKER_COMPOSE_FILE} build"
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
                        
                        // Push backend images with retry mechanism
                        retry(3) {
                            bat """
                                docker push ${DOCKER_HUB_USERNAME}/dairy-backend:${gitCommitHash}
                                docker push ${DOCKER_HUB_USERNAME}/dairy-backend:latest
                            """
                        }
                        
                        // Push frontend images with retry mechanism
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
                    withCredentials([string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')]) {
                        // Use -upgrade to ensure latest providers
                        bat "terraform init -input=false -upgrade"
                    }
                }
            }
        }
        
        stage('Terraform Plan & Check Changes') {
            steps {
                dir(TERRAFORM_DIR) {
                    withCredentials([string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')]) {
                        script {
                            // Check if output file exists to detect existing infrastructure
                            def outputExists = bat(script: 'terraform output -json > nul 2>&1 && echo exists || echo notexists', returnStdout: true).trim().contains("exists")
                            
                            if (outputExists) {
                                try {
                                    // Write output to file to avoid color codes
                                    bat 'set NO_COLOR=true && terraform output -no-color -raw public_ip > ec2_ip.txt 2>nul || echo "" > ec2_ip.txt'
                                    env.EXISTING_EC2_IP = readFile('ec2_ip.txt').trim()
                                    
                                    if (env.EXISTING_EC2_IP?.trim() && env.EXISTING_EC2_IP =~ /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/) {
                                        echo "Found existing infrastructure with IP: ${env.EXISTING_EC2_IP}"
                                    } else {
                                        echo "No existing infrastructure IP found"
                                        env.EXISTING_EC2_IP = ""
                                    }
                                } catch (Exception e) {
                                    echo "Error getting existing infrastructure: ${e.message}"
                                    env.EXISTING_EC2_IP = ""
                                }
                            }
                            
                            // Run terraform plan with detailed exit code to automatically detect changes
                            if (env.CREATE_NEW_INFRASTRUCTURE == 'true') {
                                def planExitCode = bat(script: "terraform plan -detailed-exitcode -var=\"region=${AWS_REGION}\" -out=tfplan", returnStatus: true)
                                // Exit code 0 = No changes, 1 = Error, 2 = Changes present
                                env.TERRAFORM_CHANGES = planExitCode == 2 || !env.EXISTING_EC2_IP?.trim() ? 'true' : 'false'
                                
                                if (env.TERRAFORM_CHANGES == 'true') {
                                    echo "Infrastructure changes detected or new infrastructure needed - will apply changes"
                                } else {
                                    echo "No infrastructure changes detected - will skip apply stage"
                                }
                            } else {
                                echo "Skipping infrastructure changes as CREATE_NEW_INFRASTRUCTURE is false"
                                env.TERRAFORM_CHANGES = 'false'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Terraform Apply') {
            when {
                expression { 
                    return env.CREATE_NEW_INFRASTRUCTURE == 'true' && env.TERRAFORM_CHANGES == 'true'
                }
            }
            steps {
                dir(TERRAFORM_DIR) {
                    withCredentials([string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')]) {
                        script {
                            // Apply with parallelism for faster resource creation
                            bat "terraform apply -parallelism=${TERRAFORM_PARALLELISM} -input=false tfplan"
                            
                            // Get the EC2 IP - write to file to avoid color codes
                            bat 'set NO_COLOR=true && terraform output -no-color -raw public_ip > ec2_ip.txt'
                            env.EC2_IP = readFile('ec2_ip.txt').trim()
                            
                            // Add a wait for EC2 instance to initialize
                            echo "Waiting 120 seconds for EC2 instance to initialize..."
                            sleep(120)
                        }
                    }
                }
            }
        }
        
        stage('Get Existing Infrastructure') {
            when {
                expression { 
                    return env.TERRAFORM_CHANGES == 'false' && env.EXISTING_EC2_IP?.trim()
                }
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
                        
                        // Make sure the IP is clean
                        def cleanIp = env.EC2_IP.trim()
                        echo "Starting deployment to EC2 instance at IP: ${cleanIp}"
                        
                        // Create directories if they don't exist
                        bat '''
                            if not exist ansible mkdir ansible
                            wsl mkdir -p /home/myuser/.ssh
                        '''
                        
                        // Copy PEM file to WSL locations
                        withCredentials([file(credentialsId: 'promotion-website-pem', variable: 'PEM_FILE')]) {
                            bat '''
                                copy %PEM_FILE% .\\Promotion-Website.pem
                                wsl cp /mnt/c/ProgramData/Jenkins/.jenkins/workspace/Promotion-Website/ansible/Promotion-Website.pem /home/myuser/.ssh/
                            '''
                        }
                        
                        // Set proper permissions on the key files
                        bat '''
                            wsl chmod 600 /home/myuser/.ssh/Promotion-Website.pem
                        '''
                        
                        // Wait for SSH to be available
                        echo "Waiting for SSH to become available on ${cleanIp}..."
                        def sshReady = false
                        def maxRetries = 10
                        
                        for (int i = 0; i < maxRetries && !sshReady; i++) {
                            def sshResult = bat(
                                script: "wsl ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 -i ${WSL_SSH_KEY} ubuntu@${cleanIp} -C 'echo SSH_CONNECTION_SUCCESSFUL' || echo CONNECTION_FAILED",
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
${cleanIp}

[ec2:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=${WSL_SSH_KEY}
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
                                    script: "wsl ANSIBLE_HOST_KEY_CHECKING=False ANSIBLE_TIMEOUT=180 ansible-playbook -i temp_inventory.ini deploy.yml -e \"DOCKER_HUB_USERNAME=${DOCKER_HUB_USERNAME} GIT_COMMIT_HASH=${gitCommitHash}\" -v",
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
                try {
                    cleanWs(
                        deleteDirs: true,
                        cleanWhenSuccess: true,
                        cleanWhenFailure: true,
                        cleanWhenAborted: true,
                        patterns: [[pattern: '**/.git/**', type: 'EXCLUDE']]
                    )
                } catch (Exception e) {
                    echo "Warning: Workspace cleanup failed: ${e.getMessage()}"
                }
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