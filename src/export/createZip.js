import JSZip from 'jszip'

function createZip(zipStructure) {
    var zip = new JSZip();
     console.log(['ZIP',zipStructure])
    function recurseZipStructure(zipStructure, path) {
        if (Array.isArray(zipStructure.files)) {
            zipStructure.files.map(function(file) {
                console.log(['ZIP file',file])
                var options = (file.base64 && file.base64.length > 0) ? {base64: true} : {} 
                if (file.name && file.name.length > 0 && file.content) zip.file(path+"/"+file.name,file.content, options);
                return null
            })
        }
        if (Array.isArray(zipStructure.folders)) {
            zipStructure.folders.map(function(folder) {
                console.log(['ZIP folder',folder])
                if (folder.name && folder.name.length > 0) zip.folder(folder.name);
                if ((folder.files && folder.files.length > 0) || (folder.folders && folder.folders.length > 0)) {
                    recurseZipStructure(folder, path+"/"+folder.name)
                }
                return null
            })
        }
         
    } 
     
    recurseZipStructure(zipStructure,'')
     
    return new Promise(function(resolve,reject) {
        zip.generateAsync({type:"blob"}).then(function(content) {
            resolve(content)
        })
    })
}

export {createZip}
