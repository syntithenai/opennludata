export default function useRestEndpoint(axiosClient,restUrl=process.env.REACT_APP_restBaseUrl) {
   
    // to  endpoint root
    function doPost(modelType,data) {
        console.log(['POST', modelType, data, restUrl])  
        return new Promise(function(resolve,reject) {
            if (modelType && data) {
                axiosClient.post(restUrl+modelType,
                  data,
                  {
                    headers: {
                        'Content-Type': 'application/json'
                      },
                  }
                ).then(function(res) {
                  console.log(res)  
                  resolve(res)
                }).catch(function(res) {
                  console.log(res)  
                  reject(res)
                })
            } else {
                console.log('Missing post params')
                reject('Missing post params')
            }
        })
    }
    
    // to  endpoint with id
    function doPut(modelType,data) {
        console.log('PUT')  
        return new Promise(function(resolve,reject) {
            if (modelType && data && data._id) {
                axiosClient.put(restUrl+modelType+"/"+data._id,
                  data,
                  {
                    headers: {
                        'Content-Type': 'application/json'
                      },
                  }
                ).then(function(res) {
                  console.log(res)  
                  resolve(res)
                }).catch(function(res) {
                  console.log(res)  
                  reject(res)
                })
            } else {
                console.log('Missing post params')
                reject('Missing post params')
            }
        })
    }
    
    function doGet(modelType,id) {
        return new Promise(function(resolve,reject) {
            if (id) {
                axiosClient.get(restUrl+modelType+"/"+id,
                  {
                   
                  },
                  {
                    headers: {
                        'Content-Type': 'application/json'
                      },
                  }
                ).then(function(res) {
                  console.log(['GET',res])  
                  resolve(res)
                }).catch(function(res) {
                  console.log(res)  
                  reject(res)
                })
            } else {
                reject("GET request missing id")
            }
        })
    }
    
    function doGetMany(modelType,filter, limit=20, skip=0, sort='', populate=null) {
        return new Promise(function(resolve,reject) {
            var queryParts=[
                'query='+encodeURIComponent(JSON.stringify(filter)),
                'limit='+limit,
                'skip='+skip,
                
            ]
            if (populate) queryParts.push('populate='+encodeURIComponent(JSON.stringify(populate)))
            if (sort) queryParts.push('sort='+encodeURIComponent(JSON.stringify(sort)))
            axiosClient.get(restUrl+modelType+'?'+queryParts.join("&"),
              {
               
              },
              {
                headers: {
                    'Content-Type': 'application/json'
                  },
              }
            ).then(function(res) {
              console.log(['GET many',res])  
              resolve(res)
            }).catch(function(res) {
              console.log(res)  
              reject(res)
            })
        })
    }
    
    // to  endpoint with id
    function doDelete(modelType,id) {
        return new Promise(function(resolve,reject) {
            if (id) {
                return axiosClient.delete(restUrl+modelType+"/"+id,
                  {
                  },
                  {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                  }
                ).then(function(res) {
                  console.log(['DEL',res])  
                  resolve(res)
                }).catch(function(res) {
                  console.log(res)  
                  reject(res)
                })
            } else {
                 console.log(['DEL request missing id'])  
                 reject('DELETE request missing id')
            }
        })
    }
    // to  endpoint with id
    function doPatch(modelType, data) {
        console.log('patch')  
        return new Promise(function(resolve,reject) {
            if (modelType && data && data._id) {
                axiosClient.patch(restUrl+modelType+"/"+data._id,
                  data,
                  {
                    headers: {
                        'Content-Type': 'application/json'
                      },
                  }
                ).then(function(res) {
                      console.log(['update',res])  
                      resolve(res)
                }).catch(function(res) {
                  console.log(res)  
                  reject(res)
                })
            } else {
                console.log('Missing post params')
                reject('Missing post params')
            }
        })
    }
    
    // EXPOSED METHODS
    
    function saveItem(modelType, data, patch=true) {
        return new Promise(function(resolve, reject) {
            if (modelType) {
                if (data._id && data._id.trim && data._id.trim())  {
                    if (patch) {
                        doPatch(modelType,data).then(function(res) {
                          resolve(res)  
                        })
                    } else {
                        doPut(modelType,data).then(function(res) {
                          resolve(res)  
                        })
                    }
                } else {
                    delete data._id 
                    doPost(modelType,data).then(function(res) {
                      resolve(res)  
                    })
                }
            }
        })
    }
    
    function deleteItem(modelType, id) {
        return new Promise(function(resolve, reject) {
            if (modelType && id) {
                doDelete(modelType,id).then(function(res) {
                  resolve(res)  
                })
            }
        })
    }
    
    function getItem(modelType,id) {
        return new Promise(function(resolve, reject) {
            if (modelType && id) {
                doGet(modelType,id).then(function(res) {
                  resolve(res)  
                })
            }
        })
    }
    
    function searchItems(modelType,query,limit,skip) {
        return new Promise(function(resolve, reject) {
            if (modelType) {
                doGetMany(modelType,query,limit,skip).then(function(res) {
                  resolve(res)  
                })
            }
        })
    }
    
    
    return {saveItem, deleteItem, getItem, searchItems}
    
}
