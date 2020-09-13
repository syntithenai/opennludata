const mongoose = require('mongoose')

const skillsSchema = new mongoose.Schema({
  id: { type: String , required: true}, 
  title: { type: String, required: true },
  created_date: { type: Number}, 
  updated_date: { type: Number}, 
  // store the minimum in the hosted database
  invocation: { type: String},
  user: { type: String , required: true}, 
  userAvatar: { type: String , required: true}, 
  intents: { type: {}},
  entities: { type: {}},
  entitiesData: { type: {}},
  utterancesData: { type: {}},
  utterances: { type: {}},
  utterancesLists: { type: []},
  regexps: { type: {}},
  slots: { type: {}},
  tags: { type: []},
  rasa: { type: {}},
  jovo: { type: {}},
  mycroft: { type: {}},
})
//skillsSchema.index({title: "text", invocation: "text", tags: "text"});
//skillsSchema.on('index', function(error) {
    //console.log('finished index');
    //console.log(error.message);
  //});
  
const skillTagsSchema = new mongoose.Schema({
  tag: { type: String, required: true , unique: true}
})
  
const entitiesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  items: { type: [String] , required: true},
  owner: { type: {}}, 
  created_date: { type: Number}, 
  updated_date: { type: Number} 
})
const utterancesSchema = new mongoose.Schema({
  value: { type: String, required: true },
  synonyms: { type: String, required: true },
  tags: { type: [String] , required: true},
  owner: { type: {}}, 
  created_date: { type: Number}, 
  updated_date: { type: Number} 
})
const regexpsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  items: { type: [String] , required: true},
  tags: { type: [String] , required: true},
  owner: { type: {}}, 
  created_date: { type: Number}, 
  updated_date: { type: Number}
})
const grabsSchema = new mongoose.Schema({
  key: { type: String, required: true },
  users: { type: {} , required: true},
})

module.exports = {skillsSchema, skillTagsSchema, entitiesSchema, utterancesSchema, regexpsSchema, grabsSchema}
