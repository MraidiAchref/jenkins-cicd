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
                withCredentials([string(credentialsId: 'NVD_API_KEY', variable: 'NVD_API_KEY')]) {
                dependencyCheck(
                    odcInstallation: 'OWASP-DepCheck-10', 
                    additionalArguments: "--scan . --out . --format ALL --prettyPrint --nvdApiKey ${NVD_API_KEY}"
                )
                }
            }
        }
    }
    post {
        always {
            echo 'Cleaning up...'
        }
    }
}