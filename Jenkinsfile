pipeline {
    agent any

    stages {
        stage('try webhook') {
            steps {
                echo 'hello ...'
            }
        }
    }
    post {
        always {
            echo 'Cleaning up...'
        }
    }
}