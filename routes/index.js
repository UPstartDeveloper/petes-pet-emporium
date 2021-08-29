const Pet = require('../models/pet');

module.exports = (app) => {

  /* GET home page. Lists all Pets, w/ pagination */
  app.get('/', (req, res) => {
    const page = req.query.page || 1

    Pet.paginate({}, {page: page}).then((results) => {
      // to show the pets on the page, use the `.docs` param
      res.render('pets-index', { 
        pets: results.docs, 
        pagesCount: results.pages, 
        currentPage: page 
      });   
    });
  });
}
