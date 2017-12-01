pipeline {
  agent any

  stages {
    stage('build') {
      steps {
        build '../reticulum/master'
      }
    }
  }

  post {
     always {
       deleteDir()
     }
   }
}
