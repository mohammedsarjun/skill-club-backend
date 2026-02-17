pipeline {
    agent any

    stages {

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Restart Server') {
            steps {
             sh 'pm2 stop skillclub || true'
             sh 'pm2 start app.js --name skillclub'
            }
        }
    }
}
