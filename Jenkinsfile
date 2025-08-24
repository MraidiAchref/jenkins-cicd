pipeline {
    agent any
    tools {
        nodejs 'nodejs-22-16-0'
    }
    environment {
        NVD_API_KEY = credentials('NVD_API_KEY')
        SONAR_TOKEN = credentials('SONAR_TOKEN')
        SONAR_SCANNER_HOME = tool 'sonarqube-scanner-6.1.0'
    }
    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm install --no-audit'
            }
        }
        stage('OWASP Dependency Check') {
            steps {
                dependencyCheck(
                    odcInstallation: 'OWASP-DepCheck-12', 
                    additionalArguments: '--scan . --out . --format ALL --prettyPrint --nvdApiKey ' + env.NVD_API_KEY
                )
                
                dependencyCheckPublisher failedTotalCritical: 1, pattern: 'dependency-check-report.xml', stopBuild: true

            }
        }
        stage('Code coverage') {
            steps {
                catchError(buildResult: 'UNSTABLE', message: 'We have a problem with code coverage') {
                    sh 'npm run coverage'
                }


            }
        }
        stage('SAST with SonarQube') {
            steps {
                sh '''
                £SONAR_SCANNER_HOME/bin/sonar-scanner \
                -Dsonar.projectKey=cicd-with-jenkins \
                -Dsonar.sources=app.js \
                -Dsonar.host.url=http://18.201.82.244:9000 \
                -Dsonar.login=$SONAR_TOKEN
                '''
            }
        }
    }
    post {
        always {
            publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: './', reportFiles: 'dependency-check-jenkins.html', reportName: 'Dependency check HTML Report', reportTitles: '', useWrapperFileDirectly: true])

            publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: './coverage/lcov-report', reportFiles: 'index.html', reportName: 'Code coverage HTML Report', reportTitles: '', useWrapperFileDirectly: true])
        }
    }
}