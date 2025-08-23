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
                    odcInstallation: 'OWASP-DepCheck-12', 
                    additionalArguments: '--scan . --out . --format ALL --prettyPrint --nvdApiKey ' + env.NVD_API_KEY
                )
                }
                dependencyCheckPublisher failedTotalCritical: 1, pattern: 'dependency-check-report.xml', stopBuild: true
            publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: './', reportFiles: 'dependency-check-jenkins.html', reportName: 'Dependency check HTML Report', reportTitles: '', useWrapperFileDirectly: true])
            }
        }
    }
    post {
        always {
            echo 'Cleaning up...'
        }
    }
}