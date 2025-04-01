pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        TERRAFORM_DIR = 'terraform'
        ANSIBLE_DIR = 'ansible'
        AWS_REGION = 'us-east-1'  // Changed to match your region
        WORKSPACE = 'C:\\ProgramData\\Jenkins\\.jenkins\\workspace\\Promotion-Website'
        NO_PROXY = '*.docker.io,registry-1.docker.io'
        WSL_SSH_KEY = '/root/.ssh/Promotion-Website.pem'  // Changed to match your key path
        TERRAFORM_PARALLELISM = '10'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/udaraDev/Promotion-Website.git'  // Changed to your repo
            }
        }
        
        stage('Build Docker Images with Docker Compose') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',  // Changed to match your credentials ID
                         usernameVariable: 'DOCKER_HUB_USERNAME', passwordVariable: 'DOCKER_HUB_PASSWORD')]) {
                        def gitCommitHash = bat(script: 'git rev-parse --short HEAD', returnStdout: true).trim().readLines().last()
                        
                        writeFile file: '.env', text: """
                            DOCKER_HUB_USERNAME=${DOCKER_HUB_USERNAME}
                            GIT_COMMIT_HASH=${gitCommitHash}
                            MONGODB_URI=mongodb+srv://usudarasubodhitha:Ky6eGwIULcmMRelb@cluster0.phvip.mongodb.net
                            JWT_SECRET=79240e340fb04076718f094981292e09aea180ad7138657ed8a0da39a9fe7c59884e7bf6019e16bd10e3ccf28c7bfca2561cdf6f8c339d3c6e2ab29f35e3d968
                            PORT=4000
                        """
                        
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
                        def gitCommitHash = bat(script: 'git rev-parse --short HEAD', returnStdout: true).trim().readLines().last()
                        
                        bat '''
                            echo {"proxies":{"default":{"httpProxy":"","httpsProxy":"","noProxy":"*.docker.io,registry-1.docker.io"}}} > %USERPROFILE%\\.docker\\config.json
                        '''
                        
                        bat "echo %DOCKER_HUB_PASSWORD% | docker login -u %DOCKER_HUB_USERNAME% --password-stdin"
                        
                        retry(3) {
                            bat "docker push %DOCKER_HUB_USERNAME%/dairy-frontend:${gitCommitHash}"  // Changed image names
                        }
                        
                        retry(3) {
                            bat "docker push %DOCKER_HUB_USERNAME%/dairy-backend:${gitCommitHash}"
                        }
                    }
                }
            }
        }
        
        stage('Terraform Apply') {
            steps {
                dir(TERRAFORM_DIR) {
                    script {
                        bat "terraform init"
                        bat "terraform apply -parallelism=${TERRAFORM_PARALLELISM} -var-file=variables.tfvars"
                    }
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
                        
                        bat '''
                            if not exist ansible mkdir ansible
                            wsl mkdir -p /root/.ssh
                        '''
                        
                        bat '''
                            wsl chmod 600 /root/.ssh/Promotion-Website.pem
                            wsl ls -la /root/.ssh/Promotion-Website.pem
                        '''

                        withCredentials([
                            usernamePassword(credentialsId: 'dockerhub-cred',
                                         usernameVariable: 'DOCKER_HUB_USERNAME',
                                         passwordVariable: 'DOCKER_HUB_PASSWORD')
                        ]) {
                            def gitCommitHash = bat(script: 'wsl git rev-parse --short HEAD', returnStdout: true).trim().readLines().last()
                            
                            writeFile file: 'temp_inventory.ini', text: """[ec2]
${env.EC2_IP} ansible_user=ubuntu ansible_ssh_private_key_file=${WSL_SSH_KEY}

[ec2:vars]
ansible_python_interpreter=/usr/bin/python3
ansible_ssh_common_args='-o StrictHostKeyChecking=no -o ConnectTimeout=60'
"""
                            def result = bat(
                                script: "wsl ansible-playbook -i temp_inventory.ini deploy.yml -u ubuntu --private-key ${WSL_SSH_KEY} -e \"DOCKER_HUB_USERNAME=${DOCKER_HUB_USERNAME} GIT_COMMIT_HASH=${gitCommitHash}\" -vvv",
                                returnStatus: true
                            )
                            
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
                try {
                    cleanWs(
                        deleteDirs: true,
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