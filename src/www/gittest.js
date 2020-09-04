Search 6,000+ tutorials
freeCodeCamp.org
Donate
Stay safe, friends. Learn to code from home. Use our free 2,000 hour curriculum.
25 JANUARY 2017
/
#GIT
How to commit entire directories to GitHub directly from your browser using GitHub.js
How to commit entire directories to GitHub directly from your browser using GitHub.js
by Illia Kolodiazhnyi

Did you know you can parse a movie database website, then store its data in your own GitHub repository — without ever leaving your browser?

You can also do things like change a webpage by using your browser’s developer tools, then push the updated code as a commit — together with all its images and other resources.

GitHub’s HTTP API lets you to use pretty much all of GitHub infrastructure. In most cases, it’s transparent and easy to grasp. But there’s one thing that isn’t so easy to do at first glance — making nice commits with lots of files at the same time, like running git push from your terminal does.

But don’t worry. By the time you finish reading this article, you’ll be able to use a set of low-level calls to achieve this.

Getting set up
You’re going to implement a function that will take the data from files and push them with a commit to GitHub, like this:

pushFiles(    'Making a commit with my adorable files',    [        {content: 'You are a Wizard, Harry', path: 'harry.txt'},        {content: 'May the Force be with you', path: 'jedi.txt'}    ]);
There are a few important things to note, though:

I’m going to use the Github-JS library to simplify things. It’s a convenient wrapper around the calls to the API.
Although there will only be one function to do the job, it will make many requests under the hood. This is due to the way the GitHub API is built — it has to make at least one request per file submitted, then several extra requests.
Committing binary files (like images) will require a bit more set up. I have a special section below that covers this.
An algorithm for success
Take a look at the internal structure of the GitHub repository:


Repository structure example (source)
Here is a brief explanation of how this works: the top pointer of every branch points to a particular commit, which points to a tree, which points to a version of a file. Those are basically the type of objects you should care about: Commit, Tree and Blob (content of a file).

Each contains a hash string called SHA — it’s actually a checksum hash of the object. So objects point to each other using those SHA values.

On the Git Data page of the API, you can find the description of the algorithm to achieve exactly your goal. But here’s how this works in detail:

Retrieves the current freshest Commit and remembers its SHA. It will be needed later to place a new Commit on top of the old one.
Retrieves the Tree of the current Commit and remembers its SHA, too. It will be needed for creating the new Tree to base it on the old one.
Creates new Blobs for each of your files, then saves their SHAs.
Creates a new Tree and passes information about the Blobs it created in step 3 and the SHA of the old Tree retrieved in step 2. This will create a relation between the old Commit and the new one.
Creates a new Commit using: the SHA of the old Commit retrieved on step 1, the SHA of the Tree created on step 4, and the commit message for the new Commit.
Finally, updates the pointer of the branch to point to the newly created Commit.
Apart from that, note that there’s also an authentication step, and a step where GitHub sets up the repository and branch you would like to push to.

Now that you have a conceptual understanding of how this works, let’s dive into the fun part — getting things done with code!

Holy Code!
Let’s keep things simple and use a wrapper function to store the functionality. This exposes a reference to an instance of the Github API wrapper library, and along with it several functions for getting the job done:

function GithubAPI(auth) {    let repo;    let filesToCommit = [];    let currentBranch = {};    let newCommit = {};
    this.gh = new GitHub(auth);
    this.setRepo = function() {}    this.setBranch = function() {}    this.pushFiles = function() {}
    function getCurrentCommitSHA() {}    function getCurrentTreeSHA() {}    function createFiles() {}    function createFile() {}    function createTree() {}    function createCommit() {}    function updateHead() {}};
The setRepo() just passes arguments to the underlying library and saves the Repository object:

this.setRepo = function(userName, repoName) {    repo = this.gh.getRepo(userName, repoName);}
The setBranch() is a bit more complicated in logic:

this.setBranch = function(branchName) {    return repo.listBranches()        .then((branches) => {            let branchExists = branches.data                .find( branch => branch.name === branchName );            if (!branchExists) {                return repo.createBranch('master', branchName)                    .then(() => {                        currentBranch.name = branchName;                    });            } else {                currentBranch.name = branchName;            }        });}
Here you get all branches of the Repository and try to find the one you want to commit to. If it’s not found, the new branch is created based on the master.

When you use the pushFiles() function, it goes through all the steps we discussed above:

this.pushFiles = function(message, files) {    return getCurrentCommitSHA()        .then(getCurrentTreeSHA)        .then( () => createFiles(files) )        .then(createTree)        .then( () => createCommit(message) )        .then(updateHead)        .catch((e) => {            console.error(e);        });}
It uses a chain of Promises, as every step will make an actual request to the GitHub API.

Step 1 and 2 of the Algorithm aren’t very interesting. They just call API methods and save the SHAs of the current Commit and Tree:

function getCurrentCommitSHA() {    return repo.getRef('heads/' + currentBranch.name)        .then((ref) => {            currentBranch.commitSHA = ref.data.object.sha;        });}
function getCurrentTreeSHA() {    return repo.getCommit(currentBranch.commitSHA)        .then((commit) => {            currentBranch.treeSHA = commit.data.tree.sha;        });}
Now on Step 3, you need to create Blob objects for each file:

function createFiles(files) {    let promises = [];    let length = filesInfo.length;
    for (let i = 0; i < length; i++) {        promises.push(createFile(files[i]));    }
    return Promise.all(promises);}
function createFile(file) {    return repo.createBlob(file.content)        .then((blob) => {            filesToCommit.push({                sha: blob.data.sha,                path: fileInfo.path,                mode: '100644',                type: 'blob'            });        });}
Two points to note here:

you need to wait for all Blobs to be created — hence the Promise.all expression
the file mode will must be set to 100644 to designate a simple file. GitHub allows other types, but you don’t really need them here.
Step 4 and 5 are about creating a new Tree with files (Blobs) and a Commit with that Tree:

function createTree() {    return repo.createTree(filesToCommit, currentBranch.treeSHA)        .then((tree) => {            newCommit.treeSHA = tree.data.sha;        });}
function createCommit(message) {    return repo.commit(currentBranch.commitSHA, newCommit.treeSHA, message)        .then((commit) => {            newCommit.sha = commit.data.sha;        });}
And the only thing left is Step 6 — update the branch to point to the new Commit:

function updateHead() {    return repo.updateHead(        'heads/' + currentBranch.name,        newCommit.sha    );}
That’s it! Now you can use this beauty to push your files:

let api = new GithubAPI({token: 'API_TOKEN'});api.setRepo('GITHUB_USER', 'REPOSITORY');api.setBranch('AWESOME_BRANCH')    .then( () => api.pushFiles(        'Making a commit with my adorable files',        [            {content: 'You are a Wizard, Harry', path: 'harry.txt'},            {content: 'May the Force be with you', path: 'jedi.txt'}        ])    )    .then(function() {        console.log('Files committed!');    });
You can find the ready-to-use resulting implementation in this Gist.

//What About Binary Files?
//Unfortunately, at the moment of writing this article (January 2017) the library used here internally fails to send binary data to GitHub.

//I’ve created an issue with them to try and resolve the problem. But until it’s settled, we will have to find a workaround for this.

//The predicament lies in the createBlob() function, which should send the content in Base64 format with proper request structure. But instead, the library handles it like a plain string.

//So the temporary workaround I came up with includes forking the library and changing this line to the following:

//if (typeof content === 'object') {    postBody = content;} else {    postBody = this._getContentObject(content);}

//Basically, you would want the library to allow you to specify the proper object yourself.

//Using this tweaked version of the library, you can now push binary files with:

//createBlob({content: base64Content, encoding: 'base64'})
//where the base64Content is generated like this:

let fileReader = new FileReader();fileReader.onload = function(e) {    let content = e.target.result;    //remove the header and leave only the Base64 content itself    base64Content = content.replace(/^(.+,)/, '');}fileReader.readAsDataURL(file);
