let carrito = {}; // Variable para almacenar los productos en el carrito

const validateForm = () => {
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const contacto = document.getElementById("contacto").value;
    const pedido = document.getElementById("pedido").value;
    const razon = document.getElementById("razon").value;
    const imagen = document.getElementById("imagen").value;

    let hasError = false;

    const showError = (id, message) => {
        document.getElementById(id).innerHTML = message;
        hasError = true;
    };

    const clearError = (id) => {
        document.getElementById(id).innerHTML = "";
    };

    if (nombre === "") {
        showError("nombreError", "Por favor, ingresa tu nombre");
    } else {
        clearError("nombreError");
    }

    if (apellido === "") {
        showError("apellidoError", "Por favor, ingresa tu apellido");
    } else {
        clearError("apellidoError");
    }

    if (contacto === "") {
        showError("contactoError", "Por favor, ingresa tu número de contacto");
    } else if (!/^\d+$/.test(contacto)) { // Validación de números usando expresión regular
        showError("contactoError", "Por favor, ingresa solo números");
    } else {
        clearError("contactoError");
    }

    if (pedido === "") {
        showError("pedidoError", "Por favor, ingresa tu número de pedido");
    } else if (!/^\d+$/.test(pedido)) { // Validación de números usando expresión regular
        showError("pedidoError", "Por favor, ingresa solo números");
    } else {
        clearError("pedidoError");
    }

    if (razon === "") {
        showError("razonError", "Por favor, ingresa la razón de tu devolución");
    } else {
        clearError("razonError");
    }

    if (imagen === "") {
        showError("imagenError", "Por favor, adjunta una imagen");
    } else {
        clearError("imagenError");
    }

    return !hasError;
};

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'));
        pintarCarrito();
    }
});

const fetchData = async () => {
    try {
        const res = await fetch('productos.json');
        const data = await res.json();
        pintarCard(data);
    } catch (error) {
        console.log(error);
    }
};

const pintarCard = data => {
    const cardsContainer = document.getElementById('cards');
    const templateCard = document.getElementById('template-card');

    data.forEach(item => {
        const clone = templateCard.content.cloneNode(true);
        clone.querySelector('.card-img-top').src = item.thumbnailUrl;
        clone.querySelector('h5').textContent = item.title;
        clone.querySelector('p').textContent = `$ ${item.precio}`;
        clone.querySelector('.form-select').addEventListener('change', () => {
            item.talla = clone.querySelector('.form-select').value;
        });
        clone.querySelector('.btn-dark').addEventListener('click', () => {
            setCarrito(item);
        });
        cardsContainer.appendChild(clone);
    });
};

const setCarrito = item => {
    const producto = {
        title: item.title,
        precio: item.precio,
        id: item.id,
        talla: item.talla || "Selecciona una talla",
        cantidad: 1
    };

    if (carrito.hasOwnProperty(producto.id)) {
        producto.cantidad = carrito[producto.id].cantidad + 1;
    }

    carrito[producto.id] = { ...producto };
    pintarCarrito();
};

const pintarCarrito = () => {
    const itemsContainer = document.getElementById('items');
    const templateCarrito = document.getElementById('template-carrito');
    const templateFooter = document.getElementById('template-footer');
    const footer = document.getElementById('footer');
    let fragment = document.createDocumentFragment();

    itemsContainer.innerHTML = '';

    Object.values(carrito).forEach(producto => {
        const clone = templateCarrito.content.cloneNode(true);
        clone.querySelector('th').textContent = producto.id;
        clone.querySelectorAll('td')[0].textContent = producto.title;
        clone.querySelectorAll('td')[1].textContent = producto.talla;
        clone.querySelectorAll('td')[2].textContent = producto.cantidad;
        clone.querySelector('.btn-info').dataset.id = producto.id;
        clone.querySelector('.btn-danger').dataset.id = producto.id;
        clone.querySelector('span').textContent = producto.cantidad * producto.precio;
        fragment.appendChild(clone);
    });

    itemsContainer.appendChild(fragment);

    pintarFooter();
};

const pintarFooter = () => {
    const footer = document.getElementById('footer');
    const templateFooter = document.getElementById('template-footer');
    let fragment = document.createDocumentFragment();

    footer.innerHTML = '';

    if (Object.keys(carrito).length === 0) {
        const clone = templateFooter.content.cloneNode(true);
        clone.querySelector('th').setAttribute('colspan', '6');
        clone.querySelector('th').textContent = 'Carrito vacío - comience a comprar!';
        fragment.appendChild(clone);
        footer.appendChild(fragment);
        return;
    }

    const nCantidad = Object.values(carrito).reduce((acc, { cantidad }) => acc + cantidad, 0);
    const nPrecio = Object.values(carrito).reduce((acc, { cantidad, precio }) => acc + cantidad * precio, 0);

    const clone = templateFooter.content.cloneNode(true);
    clone.querySelector('th').textContent = 'Total productos';
    clone.querySelectorAll('td')[0].textContent = nCantidad;
    clone.querySelector('span').textContent = nPrecio;
    fragment.appendChild(clone);

    footer.appendChild(fragment);

    const btnVaciar = document.getElementById('vaciar-carrito');
    btnVaciar.addEventListener('click', () => {
        carrito = {};
        pintarCarrito();
    });
};

const btnAccion = e => {
    if (e.target.classList.contains('btn-info')) {
        const producto = carrito[e.target.dataset.id];
        producto.cantidad++;
        carrito[e.target.dataset.id] = { ...producto };
        pintarCarrito();
    }

    if (e.target.classList.contains('btn-danger')) {
        const producto = carrito[e.target.dataset.id];
        producto.cantidad--;
        if (producto.cantidad === 0) {
            delete carrito[e.target.dataset.id];
        }
        pintarCarrito();
    }

    e.stopPropagation();
};

const pagarBtn = document.getElementById('pagar');
if (pagarBtn) {
    pagarBtn.addEventListener('click', () => {
        const carritoArray = Object.values(carrito);
        localStorage.setItem('carrito', JSON.stringify(carritoArray)); // Guardar el carrito como array en el localStorage
        // Redirigir a la página de pagar.html
        window.location.href = 'pagar.html';
    });
}
