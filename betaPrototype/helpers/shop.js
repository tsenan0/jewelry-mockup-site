window.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('filter-form');
    //pulls id
    // grabs container, may change name later 
    const productsContainer = document.querySelector('.products-container');
    //waits for submit
    form.addEventListener('submit', function(event) {
        // no empty sumbit
        event.preventDefault();

        const formData = new FormData(form);
        //takes form data
        //turns into the query/filter
        const queryString = new URLSearchParams(formData).toString();

        // gets a fetch to retireve 
        fetch(`/Shop?${queryString}`)
            .then(response => response.json()) // json parse
            .then(data => {
                if(data.error) {
                    // if err , display in products container
                    productsContainer.innerHTML = `<p>${data.error}</p>`;
                } else {
                    //goes thru each product to filter
                    let htmlString = '';
                    data.forEach(product => {
                        htmlString += `
                            <div class="product">
                                <h2>${product.name}</h2>
                                <p>Type: ${product.type}</p>
                                <p>Material: ${product.material}</p>
                                <p>Gemstone: ${product.gemstone}</p>
                                <p>Description: ${product.description}</p>
                                <p>Price: ${product.price}</p>
                            </div>
                        `;
                    });
                    // Inserts the HTML string into the products container.
                    productsContainer.innerHTML = htmlString;
                }
            })
            // If there's an error in the fetch request, logs it to the console.
            .catch(error => console.error('error:', error));
    });
});