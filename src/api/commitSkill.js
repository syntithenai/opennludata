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
    
async function commitSkill(skill, deleteSkill) {
    return new Promise(function(resolve,reject) {
      //console.log(['COMMIT SKILL',skill])
      if (skill && (skill.id || skill._id)) {
          const owner = process.env.github_data_owner ? process.env.github_data_owner : ''
          const repo = process.env.github_data_repo ? process.env.github_data_repo : ''
          const base = process.env.github_data_base ? process.env.github_data_base : ''
          const head = process.env.github_data_head ? process.env.github_data_head : ''
          const fileContent = JSON.stringify(skill)
          const skillFileName = (skill.userAvatar ?  skill.userAvatar + '-'  : '') + skill.title + '-' + skill.id +".json"
          const folderPath = (process.env.github_data_filePath ? process.env.github_data_filePath : 'docs/static/media/skills/')
          const filePath = folderPath + skillFileName
          const skillDemoFile = folderPath + (skill.userAvatar ?  skill.userAvatar + '-'  : '') + skill.title +".html"
          //const devFilePath = process.env.github_data_devFilePath ?  +((skill.userAvatar ?  skill.userAvatar + '-'  : '') + skill.title + '-' + skill.id +".json" ): ''
          // try to load index
          const indexPath = (process.env.github_data_filePath ? process.env.github_data_filePath : 'public/skills/') + 'index.js'
          const templateFile = (process.env.github_data_filePath ? process.env.github_data_filePath : 'public/skills/') + 'chat_template.html'
          
          const changes = {
            files: {},
            commit: 'Published skill '+skill.title+(' (' + skill.id+')')+(skill.userAvatar ? ' by ' + skill.userAvatar : '')
          }
          if (deleteSkill) changes.commit = 'Unpublished skill ' + skill.id
          fs.readFile(templateFile, 'utf8', function(err, skillTemplate) {
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
                  
                  skillIndex[skill.id] = {
                      id: skill.id, 
                      _id: skill._id, 
                      title: skill.title, 
                      userAvatar: skill.userAvatar, 
                      updated_date: skill.updated_date, 
                      created_date: skill.created_date, 
                      tags: skill.tags, 
                      entities: skill.entities ? Object.keys(skill.entities).length : 0, 
                      intents: skill.intents ? Object.keys(skill.intents).length : 0, 
                      utterances: skill.utterances ? Object.keys(skill.utterances).length : 0, 
                      regexps: skill.regexps ? skill.regexps.length : 0,
                      forms: skill.forms ? skill.forms.length : 0,
                      actions: skill.actions ? Object.keys(skill.actions).length : 0,
                      apis: skill.apis ? Object.keys(skill.apis).length : 0, 
                      rules: skill.rules ? Object.keys(skill.rules).length: 0, 
                      stories: skill.stories ? Object.keys(skill.stories).length: 0,  
                      file:skillFileName, 
                      user: skill.user
                  }
                  
                  if (deleteSkill && skill._id && skillIndex[skill.id] && skillIndex[skill.id]._id === skill._id) {
                       skillIndex[skill.id].deleted = true;
                  } 
                  
                  var notDeleted = {}
                  Object.values(skillIndex).filter(function(skill) {if (!skill.deleted) return true; else return false }).map(function(iskill) {
                      notDeleted[iskill.id] = iskill
                      return null
                  });
                  changes.files[indexPath] = JSON.stringify(notDeleted)  
                  changes.files[skillDemoFile] = skillTemplate.replace("%%%INSERT_SKILL_HERE%%%","window.skill="+fileContent)  
                  changes.files[filePath] = fileContent  
                  console.log(['COMMIT SKILL push',skillIndex, owner, repo, base, head])
                  push({ owner, repo, base, head, changes }).then(function() {
                    resolve()
                  })      
              })
        })
          
          
          
        
    } else {
      //console.log(['COMMIT SKILL missing data in skill'])
      resolve()
    }
  })
}


module.exports=commitSkill
