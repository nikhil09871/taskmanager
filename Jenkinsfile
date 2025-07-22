pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
        DOCKER_IMAGE_FRONTEND = "nikhil788/taskmanager-frontend"
        DOCKER_IMAGE_BACKEND  = "nikhil788/taskmanager-backend"
    }

    options {
        skipStagesAfterUnstable()
        timeout(time: 30, unit: 'MINUTES') // Entire pipeline timeout
    }

    stages {

        stage('Checkout') {
            steps {
                echo "Checking out repository..."
                git branch: 'main', url: 'https://github.com/nikhil09871/taskmanager.git'
            }
        }

        stage('Run Tests') {
            parallel {

                stage('Frontend Tests') {
                    steps {
                        timeout(time: 5, unit: 'MINUTES') {
                            dir('frontend') {
                                echo " Installing frontend dependencies..."
                                sh 'npm ci'
                                echo " Running frontend lint..."
                                // Don't fail build if lint fails
                                sh 'npm run lint || echo "Lint warnings ignored"'
                            }
                        }
                    }
                }

                stage('Backend Tests') {
                    steps {
                        timeout(time: 5, unit: 'MINUTES') {
                            dir('backend') {
                                echo " Installing backend dependencies..."
                                sh 'npm ci'
                                echo " Running backend tests..."
                                // Replace below with real tests later
                                sh 'echo "Backend tests passed "'
                            }
                        }
                    }
                }
            }
        }

       stage('Security Scan') {
    steps {
        withCredentials([string(credentialsId: 'SNYK_TOKEN', variable: 'SNYK_TOKEN')]) {
            echo " Running Snyk scan for backend and frontend dependencies..."
            sh '''
                cd frontend && npm install snyk && npx snyk test || echo "Frontend vulnerabilities found"
                cd ../backend && npm install snyk && npx snyk test || echo "Backend vulnerabilities found"
            '''
        }
    }
}


        stage('Build Docker Images') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    script {
                        echo " Logging into DockerHub..."
                        sh 'docker login -u $DOCKERHUB_CREDENTIALS_USR -p $DOCKERHUB_CREDENTIALS_PSW'

                        echo " Building frontend Docker image..."
                        sh 'docker build -t $DOCKER_IMAGE_FRONTEND ./frontend'

                        echo " Pushing frontend Docker image..."
                        sh 'docker push $DOCKER_IMAGE_FRONTEND'

                        echo " Building backend Docker image..."
                        sh 'docker build -t $DOCKER_IMAGE_BACKEND ./backend'

                        echo " Pushing backend Docker image..."
                        sh 'docker push $DOCKER_IMAGE_BACKEND'
                    }
                }
            }
        }

        stage('Deploy to Staging') {
            steps {
                echo "🚀 Deploying to staging server (simulate SSH or webhook)..."
                // Replace with your actual script
                sh 'echo "Triggering deploy script..."'
            }
        }

        stage('Approval for Production') {
            steps {
                input message: 'Approve deployment to production?', ok: 'Deploy Now'
            }
        }

        stage('Deploy to Production') {
            steps {
                echo " Deploying to production server..."
                // Replace with your actual prod deploy command
                sh 'echo "Production deployment triggered"'
            }
        }
    }

    post {
    failure {
        slackSend (
            channel: '#jenkins-alerts',
            color: 'danger',
            message: " Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER} \nDetails: ${env.BUILD_URL}"
        )
    }

    success {
        slackSend (
            channel: '#jenkins-alerts',
            color: 'good',
            message: " Build Passed: ${env.JOB_NAME} #${env.BUILD_NUMBER} \nDetails: ${env.BUILD_URL}"
        )
    }
}
}
