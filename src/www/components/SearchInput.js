import React from 'react'
const SearchInput = function({searchFilter,setSearchFilter}) {
    return (<input style={{marginLeft:'0.5em'}}  type='text' value={searchFilter} 
            onChange={
                function(e) {
                    const filter = e.target.value
                    setSearchFilter(filter); 
                }
            } placeholder='Search' />)
}
    
export default SearchInput
