import React from 'react';
export default function SuggestionComponent({ item, query }) {
  return (
    <span  id={item.id} className={item.name === query ? 'match' : 'no-match'}>
      {item.name}
    </span>
  )
}
