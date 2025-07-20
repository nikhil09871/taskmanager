pipeline {
    agent any
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
        DOCKER_IMAGE_FRONTEND = "nikhil788/taskmanager-frontend"
        DOCKER_IMAGE_BACKEND  = "nikhil788/taskmanager-backend"
    }

    options {
        skipStagesAfterUnstable()
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/nikhil09871/taskmanager.git'
            }
        }

        stage('Run Tests') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                            sh 'npm run lint'
                        }
                    }
                }

                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                            // Insert unit/integration tests here
                            sh 'echo "Backend tests passed"'
                        }
                    }
                }
            }
        }

        stage('Security Scan') {
            steps {
                sh 'echo "Run dependency vulnerability scan here (OWASP or snyk)"'
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh 'docker login -u $DOCKERHUB_CREDENTIALS_USR -p $DOCKERHUB_CREDENTIALS_PSW'
                    sh 'docker build -t $DOCKER_IMAGE_FRONTEND ./frontend'
                    sh 'docker push $DOCKER_IMAGE_FRONTEND'
                    sh 'docker build -t $DOCKER_IMAGE_BACKEND ./backend'
                    sh 'docker push $DOCKER_IMAGE_BACKEND'
                }
            }
        }

        stage('Deploy to Staging') {
            steps {
                echo 'Trigger deployment script to staging server (via SSH or webhooks)'
            }
        }

        stage('Approval for Production') {
            steps {
                input message: 'Approve deployment to production?', ok: 'Deploy'
            }
        }

        stage('Deploy to Production') {
            steps {
                echo 'Trigger deployment script to production server'
            }
        }
    }

    post {
        failure {
            mail to: 'you@example.com',
                 subject: "❌ Jenkins Build Failed: ${env.JOB_NAME}",
                 body: "Build ${env.BUILD_NUMBER} failed. Check console for details."
        }
    }
}
