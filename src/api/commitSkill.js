var fs = require('fs');
const {Octokit} = require('@octokit/rest')

let _octokit = null

const octokit = () => {
  if (_octokit === null) {
    _octokit = new Octokit({
      auth: process.env.GITHUB_API_TOKEN
    })
  }
  return _octokit
}

async function push ({ owner, repo, base, head, changes }) {
  let response

  if (!base) {
    response = await octokit().repos.get({ owner, repo })
    // tslint:disable-next-line:no-parameter-reassignment
    base = response.data.default_branch
  }

  response = await octokit().repos.listCommits({
    owner,
    repo,
    sha: base,
    per_page: 1
  })
  let latestCommitSha = response.data[0].sha
  const treeSha = response.data[0].commit.tree.sha

  response = await octokit().git.createTree({
    owner,
    repo,
    base_tree: treeSha,
    tree: Object.keys(changes.files).map(path => {
      // shut up the compiler...
      const mode = "100644" //: "100644" | "100755" | "040000" | "160000" | "120000" 
      return {
        path,
        mode,
        content: changes.files[path]
      }
    })
  })
  const newTreeSha = response.data.sha

  response = await octokit().git.createCommit({
    owner,
    repo,
    message: changes.commit,
    tree: newTreeSha,
    parents: [latestCommitSha]
  })
  latestCommitSha = response.data.sha

  // HttpError: Reference does not exist
  return await octokit().git.updateRef({
    owner,
    repo,
    sha: latestCommitSha,
    ref: `heads/${head}`,
    force: true
  })

  // HttpError: Reference already exists
  // return await octokit().git.createRef({
  //   owner,
  //   repo,
  //   sha: latestCommitSha,
  //   ref: `refs/heads/${head}`
  // })
}
  //Buffer.from('Content from octokit.').toString('base64')
    
async function commitSkill(skill) {
    return new Promise(function(resolve,reject) {
      console.log(['COMMIT SKILL',skill])
      if (skill.title && skill.id) {
          const owner = process.env.github_data_owner ? process.env.github_data_owner : ''
          const repo = process.env.github_data_repo ? process.env.github_data_repo : ''
          const base = process.env.github_data_base ? process.env.github_data_base : ''
          const head = process.env.github_data_head ? process.env.github_data_head : ''
          const fileContent = JSON.stringify(skill)
          const filePath = (process.env.github_data_filePath ? process.env.github_data_filePath : 'docs/static/media/skills/') +(skill.userAvatar ?  skill.userAvatar + '-'  : '') + skill.title + '-' + skill.id +".json"
          //const devFilePath = process.env.github_data_devFilePath ?  +((skill.userAvatar ?  skill.userAvatar + '-'  : '') + skill.title + '-' + skill.id +".json" ): ''
          // try to load index
          const indexPath = (process.env.github_data_filePath ? process.env.github_data_filePath : 'public/skills/') + 'index.js'
          const changes = {
            files: {},
            commit: 'Skill published '+skill.title+(' (' + skill.id+')')+(skill.userAvatar ? ' by ' + skill.userAvatar : '')
          }
          fs.readFile(indexPath, 'utf8', function(err, contents) {
              var skillIndex = {}
              if (contents) {
                  try {
                      var skillIndex = JSON.parse(contents)
                  } catch (e) {
                     // first time no file    
                  }
              }
              skillIndex = typeof skillIndex === "object" ? skillIndex : {}
              skillIndex[skill.id] = {title: skill.title, userAvatar: skill.userAvatar, updated_date: skill.updated_date, created_date: skill.created_date, tags: skill.tags}
              
              changes.files[indexPath] = JSON.stringify(skillIndex)        
              changes.files[filePath] = fileContent  
              console.log(['COMMIT SKILL push',changes, owner, repo, base, head])
              push({ owner, repo, base, head, changes }).then(function() {
                resolve()
              })      
          })
          
          
          
        
    } else {
      console.log(['COMMIT SKILL missing data in skill'])
      resolve()
    }
  })
}


module.exports=commitSkill
