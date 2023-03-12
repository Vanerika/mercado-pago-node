const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// SDK de Mercado Pago
const mercadopago = require("mercadopago");

//middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Agrega credenciales
mercadopago.configure({
    access_token: "APP_USR-7963719642388925-022601-7a106cfb723ca0e2a780eee2a583dd96-1318338908",
});

//routes
app.post('/checkout', (req, res) => {
    // Crea un objeto de preferencia
    let preference = {
        items: [
            {
                title: req.body.title,
                unit_price: parseInt(req.body.price),
                quantity: 1,
            },
        ],
        back_urls: {
            "success": "http://localhost:3000/feedback?order_id=" + req.body.id,
            "failure": "http://localhost:3000/feedback",
            "pending": "http://localhost:3000/feedback"
        },
        auto_return: "approved",
    };

    mercadopago.preferences
        .create(preference)
        .then(function (response) {
            res.redirect(response.body.init_point);
        })
        .catch(function (error) {
            console.log(error);
        });
});

app.get('/feedback', function (req, res) {
    const status = req.query.status;
    let mensaje;

    switch (status) {
        case "approved":
            mensaje = "Pago aprobado";
            //Agrega una llamada a la API para enviar una petición PUT al servidor deseado
            const axios = require('axios');
            axios.put('http://localhost:5000/pagos/status/' + req.query.order_id, {
                data: {
                    payment_id: req.query.payment_id,
                    status: status
                }
            }).then((response) => {
                console.log(response.data);
            }).catch((error) => {
                console.log(error);
            });

            break;
        case "pending":
            mensaje = "Pago pendiente";
            break;
        case "failure":
            mensaje = "Pago rechazado";
            break;
        default:
            mensaje = "Estado desconocido";
            break;
    }

    // Redirige al usuario a la página original
    res.redirect("http://pas-frontend.test/admin/pagos.html");

    // Muestra una ventana emergente con el estado
    const script = `
        <script>
            alert("${mensaje}");
        </script>
    `;

    res.send(script);
});

//server
app.listen(3000, () => {
    console.log("server on port 3000");
});