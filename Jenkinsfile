pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-cred')
        DOCKER_IMAGE_NAME = "tharuka2001"  // Change this to match your Docker Hub username
        DOCKER_IMAGE_TAG = "latest"
        // Remove proxy settings as they might interfere
        NO_PROXY = "*.docker.io,registry-1.docker.io,index.docker.io"
    }
    
    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/udaraDev/Promotion-Website.git'
            }
        }
        
        stage('Docker Login') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-cred', passwordVariable: 'DOCKERHUB_PASSWORD', usernameVariable: 'DOCKERHUB_USERNAME')]) {
                        // Write credentials to a temporary file
                        bat """
                            @echo off
                            echo %DOCKERHUB_PASSWORD% > docker_password.txt
                            type docker_password.txt | docker login -u %DOCKERHUB_USERNAME% --password-stdin
                            del docker_password.txt
                        """
                    }
                }
            }
        }
        
        stage('Build and Tag Images') {
            steps {
                script {
                    bat """
                        docker build -t ${DOCKER_IMAGE_NAME}/dairy-backend:${DOCKER_IMAGE_TAG} ./backend
                        docker build -t ${DOCKER_IMAGE_NAME}/dairy-frontend:${DOCKER_IMAGE_TAG} ./frontend
                        docker images
                    """
                }
            }
        }
        
        stage('Push Images to DockerHub') {
            steps {
                script {
                    // More verbose push with error handling
                    bat """
                        docker push ${DOCKER_IMAGE_NAME}/dairy-backend:${DOCKER_IMAGE_TAG} || exit 1
                        echo "Backend image pushed successfully"
                        docker push ${DOCKER_IMAGE_NAME}/dairy-frontend:${DOCKER_IMAGE_TAG} || exit 1
                        echo "Frontend image pushed successfully"
                    """
                }
            }
        }
    }
    
    post {
        always {
            bat 'docker logout'
            cleanWs()
        }
        failure {
            script {
                bat '''
                    echo "Pipeline failed! Displaying Docker info:"
                    docker info
                    docker images
                '''
            }
        }
    }
}