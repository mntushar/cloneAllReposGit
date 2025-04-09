const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const cloneDirectory = path.join(__dirname, 'my_repos'); 

if (!fs.existsSync(cloneDirectory)) {
  fs.mkdirSync(cloneDirectory);
}

// Function to authenticate the user using GitHub username and token
function authenticate() {
  return new Promise((resolve, reject) => {
    rl.question('Enter your GitHub Username: ', (user) => {
      rl.question('Enter your GitHub Personal Access Token: ', (token) => {
        if (!user || !token) {
          reject('GitHub Username or Token is missing!');
          rl.close();
          return;
        }

        process.env.GITHUB_TOKEN = token;
        process.env.username = user;

        exec(`curl -H "Authorization: token ${token}" https://api.github.com/user`, (error, stdout, stderr) => {
          if (error) {
            reject(`Authentication failed: ${stderr || error}`);
            rl.close();
            return;
          }
          const userData = JSON.parse(stdout);
          if (userData.login === user) {
            console.log('Authentication successful!');
            resolve();
          } else {
            reject('Authentication failed. Check your credentials.');
            rl.close();
          }
        });
      });
    });
  });
}

// Function to clone all repositories
function cloneRepositories() {
  authenticate()
    .then(() => {
      exec(`gh repo list ${process.env.username} --limit 1000 --json name,url -q ".[].url"`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }

        const repos = stdout.trim().split('\n');
        repos.forEach(repoUrl => {
          const httpsUrl = repoUrl.replace('git@github.com:', 'https://github.com/');

          const repoName = httpsUrl.split('/').pop().replace('.git', '');

          const repoPath = path.join(cloneDirectory, repoName);

          console.log(`Cloning: ${httpsUrl} into ${repoPath}`);
          
          // Clone the repo into the specified path
          exec(`git clone ${httpsUrl} "${repoPath}"`, (err, out, errStderr) => {
            if (err) {
              console.error(`Error cloning ${httpsUrl}: ${err}`);
            } else {
              console.log(`Successfully cloned ${httpsUrl}`);
            }
          });
        });
      });
      console.log('Successfully cloned all');
    })
    .catch(err => {
      console.error(err);
      rl.close();
    });
}

cloneRepositories();
