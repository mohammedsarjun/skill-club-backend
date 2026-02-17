pipeline {
    agent any

    stages {

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

       stage('Build & Restart') {
    steps {
        sh '''
        npm install
        npm run build
        pm2 restart skillclub || pm2 start dist/index.js --name skillclub
        '''
    }
}
    }
}
