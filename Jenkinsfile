pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        TERRAFORM_DIR = 'terraform'
        ANSIBLE_DIR = 'ansible'
        AWS_REGION = 'us-east-1'
        WORKSPACE = 'C:\\ProgramData\\Jenkins\\.jenkins\\workspace\\Promotion-Website'
        NO_PROXY = '*.docker.io,registry-1.docker.io'
        WSL_SSH_KEY = '/root/.ssh/Promotion-Website.pem'
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
        
        stage('Build Docker Images with Docker Compose') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                         usernameVariable: 'DOCKER_HUB_USERNAME', passwordVariable: 'DOCKER_HUB_PASSWORD')]) {
                        def gitCommitHash = bat(
                            script: "\"${env.GIT_PATH}\" rev-parse --short HEAD",
                            returnStdout: true
                        ).trim().readLines().last()
                        
                        writeFile file: '.env', text: """
                            DOCKER_HUB_USERNAME=${DOCKER_HUB_USERNAME}
                            GIT_COMMIT_HASH=${gitCommitHash}
                            MONGODB_URI=mongodb+srv://usudarasubodhitha:Ky6eGwIULcmMRelb@cluster0.phvip.mongodb.net
                            JWT_SECRET=79240e340fb04076718f094981292e09aea180ad7138657ed8a0da39a9fe7c59884e7bf6019e16bd10e3ccf28c7bfca2561cdf6f8c339d3c6e2ab29f35e3d968
                            PORT=4000
                        """
                        
                        bat """
                            docker-compose -f ${DOCKER_COMPOSE_FILE} build \
                                --build-arg DOCKER_HUB_USERNAME=${DOCKER_HUB_USERNAME} \
                                --build-arg GIT_COMMIT_HASH=${gitCommitHash}
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
                        
                        bat '''
                            mkdir %USERPROFILE%\\.docker 2>nul
                            echo {"proxies":{"default":{"httpProxy":"","httpsProxy":"","noProxy":"*.docker.io,registry-1.docker.io"}}} > %USERPROFILE%\\.docker\\config.json
                        '''
                        
                        bat "echo %DOCKER_HUB_PASSWORD% | docker login -u %DOCKER_HUB_USERNAME% --password-stdin"
                        
                        retry(3) {
                            bat """
                                docker tag ${DOCKER_HUB_USERNAME}/dairy-frontend:latest ${DOCKER_HUB_USERNAME}/dairy-frontend:${gitCommitHash}
                                docker push ${DOCKER_HUB_USERNAME}/dairy-frontend:${gitCommitHash}
                                docker push ${DOCKER_HUB_USERNAME}/dairy-frontend:latest
                            """
                        }
                        
                        retry(3) {
                            bat """
                                docker tag ${DOCKER_HUB_USERNAME}/dairy-backend:latest ${DOCKER_HUB_USERNAME}/dairy-backend:${gitCommitHash}
                                docker push ${DOCKER_HUB_USERNAME}/dairy-backend:${gitCommitHash}
                                docker push ${DOCKER_HUB_USERNAME}/dairy-backend:latest
                            """
                        }
                    }
                }
            }
        }
        
        stage('Terraform Apply') {
            steps {
                dir(TERRAFORM_DIR) {
                    withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
                         credentialsId: 'aws-credentials',
                         accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                         secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                        bat """
                            terraform init -input=false
                            terraform apply -auto-approve -parallelism=${TERRAFORM_PARALLELISM}
                        """
                        
                        script {
                            env.EC2_IP = bat(
                                script: 'terraform output -raw public_ip',
                                returnStdout: true
                            ).trim()
                        }
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
                            wsl mkdir -p /root/.ssh
                            wsl chmod 700 /root/.ssh
                        '''
                        
                        bat """
                            wsl cp ${WSL_SSH_KEY} /root/.ssh/
                            wsl chmod 600 /root/.ssh/Promotion-Website.pem
                        """

                        withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                                     usernameVariable: 'DOCKER_HUB_USERNAME',
                                     passwordVariable: 'DOCKER_HUB_PASSWORD')]) {
                            def gitCommitHash = bat(
                                script: "\"${env.GIT_PATH}\" rev-parse --short HEAD",
                                returnStdout: true
                            ).trim().readLines().last()
                            
                            writeFile file: 'inventory.ini', text: """[ec2]
${env.EC2_IP} ansible_user=ubuntu ansible_ssh_private_key_file=${WSL_SSH_KEY}

[ec2:vars]
ansible_python_interpreter=/usr/bin/python3
ansible_ssh_common_args='-o StrictHostKeyChecking=no -o ConnectTimeout=60'
"""
                            bat """
                                wsl ansible-playbook -i inventory.ini deploy.yml \\
                                    -e "docker_hub_username=${DOCKER_HUB_USERNAME}" \\
                                    -e "git_commit_hash=${gitCommitHash}"
                            """
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            bat 'docker logout'
            cleanWs()
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