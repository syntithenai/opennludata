import JSZip from 'jszip'
import { saveAs } from 'file-saver';

function createZip(zipStructure) {
    var zip = new JSZip();
     
    function recurseZipStructure(zipStructure, path) {
        if (Array.isArray(zipStructure.files)) {
            zipStructure.files.map(function(file) {
                var options = (file.base64 && file.base64.length > 0) ? {base64: true} : {} 
                if (file.name && file.name.length > 0 && file.content) zip.file(path+"/"+file.name,file.content, options);
                return null
            })
        }
        if (Array.isArray(zipStructure.folders)) {
            zipStructure.folders.map(function(folder) {
                if (folder.name && folder.name.length > 0) zip.folder(folder.name);
                if ((folder.files && folder.files.length > 0) || (folder.folders && folder.folders.length > 0)) {
                    recurseZipStructure(folder, folder.name)
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
