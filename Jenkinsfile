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
        stage('OWASP Dependency Check') {
            steps {
                dependencyCheck additionalArguments: '''
                --scan	\'./\'
                --out \'./\'
                --format \'ALL\'
                --prettyPrint''', odcInstallation: 'OWASP-DepCheck-10'            
            }
        }
    }
    post {
        always {
            echo 'Cleaning up...'
        }
    }
}