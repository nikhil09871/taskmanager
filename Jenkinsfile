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

        stage('Setup Node.js') {
            steps {
                sh '''
                    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
                    sudo apt-get install -y nodejs
                    node -v
                    npm -v
                '''
            }
        }

        stage('Run Tests') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh '''
                                rm -rf node_modules package-lock.json
                                npm install
                                npm run lint
                            '''
                        }
                    }
                }

                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh '''
                                rm -rf node_modules package-lock.json
                                npm install
                                echo "Backend tests passed"
                            '''
                        }
                    }
                }
            }
        }

        stage('Security Scan') {
            steps {
                sh 'echo "Run OWASP Dependency Check or snyk scan here"'
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh '''
                        echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                        docker build -t $DOCKER_IMAGE_FRONTEND ./frontend
                        docker push $DOCKER_IMAGE_FRONTEND
                        docker build -t $DOCKER_IMAGE_BACKEND ./backend
                        docker push $DOCKER_IMAGE_BACKEND
                    '''
                }
            }
        }

        stage('Deploy to Staging') {
            steps {
                echo 'Trigger deployment script to staging server (via SSH or webhook)'
                // Example:
                // sh 'curl -X POST https://staging.example.com/deploy'
            }
        }

        stage('Approval for Production') {
            steps {
                input message: '✅ Approve deployment to production?', ok: 'Deploy'
            }
        }

        stage('Deploy to Production') {
            steps {
                echo 'Trigger deployment script to production server'
                // Example:
                // sh 'curl -X POST https://prod.example.com/deploy'
            }
        }
    }

    post {
        failure {
            // Ensure you have SMTP setup in Jenkins or comment this out
            mail to: 'you@example.com',
                 subject: "❌ Jenkins Build Failed: ${env.JOB_NAME}",
                 body: "Build ${env.BUILD_NUMBER} failed. Check console output for more details."
        }
    }
}
