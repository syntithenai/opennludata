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

const main = async () => {
  const owner = 'syntithenai'
  const repo = 'opennludata_data'
  const base = 'master'
  const head = 'master'
  const changes = {
    files: {
      'README.md': 'Update from octokit' //Buffer.from('Content from octokit.').toString('base64')
    },
    commit: 'Update from octokit'
  }
  return await push({ owner, repo, base, head, changes })
}

main().then(result => {
  console.log(result)
}).catch(err => {
  console.error(err)
})
