// MODELS
const Pet = require('../models/pet');

// PET ROUTES
module.exports = (app) => {

  // INDEX PET => index.js

  // NEW PET
  app.get('/pets/new', (req, res) => {
    res.render('pets-new');
  });

  // CREATE PET
  app.post('/pets', (req, res) => {
    var pet = new Pet(req.body);
    // if the pet is added OK, then redirect to see its specific details
    pet.save()
      .then((pet) => {
        res.redirect(`/pets/${pet._id}`);
      })
      .catch((err) => {
        // Handle Errors
      }) ;
  });

  // SHOW PET
  app.get('/pets/:id', (req, res) => {
    Pet.findById(req.params.id).exec((err, pet) => {
      res.render('pets-show', { pet: pet });
    });
  });

  // EDIT PET - first, show the form w/ current pet data populating it
  app.get('/pets/:id/edit', (req, res) => {
    Pet.findById(req.params.id).exec((err, pet) => {
      res.render('pets-edit', { pet: pet });
    });
  });

  // UPDATE PET - after the user wants to update the pet (override as a POST method)
  app.put('/pets/:id', (req, res) => {
    Pet.findByIdAndUpdate(req.params.id, req.body)
      .then((pet) => {
        res.redirect(`/pets/${pet._id}`) // redirect to the detail view
      })
      .catch((err) => {
        // Handle Errors
      });
  });

  // DELETE PET - clicks the "delete" btn
  app.delete('/pets/:id', (req, res) => {
    Pet.findByIdAndRemove(req.params.id).exec((err, pet) => {
      return res.redirect('/')
    });
  });

  // SEARCH PET
  app.get('/search', (req, res) => {
    // init search pattern
    const term = new RegExp(req.query.term, 'i')
    // search based on the namme or breed
    Pet.find({$or:[
      {'name': term},
      {'species': term}
    ]}).exec((err, pets) => {
      res.render('pets-index', { pets: pets });
    })
  });
}
