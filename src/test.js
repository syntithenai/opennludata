//import Octokit from '@octokit/rest'
//import glob from 'globby' 
//import path from 'path'
//import { readFile } from 'fs-extra'
const { Octokit } = require("@octokit/rest")
var glob = require('globby' )
var path = require( 'path')
var { readFile } = require('fs-extra')
const main = async () => {
  // There are other ways to authenticate, check https://developer.github.com/v3/#authentication
  const octo = new Octokit({
    auth: process.env.GITHUB_API_TOKEN
  })
  // For this, I was working on a organization repos, but it works for common repos also (replace org for owner)
  const commitMessage = "My commit message"
  const commitFolder = "./testdata" 
  const ORGANIZATION = "syntithenai"
  const REPO = "opennludata_data"
  try {
          
      const repos = await octo.repos.listForOrg({
        org: ORGANIZATION
      })
  } catch (e) {console.log(e)}
  //if (!repos.data.map((repo) => repo.name).includes(REPO)) {
    //await createRepo(octo, ORGANIZATION, REPO)
  //}
  /**
   * my-local-folder has files on its root, and subdirectories with files
   */
  //await uploadToRepo(octo, commitFolder, ORGANIZATION, REPO)
}

main()

const createRepo = async (octo, org, name) => {
  await octo.repos.createInOrg({ org, name, auto_init: true })
}

const uploadToRepo = async (
  octo,
  coursePath,
  org,
  repo,
  branch = `master`
) => {
  // gets commit's AND its tree's SHA
  const currentCommit = await getCurrentCommit(octo, org, repo, branch)
  const filesPaths = await glob(coursePath)
  const filesBlobs = await Promise.all(filesPaths.map(createBlobForFile(octo, org, repo)))
  const pathsForBlobs = filesPaths.map(fullPath => path.relative(coursePath, fullPath))
  const newTree = await createNewTree(
    octo,
    org,
    repo,
    filesBlobs,
    pathsForBlobs,
    currentCommit.treeSha
  )
  
  const newCommit = await createNewCommit(
    octo,
    org,
    repo,
    commitMessage,
    newTree.sha,
    currentCommit.commitSha
  )
  await setBranchToCommit(octo, org, repo, branch, newCommit.sha)
}


const getCurrentCommit = async (
  octo,
  org,
  repo,
  branch = 'master'
) => {
  const { data: refData } = await octo.git.getRef({
    owner: org,
    repo,
    ref: `heads/${branch}`,
  })
  const commitSha = refData.object.sha
  const { data: commitData } = await octo.git.getCommit({
    owner: org,
    repo,
    commit_sha: commitSha,
  })
  return {
    commitSha,
    treeSha: commitData.tree.sha,
  }
}

// Notice that readFile's utf8 is typed differently from Github's utf-8
const getFileAsUTF8 = (filePath) => readFile(filePath, 'utf8')

const createBlobForFile = (octo, org, repo) => async (
  filePath
) => {
  const content = await getFileAsUTF8(filePath)
  const blobData = await octo.git.createBlob({
    owner: org,
    repo,
    content,
    encoding: 'utf-8',
  })
  return blobData.data
}

const createNewTree = async (
  octo,
  owner,
  repo,
  blobs,
  paths,
  parentTreeSha
) => {
  // My custom config. Could be taken as parameters
  const tree = blobs.map(({ sha }, index) => ({
    path: paths[index],
    mode: `100644`,
    type: `blob`,
    sha
  })) //as Octokit.GitCreateTreeParamsTree[]
  const { data } = await octo.git.createTree({
    owner,
    repo,
    tree,
    base_tree: parentTreeSha,
  })
  return data
}

const createNewCommit = async (
  octo,
  org,
  repo,
  message,
  currentTreeSha,
  currentCommitSha
) =>
  (await octo.git.createCommit({
    owner: org,
    repo,
    message,
    tree: currentTreeSha,
    parents: [currentCommitSha],
  })).data

const setBranchToCommit = (
  octo,
  org,
  repo,
  branch = `master`,
  commitSha
) =>
  octo.git.updateRef({
    owner: org,
    repo,
    ref: `heads/${branch}`,
    sha: commitSha,
  })


//const fs = require("fs");
//const { gitCommitPush } = require("./api/git-commit-push-via-github-api");
//process.on("unhandledRejection", console.dir);
//if (!process.env.GITHUB_API_TOKEN) {
    //throw new Error("GITHUB_API_TOKEN=xxx node example.js");
//}
//gitCommitPush({
    //// commit to https://github.com/azu/commit-to-github-test
    //owner: "syntithenai",
    //repo: "opennludata_data",
    //// commit files
    //files: [
        //{ path: "README2.md", content: 'hello world' },  //fs.readFileSync(__dirname + "/README.md", "utf-8")
        ////{ path: "dir/input.txt", content: fs.readFileSync(__dirname + "/dir/input.txt", "utf-8") },
        ////// Pass binary as Buffer
        ////{ path: "next-item.mp3", content: fs.readFileSync(__dirname + "/next-item.mp3") },
        ////{ path: "image.png", content: fs.readFileSync(__dirname + "/image.png") }
    //],
    //fullyQualifiedRef: "heads/master",
    //forceUpdate: false, // optional default = false
    //commitMessage: "HELLO"
//})
    //.then(res => {
        //console.log("success", res);
    //})
    //.catch(err => {
        //console.error(err);
    //});


