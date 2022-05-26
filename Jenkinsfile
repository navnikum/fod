pipeline {
  agent {
    label 'fod'
  }
  environment {
    PATH = "/scratch/frebuild/tools:$PATH"
  }
  tools {nodejs "Node"}
  options {
    timeout(time: 120, unit: 'MINUTES')
  }
  stages {
    stage('Checkout') {
      steps {
        checkout changelog: false, poll: false, scm: [$class: 'GitSCM', branches: [[name: """${branch_name}"""]], doGenerateSubmoduleConfigurations: false, extensions: [], submoduleCfg: [], userRemoteConfigs: [[credentialsId: 'frebuild-ssh-credential', url: """ssh://dis-generic-restricted-frebuild%40oracle.com@alm.oraclecorp.com:2222/${git_repo_name}"""]]]
      }
    }
    stage('Install') {
      steps {
        sh 'npm i'
      }
    }
    stage('Update Versions') {
      steps {
        sh """npm run update:versions -- --JET_VERSION=${jet_version} --VB_VERSION=${vb_version} --OJ_SP_VERSION=${oj_sp_version} --OJ_DYN_VERSION=${oj_dynamic_version} --JET_WEBDRIVER_PATH=${jet_webdriver_path} --DYN_WEBDRIVER_PATH=${oj_dynamic_webdriver_path} --OJ_SP_PATH=${oj_sp_cdn_path} --OJ_SP_WEBDRIVER_PATH=${oj_sp_webdriver_path} --GRUNT_VB_BUILD_PATH=${grunt_vb_build_path} --GRUNT_VB_AUDIT_PATH=${grunt_vb_audit_path} --VB_WEBDRIVER_PATH=${vb_webdriver_path}"""
      }   
    }   
    stage('Install again') {
      steps {
        sh 'npm i'
      }
    }
    stage('VB Audit') {
      steps {
        catchError(message: "Audit failed!", stageResult: 'UNSTABLE', buildResult: 'UNSTABLE') {
          sh 'npm run vb:audit'
        }
      }
    }
    stage('VB Action Chain Test') {
      steps {
        catchError(message: "Action Chain tests failed!", stageResult: 'UNSTABLE', buildResult: 'UNSTABLE') {
          sh 'npm run vb:actionChain'
        }
      }
    }
    stage('Hoverfly'){
      steps {
        sh 'chmod u+x startHoverfly.sh'
        sh 'npm run hoverfly:start'
      }
    }
    stage('Upstream Tests') {
      steps {
        sh 'npm run start &'
        sleep 60
        wrap([$class: 'Xvnc', takeScreenshot: false, useXauthority: true]) {
          sh """${test_command}"""
        }
      }
    }

  }
  
}
