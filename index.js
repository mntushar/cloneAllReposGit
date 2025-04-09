const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const username = 'mntushar';  // Replace with your GitHub username
const cloneDirectory = path.join(__dirname, 'my_repos');  // Folder where repos will be cloned

// Create the directory if it doesn't exist
if (!fs.existsSync(cloneDirectory)) {
  fs.mkdirSync(cloneDirectory);
}

// Function to clone all repositories
function cloneRepositories() {
  // Get the list of repositories using GitHub CLI
  exec(`gh repo list ${username} --limit 1000 --json name,url -q ".[].url"`, (error, stdout, stderr) => {
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
      // Convert the SSH URL to an HTTPS URL by replacing 'git@github.com:' with 'https://github.com/'
      const httpsUrl = repoUrl.replace('git@github.com:', 'https://github.com/');

      // Extract repo name from the URL
      const repoName = httpsUrl.split('/').pop().replace('.git', '');

      // Create a subdirectory for each repo inside the main directory
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
}

cloneRepositories();
