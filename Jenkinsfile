pipeline {
    agent any

    stages {
        stage('Install Dependencies & Build') {
            steps {
                echo "Building on Excloud..."
                sh '''
                npm install
                npm run build
                '''
            }
        }

        stage('Deploy Compiled Code to AWS') {
            steps {
                echo "Deploying to AWS..."
                sh '''
                rsync -av --delete ./dist/ ubuntu@13.235.87.108:/home/ubuntu/skill-club-backend/dist/
                ssh -o StrictHostKeyChecking=no ubuntu@13.235.87.108 "
                    cd /home/ubuntu/skill-club-backend
                    pm2 restart skill-club-backend || pm2 start dist/index.js --name skill-club-backend
                "
                '''
            }
        }
    }
}
