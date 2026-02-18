pipeline {
    agent any

    tools {
        nodejs "Node18"
    }

    stages {

        stage('Install Dependencies & Build') {
            steps {
                echo "Installing and building..."
                bat '''
                npm install
                npm run build
                '''
            }
        }

        stage('Deploy to AWS EC2') {
            steps {
                echo "Deploying to EC2..."

                bat '''
                scp -r dist ubuntu@13.235.87.108:/home/ubuntu/skill-club-backend/

                ssh ubuntu@13.235.87.108 "cd /home/ubuntu/skill-club-backend && pm2 restart skill-club-backend || pm2 start dist/index.js --name skill-club-backend"
                '''
            }
        }
    }
}