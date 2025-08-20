pipeline {
    agent any
    tools {
        nodejs 'nodejs-22-16-0'
    }
    stages {
        stage('Test nodejs tool') {
            steps {
                sh '''
                    node -v     
                    npm -v
                '''
            }
        }
    }
    post {
        always {
            echo 'Cleaning up...'
        }
    }
}