// UPLOADING TO AWS S3
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const Upload = require('s3-uploader');

// Instantiate client we'll use to interface w/ AWS S3
const client = new Upload(process.env.S3_BUCKET, {
  aws: {
    path: 'pets/avatar',
    region: process.env.S3_REGION,
    acl: 'public-read',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  cleanup: {
    versions: true,
    original: true
  },
  // upload two version of each image
  versions: [{
    maxWidth: 400,
    aspect: '16:10',
    suffix: '-standard'
  },{
    maxWidth: 300,
    aspect: '1:1',
    suffix: '-square'
  }]
});

// MODELS
const Pet = require('../models/pet');
const { concat } = require('../seeds/pets');

// PET ROUTES
module.exports = (app) => {

  // INDEX PET => index.js

  // NEW PET
  app.get('/pets/new', (req, res) => {
    res.render('pets-new');
  });

  // CREATE PET
  app.post('/pets', upload.single('avatar'), (req, res, next) => {
    var pet = new Pet(req.body);
    pet.save(function (err) {
      if (req.file) {
        // Upload the images
        client.upload(req.file.path, {}, function (err, versions, meta) {
          if (err) { return res.status(400).send({ err: err }) };

          // Pop off the -square and -standard and just use the one URL to grab the image
          versions.forEach(image => {
            var urlArray = image.url.split('-');
            urlArray.pop();
            var url = urlArray.join('-');
            pet.avatarUrl = url;
          });
          pet.save();
          res.send({ pet: pet });
        });
      } else {  // saving w/o an image
        res.send({ pet: pet });
      }
    })
  })

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
    // search based on the name or breed, w/ pagination
    const page = req.query.page || 1
    Pet.paginate(
      {
        $or:[
          {'name': term},
          {'species': term}
        ]
      },
      // render the results
      { page: page }).then((results) => {
        res.render('pets-index', {
          pets: results.docs, 
          pagesCount: results.pages, 
          currentPage: page,
          term: req.query.term
        });
      });
  });

  // PURCHASE
  // PURCHASE
  app.post('/pets/:id/purchase', (req, res) => {
    console.log(req.body);
    // Set the secret key
    var stripe = require("stripe")(process.env.PRIVATE_STRIPE_API_KEY);

    // Get the payment token ID submitted by the checkout form
    const token = req.body.stripeToken; // Using Express

    // req.body.petId can become null through seeding,
    // this way we'll insure we use a non-null value
    let petId = req.body.petId || req.params.id;

    Pet.findById(petId).exec((err, pet)=> {
      // log errors
      if (err) {
        console.log('Error: ' + err);
        res.redirect(`/pets/${req.params.id}`);
      }
      // processing purchase
      const charge = stripe.charges.create({
        amount: pet.price * 100,
        currency: 'usd',
        description: `Purchased ${pet.name}, ${pet.species}`,
        source: token,
      }).then((chg) => {
        res.redirect(`/pets/${req.params.id}`);
      })
      .catch(err => {
        console.log('Error:' + err);
      });
    })
  });
}
