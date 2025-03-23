pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-cred')
        DOCKER_IMAGE_NAME = "usudarasubodhitha"  // replace with your Docker Hub username
        DOCKER_IMAGE_TAG = "latest"
    }
    
    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/usudarasubodhitha/dairy-promotion-website.git'  // replace with your GitHub repo URL
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    bat "docker build -t ${DOCKER_IMAGE_NAME.toLowerCase()}/dairy-backend:${DOCKER_IMAGE_TAG} ./backend"
                    bat "docker build -t ${DOCKER_IMAGE_NAME.toLowerCase()}/dairy-frontend:${DOCKER_IMAGE_TAG} ./frontend"
                }
            }
        }
        
        stage('Login to DockerHub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-cred', passwordVariable: 'DOCKERHUB_CREDENTIALS_PSW', usernameVariable: 'DOCKERHUB_CREDENTIALS_USR')]) {
                        bat 'echo %DOCKERHUB_CREDENTIALS_PSW%| docker login -u %DOCKERHUB_CREDENTIALS_USR% --password-stdin'
                    }
                }
            }
        }
        
        stage('Push Images to DockerHub') {
            steps {
                script {
                    bat "docker push ${DOCKER_IMAGE_NAME.toLowerCase()}/dairy-backend:${DOCKER_IMAGE_TAG}"
                    bat "docker push ${DOCKER_IMAGE_NAME.toLowerCase()}/dairy-frontend:${DOCKER_IMAGE_TAG}"
                }
            }
        }
    }
    
    post {
        always {
            bat 'docker logout'
            cleanWs()
        }
    }
} 