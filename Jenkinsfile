pipeline {
    agent any
    tools {
        nodejs 'nodejs-22-16-0'
    }
    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm install --no-audit'
            }
        }
    }
    post {
        always {
            echo 'Cleaning up...'
        }
    }
}