
const db = require('./database.js');

async function updateEntry(uid,name){
  let value = await db.get("cache",{});
  if(value === null){
    value = {};
  }
  if(!uid.startsWith('id')){
    uid = 'id'+uid;
  }
  if(value[uid] != name.toLowerCase()){
    value[uid] = name.toLowerCase();
    await db.set("cache",value);
  }
}

async function removeEntry(uid){
  let value = await db.get("cache",{});
  if(value === null){
    value = {};
  }
  if(!uid.startsWith('id')){
    uid = 'id'+uid;
  }
  delete value[uid];
  if(value && Object.keys(value).length !== 0){
    await db.set("cache",value);
  }
  else{
    await db.delete("cache");
  }
}

async function getName(uid){
  let value = await db.get("cache");
  if(!`${uid}`.startsWith('id')){
    uid = 'id'+uid;
  }
  return value[uid];
}

async function getUID(name){
  let value = await db.get("cache");
  let uid = null;
	name = name.toLowerCase();
	Object.keys(value).forEach(function (key) {
		if(value[key] == name){
			uid = key.substr(2);
		}
	});
	return uid;
}

module.exports = {
  update:updateEntry,
  remove:removeEntry,
  name:getName,
  uid:getUID
}