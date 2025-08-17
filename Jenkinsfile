pipeline {
    agent any

    stages {
        stage('Mock stage') {
            steps {
                echo 'Mocking...'
            }
        }
    }
    post {
        always {
            echo 'Cleaning up...'
        }
    }
}