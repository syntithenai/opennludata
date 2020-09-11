

var balanced = require('balanced-match');




function generateObjectId() {
    var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
}
   
function parentUrl(url) {
    return url.split("/").slice(0,-1).join("/") 
}

function concatText(text,words) {
   let parts = text.split(' ')
   let shorter = parts.slice(0,20).join(' ')
   return (shorter.length < text.length) ? shorter + '...' : shorter;
}



    
    function findFirstDiffPos(a, b) {
      if (a === b) return -1;
      for (var i=0; a[i] === b[i]; i++) {}
      return i;
    }
    
    function multiplyArrays(a,b) {
        var results=[]
        a.map(function(aval) {
              b.map(function(bval) {
                  results.push(aval + bval)
              })
        })
        return results
    }

    function uniquifyArray(a) {
        //console.log(['UNIQARRAY',a])
        if (Array.isArray(a)) {
            var index = {}
            a.map(function(value) {
                index[value] = true 
                return null
            })
            return Object.keys(index)
        } else {
            return []
        }
    }

    function uniquifyArrayOfObjects(a,field) {
         if (Array.isArray(a)) {
             var index = {}
            var emptyIndex = null
            a.map(function(value) {
                if (value) {
                    if (value[field]) {
                        index[value[field]] = value 
                    } else {
                        emptyIndex = value
                    }
                }
                return null
            })
            if (emptyIndex) return [emptyIndex].concat(Object.values(index))
            else return Object.values(index)
        } else {
            return []
        }
    }
    
    // recursively expand sentence containing options eg (the|an(y|)|my) into an array of expanded sentences
    function expandOptions(text) {
        var options = []
        var b = balanced('(',')',text)
        if (b && b.body) {
            var innerOptions = null
            var ib = balanced('(',')',b.body)
            if (ib) {
                innerOptions = expandOptions(b.body)
            } else {
                innerOptions = b.body.split("|")
            }
            innerOptions = uniquifyArray(innerOptions)
            var sentences = uniquifyArray(multiplyArrays(multiplyArrays([b.pre],innerOptions),[b.post]))
            sentences.map(function(sentence) {
               options=[].concat(options,expandOptions(sentence))  
            })
        } else {
            options = text.split("|")
        }
        return uniquifyArray(options)
    }
    
    function replaceEntities(example,entities) {
        // replace entity values with {entityName}
        // first sort entities by start key
        entities = entities.sort(function(a,b) {
          if (a.start < b.start) return -1
          else return 1  
        })
        var offset = 0
        var newExample = example
        entities.map(function(entity) {
            newExample = newExample.slice(0,entity.start + offset)+"{"+entity.type+"}"+newExample.slice(entity.end + offset)
            var diff = (entity.end - entity.start) - (entity.type.length + 2)
            offset -= diff
            return null
        })
        return newExample
    }
    
    function replaceEntitiesWithValues(example,entities) {
        // replace entity values with {entityName}
        // first sort entities by start key
        if (example && Array.isArray(entities)) {
                entities = entities.sort(function(a,b) {
              if (a.start < b.start) return -1
              else return 1  
            })
            var offset = 0
            var newExample = example
            entities.map(function(entity) {
                var replacement = "["+entity.value+"]("+entity.type+")"
                newExample = newExample.slice(0,entity.start + offset)+replacement+newExample.slice(entity.end + offset)
                var diff = (entity.end - entity.start) - (replacement.length)
                offset -= diff
                return null
            })
            return newExample
        } else {
            return example
        }
    }
    /**
     *  create array by splitting on newline and fullstop
     */
    function splitSentences(text) {
      var final = []
      if (text) {
          // split by newline and full stop
         var splits = text.split('\n').join('::::').split('.').join('::::').split('::::') //.map(function(value) { return value.trim()})
        // trim all splits
        for (var splitText in splits) {
            if(splitText.trim().length > 0) final.push(splits[splitText])
        }
     }
     return final;
    }
 
function sortExampleSplits(a,b) {
    if (a.example < b.example) return -1 ;else return 1;
} 
   
function generateIntentSplits(text, intent) {
    const splits = splitSentences(text)

     function extractEntities(text) {
        var entities=[]
        var latestText = text
        var b = balanced('{','}',latestText)
        var limit = 20
        while (b && limit) {
            var entity = { value:b.body, start: b.start, end: b.end, type:b.body }
            entities.push(entity)
            latestText = b.pre + b.body + b.post
            b = balanced('{','}',latestText)
            limit --
        }
        return {'id':generateObjectId(), example: latestText, entities: entities, tags: []}
    }
        
    var newSplits=[]
    splits.map(function(text,i) {
        if (text && text.trim().length > 0) {
           expandOptions(text).map(function(line) {
                var intentGen = extractEntities(line)
                intentGen.intent = intent;
                newSplits.push(intentGen)
            }) 
           //newSplits.push({'id':generateObjectId(), 'example':text,'intent':intent ? intent : '',"entities":[], "tags":[]})
        }
        return null
    })
    return newSplits.sort(sortExampleSplits)
}

console.log(JSON.stringify(generateIntentSplits('he was a (boy|man) (named|called|going by) {name}','desc')))


////import Octokit from '@octokit/rest'
////import glob from 'globby' 
////import path from 'path'
////import { readFile } from 'fs-extra'
//const { Octokit } = require("@octokit/rest")
//var glob = require('globby' )
//var path = require( 'path')
//var { readFile } = require('fs-extra')
//const main = async () => {
  //// There are other ways to authenticate, check https://developer.github.com/v3/#authentication
  //const octo = new Octokit({
    //auth: process.env.GITHUB_API_TOKEN
  //})
  //// For this, I was working on a organization repos, but it works for common repos also (replace org for owner)
  //const commitMessage = "My commit message"
  //const commitFolder = "./testdata" 
  //const ORGANIZATION = "syntithenai"
  //const REPO = "opennludata_data"
  //try {
          
      //const repos = await octo.repos.listForOrg({
        //org: ORGANIZATION
      //})
  //} catch (e) {console.log(e)}
  ////if (!repos.data.map((repo) => repo.name).includes(REPO)) {
    ////await createRepo(octo, ORGANIZATION, REPO)
  ////}
  ///**
   //* my-local-folder has files on its root, and subdirectories with files
   //*/
  ////await uploadToRepo(octo, commitFolder, ORGANIZATION, REPO)
//}

//main()

//const createRepo = async (octo, org, name) => {
  //await octo.repos.createInOrg({ org, name, auto_init: true })
//}

//const uploadToRepo = async (
  //octo,
  //coursePath,
  //org,
  //repo,
  //branch = `master`
//) => {
  //// gets commit's AND its tree's SHA
  //const currentCommit = await getCurrentCommit(octo, org, repo, branch)
  //const filesPaths = await glob(coursePath)
  //const filesBlobs = await Promise.all(filesPaths.map(createBlobForFile(octo, org, repo)))
  //const pathsForBlobs = filesPaths.map(fullPath => path.relative(coursePath, fullPath))
  //const newTree = await createNewTree(
    //octo,
    //org,
    //repo,
    //filesBlobs,
    //pathsForBlobs,
    //currentCommit.treeSha
  //)
  
  //const newCommit = await createNewCommit(
    //octo,
    //org,
    //repo,
    //commitMessage,
    //newTree.sha,
    //currentCommit.commitSha
  //)
  //await setBranchToCommit(octo, org, repo, branch, newCommit.sha)
//}


//const getCurrentCommit = async (
  //octo,
  //org,
  //repo,
  //branch = 'master'
//) => {
  //const { data: refData } = await octo.git.getRef({
    //owner: org,
    //repo,
    //ref: `heads/${branch}`,
  //})
  //const commitSha = refData.object.sha
  //const { data: commitData } = await octo.git.getCommit({
    //owner: org,
    //repo,
    //commit_sha: commitSha,
  //})
  //return {
    //commitSha,
    //treeSha: commitData.tree.sha,
  //}
//}

//// Notice that readFile's utf8 is typed differently from Github's utf-8
//const getFileAsUTF8 = (filePath) => readFile(filePath, 'utf8')

//const createBlobForFile = (octo, org, repo) => async (
  //filePath
//) => {
  //const content = await getFileAsUTF8(filePath)
  //const blobData = await octo.git.createBlob({
    //owner: org,
    //repo,
    //content,
    //encoding: 'utf-8',
  //})
  //return blobData.data
//}

//const createNewTree = async (
  //octo,
  //owner,
  //repo,
  //blobs,
  //paths,
  //parentTreeSha
//) => {
  //// My custom config. Could be taken as parameters
  //const tree = blobs.map(({ sha }, index) => ({
    //path: paths[index],
    //mode: `100644`,
    //type: `blob`,
    //sha
  //})) //as Octokit.GitCreateTreeParamsTree[]
  //const { data } = await octo.git.createTree({
    //owner,
    //repo,
    //tree,
    //base_tree: parentTreeSha,
  //})
  //return data
//}

//const createNewCommit = async (
  //octo,
  //org,
  //repo,
  //message,
  //currentTreeSha,
  //currentCommitSha
//) =>
  //(await octo.git.createCommit({
    //owner: org,
    //repo,
    //message,
    //tree: currentTreeSha,
    //parents: [currentCommitSha],
  //})).data

//const setBranchToCommit = (
  //octo,
  //org,
  //repo,
  //branch = `master`,
  //commitSha
//) =>
  //octo.git.updateRef({
    //owner: org,
    //repo,
    //ref: `heads/${branch}`,
    //sha: commitSha,
  //})


////const fs = require("fs");
////const { gitCommitPush } = require("./api/git-commit-push-via-github-api");
////process.on("unhandledRejection", console.dir);
////if (!process.env.GITHUB_API_TOKEN) {
    ////throw new Error("GITHUB_API_TOKEN=xxx node example.js");
////}
////gitCommitPush({
    ////// commit to https://github.com/azu/commit-to-github-test
    ////owner: "syntithenai",
    ////repo: "opennludata_data",
    ////// commit files
    ////files: [
        ////{ path: "README2.md", content: 'hello world' },  //fs.readFileSync(__dirname + "/README.md", "utf-8")
        //////{ path: "dir/input.txt", content: fs.readFileSync(__dirname + "/dir/input.txt", "utf-8") },
        //////// Pass binary as Buffer
        //////{ path: "next-item.mp3", content: fs.readFileSync(__dirname + "/next-item.mp3") },
        //////{ path: "image.png", content: fs.readFileSync(__dirname + "/image.png") }
    ////],
    ////fullyQualifiedRef: "heads/master",
    ////forceUpdate: false, // optional default = false
    ////commitMessage: "HELLO"
////})
    ////.then(res => {
        ////console.log("success", res);
    ////})
    ////.catch(err => {
        ////console.error(err);
    ////});


