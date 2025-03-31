pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-cred')
        DOCKER_IMAGE_NAME = "tharuka2001"  // your Docker Hub username
        DOCKER_IMAGE_TAG = "latest"
    }
    
    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/udaraDev/Promotion-Website.git'
            }
        }
        
        stage('Check Docker Installation') {
            steps {
                script {
                    bat(script: 'where docker', returnStatus: true)
                    bat 'echo Checking if Docker is properly installed...'
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    def backendBuildStatus = bat(script: "docker build -t ${DOCKER_IMAGE_NAME}/dairy-backend:${DOCKER_IMAGE_TAG} ./backend", returnStatus: true)
                    if (backendBuildStatus != 0) {
                        error "Failed to build backend Docker image. Make sure Docker is installed and in the PATH."
                    }
                    
                    def frontendBuildStatus = bat(script: "docker build -t ${DOCKER_IMAGE_NAME}/dairy-frontend:${DOCKER_IMAGE_TAG} ./frontend", returnStatus: true)
                    if (frontendBuildStatus != 0) {
                        error "Failed to build frontend Docker image. Make sure Docker is installed and in the PATH."
                    }
                }
            }
        }
        
        stage('Login to DockerHub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-cred', passwordVariable: 'DOCKERHUB_CREDENTIALS_PSW', usernameVariable: 'DOCKERHUB_CREDENTIALS_USR')]) {
                        def loginStatus = bat(script: 'echo %DOCKERHUB_CREDENTIALS_PSW%| docker login -u %DOCKERHUB_CREDENTIALS_USR% --password-stdin', returnStatus: true)
                        if (loginStatus != 0) {
                            error "Failed to log in to Docker Hub."
                        }
                    }
                }
            }
        }
        
        stage('Push Images to DockerHub') {
            steps {
                script {
                    def backendPushStatus = bat(script: "docker push ${DOCKER_IMAGE_NAME}/dairy-backend:${DOCKER_IMAGE_TAG}", returnStatus: true)
                    if (backendPushStatus != 0) {
                        error "Failed to push backend image to Docker Hub."
                    }
                    
                    def frontendPushStatus = bat(script: "docker push ${DOCKER_IMAGE_NAME}/dairy-frontend:${DOCKER_IMAGE_TAG}", returnStatus: true)
                    if (frontendPushStatus != 0) {
                        error "Failed to push frontend image to Docker Hub."
                    }
                }
            }
        }
    }
    
    post {
        always {
            bat(script: 'docker logout', returnStatus: true)
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check the logs for details.'
        }
    }
}