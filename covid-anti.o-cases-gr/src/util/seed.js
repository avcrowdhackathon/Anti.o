var Contact = require('../graphql/types/contact/contact.model.js');
var _ = require('lodash');


console.log('Seeding the DB...');
console.log('To Disable seeding, set false the option seed in config/config file ');

var contact = {
  name : 'Dataverse',
  email: 'info@dataverse.gr'
};



var cleanDB = function() {
  console.log('cleaning the DB... ');
  //map is like foreach
  var cleanPromises = [Contact]
    .map(function(model) {
      return model.remove().exec();
    });
  return Promise.all(cleanPromises);
}

var createExperiments = function() {

  var promises = experiments.map(function(experiment) {
    Experiment(experiment).save(function(err) {
      if (err) throw err;
    });
  });
  return Promise.all(promises)
  .then(function() {
    console.log('experiments loaded in database');
  });
}

var createUsers = function() {

  var promises = users.map(function(user) {
    User(user).save(function(err) {
      if (err) throw err;
    });
  });
  return Promise.all(promises)
  .then(function() {
    console.log('users loadded to database');
  });
}

cleanDB()
.then(function(){
  console.log('Database Seeded');
});
  // .then(createUsers)
  // .then(createExperiments);
