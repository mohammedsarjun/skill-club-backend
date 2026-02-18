pipeline {
    agent any

    tools {
        nodejs "Node24"
    }

    stages {

        stage('Install') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Deploy') {
            steps {
                bat 'scp -r dist ubuntu@13.235.87.108:/home/ubuntu/skill-club-backend/'
                bat 'ssh ubuntu@13.235.87.108 "cd /home/ubuntu/skill-club-backend && pm2 restart skill-club-backend || pm2 start dist/index.js --name skill-club-backend"'
            }
        }
    }
}
