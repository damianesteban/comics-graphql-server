pipeline {
  agent {
    kubernetes {
      label 'comics-app'  // all your pods will be named with this prefix, followed by a unique id
      idleMinutes 5  // how long the pod will live after no jobs have run on it
      yamlFile 'build-pod.yaml'  // path to the pod definition relative to the root of our project 
      defaultContainer 'nodejs'  // define a default container if more than a few stages use it, will default to jnlp container
    }
  }
  stages {
    stage('Build') {
      steps {  // no container directive is needed as the maven container is the default
        container('nodejs') {
          sh "yarn install"
        } 
      }
    }
    stage('Build Docker Image') {
      steps {
        container('docker') {  
          sh "docker build -t damianesteban/comics-server:latest ."  // when we run docker in this step, we're running it via a shell on the docker build-pod container, 
          sh "docker push damianesteban/comics-server:latest"        // which is just connecting to the host docker deaemon
        }
      }
    }
  }
}