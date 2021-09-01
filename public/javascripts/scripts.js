// POST form data for adding a new pet 
if (document.querySelector('#new-pet')) {
    document.querySelector('#new-pet').addEventListener('submit', (e) => {
        e.preventDefault();
        // get the form data
        let pet = {};
        const inputs = document.querySelectorAll('.form-control');
        for (const input of inputs) {
            pet[input.name] = input.value;
        }
        // send a request (w/ the data as JSON) to the server
        axios.post('/pets', pet)
            .then(function (response) {
                window.location.replace(`/pets/${response.data.pet._id}`);
            })
            .catch(function (error) {
                console.log(error);
            });
    });
}