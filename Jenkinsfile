pipeline {
    agent any
    tools {
        nodejs 'nodejs-22-16-0'
    }
    environment {
        NVD_API_KEY = credentials('NVD_API_KEY')
        SONAR_TOKEN = credentials('SONAR_TOKEN')
        MONGO_URI = credentials('MONGO_URI')
        SONAR_SCANNER_HOME = tool 'sonarqube-scanner-6.1.0'
    }

    stages {
        stage('Resolve committer email') {
            steps {
                script {
                    env.NOTIFY_TO = sh(
                        script: "git log -1 --pretty=format:'%ae'",
                        returnStdout: true
                    ).trim()

                    if (!env.NOTIFY_TO || env.NOTIFY_TO.contains("noreply")) {
                        env.NOTIFY_TO = "mradiachref@gmail.com"   // fallback
                    }
                    echo "Will notify: ${env.NOTIFY_TO}"
                }
            }
        }
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
                sh '''
                    export NODE_ENV=test
                    npm ci --no-audit
                    npm run coverage
                    echo "=== Coverage dir ==="
                    ls -la coverage || true
                    echo "=== Verify mapping ==="
                    grep -m1 "^SF:" coverage/lcov.info || true
                    head -n 20 coverage/lcov.info || true
                '''
                }
            }
        }
        stage('SAST with SonarQube') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                withSonarQubeEnv('sonarqube-server') {
                    sh '''
                    $SONAR_SCANNER_HOME/bin/sonar-scanner \
                        -Dsonar.projectKey=cicd-with-jenkins \
                        -Dsonar.projectName=cicd-with-jenkins \
                        -Dsonar.sources=app.js \
                        -Dsonar.tests=. \
                        -Dsonar.test.inclusions=**/*test.js \
                        -Dsonar.exclusions="**/node_modules/**,**/coverage/**,**/*.html,**/trivy-*.json,**/trivy-*.xml,**/dependency-check-report.xml,**/dependency-check-*.xml,**/reports/**,**/*.min.js,**/terraform/**,**/*.tf,**/*.tfvars,**/.git/**,**/sonarqube-ansible/**" \
                        -Dsonar.javascript.lcov.reportPaths="$PWD/coverage/lcov.info"
                    '''
                }
                waitForQualityGate abortPipeline: true
                }
            }
        }
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
                withDockerRegistry(credentialsId: 'DOCKER_HUB_TOKEN', url: "") {
                    sh 'docker push mraidiachref/solar-system:$GIT_COMMIT '
                }
            }
            
        }
                    
        stage('Update argocd manifests') {
            environment { GITHUB_PAT = credentials('GITHUB_PAT') }
            steps {
                sh '''
                git config --global user.email "ci@localMraidi"
                git config --global user.name "jenkins-ci"

                rm -rf gitops-argocd
                git clone https://$GITHUB_PAT@github.com/MraidiAchref/gitops-argocd.git
                cd gitops-argocd

                sed -i "s|image: mraidiachref/solar-system.*|image: mraidiachref/solar-system:${GIT_COMMIT}|" app-deploy.yml

                git add app-deploy.yml
                git commit -m "CI: update image to ${GIT_COMMIT}"
                git push origin main
                '''
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
        success {
            mail(
            subject: "✅ SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            to: env.NOTIFY_TO,
            mimeType: 'text/html',
            body: """
                <h2>Build SUCCESS</h2>
                <p>Job: ${env.JOB_NAME}</p>
                <p>Build: #${env.BUILD_NUMBER}</p>
                <p><a href="${env.BUILD_URL}">Voir le détail</a></p>
            """
            )
        }
        failure {
            mail(
            subject: "🛑 FAILURE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            to: env.NOTIFY_TO,
            mimeType: 'text/html',
            body: """
                <h2>Build FAILURE</h2>
                <p>Pipeline échoué: ${env.JOB_NAME} (#${env.BUILD_NUMBER})</p>
                <p><a href="${env.BUILD_URL}console">Voir la console</a></p>
            """
            )
        }
    }
}