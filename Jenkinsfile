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
        /*stage('OWASP Dependency Check') {
            steps {
                dependencyCheck(
                    odcInstallation: 'OWASP-DepCheck-12', 
                    additionalArguments: '--scan . --out . --format ALL --prettyPrint --nvdApiKey ' + env.NVD_API_KEY
                )
                
                dependencyCheckPublisher failedTotalCritical: 1, pattern: 'dependency-check-report.xml', stopBuild: true

            }
        }*/
        stage('Code coverage') {
            steps {
                catchError(buildResult: 'UNSTABLE', message: 'We have a problem with code coverage') {
                    sh 'npm run coverage'
                }


            }
        }
        /*stage('SAST with SonarQube') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    withSonarQubeEnv('sonarqube-server') {
                        sh '''
                        $SONAR_SCANNER_HOME/bin/sonar-scanner \
                        -Dsonar.projectKey=cicd-with-jenkins \
                        -Dsonar.sources=app.js \
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                        '''
                    }
                    waitForQualityGate abortPipeline: true
              }
            }
        }*/
        stage('Build docker image') {
            steps {
                sh 'docker build -t mraidiachref/solar-system:$GIT_COMMIT .'
            }
            
        }
        stage('Trivy Vulnerability Scan') {
            steps {
                sh ''' 
                   trivy image mraidiachref/solar-system:$GIT_COMMIT \
                   --severity HIGH,MEDIUM,LOW \
                   --exit-code 0 \
                   --quiet \
                   --format json -o trivy-image-Medium-results.json 

                   trivy image mraidiachref/solar-system:$GIT_COMMIT \
                   --severity CRITICAL\
                   --exit-code 1 \
                   --quiet \
                   --format json -o trivy-image-CRITICAL-results.json 
                '''
            }
            post {
                always {
                    sh ''' 
                        trivy convert \
                            --format template --template "@/usr/local/share/trivy/templates/html.tpl" \
                            --output trivy-image-Medium-results.html trivy-image-Medium-results.json 

                        trivy convert \
                            --format template --template "@/usr/local/share/trivy/templates/html.tpl" \
                            --output trivy-image-CRITICAL-results.html trivy-image-CRITICAL-results.json 

                        trivy convert \
                            --format template --template "@/usr/local/share/trivy/templates/junit.tpl" \
                            --output trivy-image-Medium-results.xml trivy-image-Medium-results.json 

                        trivy convert \
                            --format template --template "@/usr/local/share/trivy/templates/junit.tpl" \
                            --output trivy-image-CRITICAL-results.xml trivy-image-CRITICAL-results.json 
                    '''
                }
            }   
        }
        stage('Push Docker Image') {   // plugin docker pipeline
            steps {
                withDockerRegistry(credentialsId: 'DOCKER_HUB_TOKEN', url: '""') {
                    sh 'docker push mraidiachref/solar-system:$GIT_COMMIT '
                }
            }
            
        }
            

    }
    post {
        always {
            publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: './', reportFiles: 'dependency-check-jenkins.html', reportName: 'Dependency check HTML Report', reportTitles: '', useWrapperFileDirectly: true])

            publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: './coverage/lcov-report', reportFiles: 'index.html', reportName: 'Code coverage HTML Report', reportTitles: '', useWrapperFileDirectly: true])

            publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: './', reportFiles: 'trivy-image-CRITICAL-results.html', reportName: 'trivy critical vulnerabities report ', reportTitles: '', useWrapperFileDirectly: true])

            publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: './', reportFiles: 'trivy-image-Medium-results.html', reportName: 'trivy medium vulnerabities report ', reportTitles: '', useWrapperFileDirectly: true])
        }
    }
}