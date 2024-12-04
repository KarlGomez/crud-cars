const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');
const mongoose = require('mongoose');
const createError = require('http-errors');
const {response} = require("express");

// connection to MongoDB Compass
mongoose.connect('mongodb://localhost:27017/coches_db', {

}).catch((error) => console.error('MongoDB connection error:', error));

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

const Marca = require('./models/marca');
const Modelo = require('./models/modelo');

const app = express();


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Other pages
app.get('/aboutMe', (req, res) => {
  res.render('aboutMe');
});

app.get('/contacts', (req, res) => {
  res.render('contacts', { sent: true });
});

app.get('/apiDocs', (req, res) => {
  res.render('apiDocs', { openApiData });
});

// API ///////////////

// Show ALL Marcas
app.get('/api/marcas', async (req, res) => {
  try {
    const marcas = await Marca.find();
    res.status(200).json(marcas);
  } catch (error) {
    console.error(error);
    res.status(500).send('ERROR');
  }
});

// Show ALL Modelos
app.get('/api/modelos', async (req, res) => {
  try {
    const modelos = await Modelo.find();
    res.status(200).json(modelos);
  } catch (error) {
    console.error(error);
    res.status(500).send('ERROR');
  }
});

// Marcas Detail  ----------/api/marcas/:id-----------------
app.get('/api/marcas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const marca = await Marca.findById(id);
    if (!marca) {
      return res.status(404).json({ message: `Marca with ID ${id} not found` });
    }
    res.status(200).json(marca);
  } catch (error) {
    console.error(error);
    res.status(500).send('ERROR');
  }
});

// Modelos Detail  ----------/api/modelos/:id-----------------
app.get('/api/modelos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const modelo = await Modelo.findById(id);
    if (!modelo) {
      return res.status(404).json({ message: `Modelo with ID ${id} not found` });
    }
    res.status(200).json(modelo);
  } catch (error) {
    console.error(error);
    res.status(500).send('ERROR');
  }
});

// Update Marca by ID
app.post('/api/marcas/update', async (req, res) => {
  const { id, nombre, fundadores, fundacion } = req.body;

  try {
    await Marca.findByIdAndUpdate(id, { nombre, fundadores, fundacion });
    res.redirect('/marcas');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating marca');
  }
});

//

// update a SINGLE marca ------------------------

app.post("/marcas/update", async (req, res) => {
  const { id, nombre, fundadores, fundacion } = req.body;

  try {
    const updatedMarca = await Marca.findByIdAndUpdate(
        id,
        {
          nombre,
          fundadores,
          fundacion
        },
        { new: true }
    );

    if (!updatedMarca) {
      return res.status(404).send({ msg: `Error: Marca with ID ${id} not found` });
    }

    res.redirect('/marcas');
  } catch (error) {
    console.error('Error updating Marca:', error);
    res.status(500).send('Error updating Marca');
  }
});



app.get('/marcas/update/:id', async (req, res) => {
  const id = req.params.id;
  console.log('/marcas/update id:', id);

  try {
    const marca = await Marca.findById(id);
    if (!marca) {
      return res.status(404).send({ msg: `Error: Marca with ID ${id} not found` });
    }

    res.status(200).render('update_marca', { title: 'Update Marca', marca });
  } catch (error) {
    console.error('Error retrieving Marca:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Update Modelo by ID
app.post('/api/modelos/update', async (req, res) => {
  const { id, IdMarca, nombre, fabricado, anyo, maxPotencia, numAsientos, image_url } = req.body;

  try {
    await Modelo.findByIdAndUpdate(id, {
      IdMarca,
      nombre,
      fabricado,
      anyo,
      maxPotencia,
      numAsientos,
      image_url,
    });
    res.redirect('/modelos');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating modelo');
  }
});

// update a SINGLE modelo ------------------------

app.post("/modelos/update", async (req, res) => {
  const { id, IdMarca, nombre, fabricado, anyo, maxPotencia, numAsientos, image_url } = req.body;

  try {
    const marcaExtra = await Marca.findById({_id: IdMarca});
    console.log(IdMarca)
    const updatedModelo = await Modelo.findByIdAndUpdate(
        {_id: id}, {
          $set:{
            nombre,
            fabricado,
            anyo,
            maxPotencia,
            numAsientos,
            image_url,
            marca: {
              "_id": IdMarca,
              "nombre": marcaExtra.nombre,
              "fundadores": marcaExtra.fundadores,
              "fundacion": marcaExtra.fundacion
            }
          }
        }
    );

    if (!updatedModelo) {
      return res.status(404).json({ msg: `Error: Modelo with ID ${id} not found` });
    }

    res.redirect('/modelos');
  } catch (error) {
    console.error('Error updating Modelo:', error);
    res.status(500).send('Error updating Modelo');
  }
});
// Update a SINGLE Modelo
app.post("/modelos/update", async (req, res) => {
  const { id, IdMarca, nombre, fabricado, anyo, maxPotencia, numAsientos, image_url } = req.body;

  try {
    const marcaExtra = await Marca.findById(IdMarca);
    console.log(IdMarca);
    const updatedModelo = await Modelo.findByIdAndUpdate(
        id, {
          nombre,
          fabricado,
          anyo,
          maxPotencia,
          numAsientos,
          image_url,
          marca: {
            _id: IdMarca,
            nombre: marcaExtra.nombre,
            fundadores: marcaExtra.fundadores,
            fundacion: marcaExtra.fundacion
          }
        }
    );

    if (!updatedModelo) {
      return res.status(404).json({ msg: `Error: Modelo with ID ${id} not found` });
    }

    res.redirect('/modelos');
  } catch (error) {
    console.error('Error updating Modelo:', error);
    res.status(500).send('Error updating Modelo');
  }
});

//curl -X POST http://localhost:3000/api/modelos/update -H "Content-Type: application/json" -d "{\"id\": 1, \"modelo\": \"NuevoModelo\", \"fabricado\": \"NuevoFabricado\", \"anyo\": \"2000\", \"maxPotencia\": \"10\", \"numAsientos\": \"5\", \"image\": \"asdasdasd\"}"

// UPDATE MODELOS
app.get('/modelos/update/:id', async (req, res) => {
  const id = req.params.id;
  console.log('/modelos/update id:', id);

  try {
    const modelo = await Modelo.findById(id);
    console.log(modelo)
    if (!modelo) {
      return res.status(404).send({ msg: `Error: Modelo with ID ${id} not found` });
    }

    const marcas = await Marca.find();

    res.status(200).render('update_modelo', {
      title: 'Update Modelos',
      modelo,
      marcas,
    });
  } catch (error) {
    console.error('Error retrieving Modelo:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Delete Marca by ID
app.delete('/api/marcas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Marca.findByIdAndDelete(id);
    await Modelo.updateMany({"marca._id" : id}, {
      $set:{
        marca: {
          "_id": "",
          "nombre": "deleting marcas",
          "fundadores": "",
          "fundacion": ""
        }
      }
    })

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('ERROR');
  }
});

// Delete Modelo by ID
app.delete('/api/modelos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Modelo.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('ERROR');
  }
});

// Insert Marca
app.post('/api/marcas', async (req, res) => {
  const { nombre, fundadores, fundacion } = req.body;

  try {
    const newMarca = new Marca({ nombre, fundadores, fundacion });
    await newMarca.save();
    res.status(201).json(newMarca);
  } catch (error) {
    console.error(error);
    res.status(500).send('ERROR');
  }
});

//curl -X POST http://localhost:3000/api/marcas -H "Content-Type: application/json" -d "{\"id\": 1, \"nombre\": \"NuevoNombre\", \"fundadores\": \"NuevoFundadores\", \"fundacion\": \"NuevaFundacion\"}"

// Insert Modelo
app.post('/api/modelos', async (req, res) => {
  const { IdMarca, nombre, fabricado, anyo, maxPotencia, numAsientos, image_url } = req.body;

  try {
    const newModelo = new Modelo({
      IdMarca,
      nombre,
      fabricado,
      anyo,
      maxPotencia,
      numAsientos,
      image_url,
    });
    await newModelo.save();
    res.status(201).json(newModelo);
  } catch (error) {
    console.error(error);
    res.status(500).send('ERROR');
  }
});

//curl -X POST http://localhost:3000/api/modelos -H "Content-Type: application/json" -d "{\"id\": 1, \"modelo\": \"NuevoModelo\", \"fabricado\": \"NuevoFabricado\", \"anyo\": \"2000\" , \"maxPotencia\": \"200\" , \"numAsientos\": \"5\" , \"image_url\": \"asdasd\"}"

// Web Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'WEB DE MARCAS' });
});

// Show ALL MARCAS

app.get('/marcas', async (req, res) => {
  try {
    const marcas = await Marca.find();
    res.render('marcas', {
      title: 'MARCAS',
      marcas,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
});

// Show ALL MODELOS

app.get('/modelos', async (req, res) => {
  try {
    const modelos = await Modelo.find();
    res.render('modelos', {
      title: 'MODELOS',
      modelos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
});

// INSERT ITEM GET: show form ----------- MARCAS------------------

app.get('/marcas/insert', async (req, res) => {
  res.render('insert_marca', { title: 'Insert Marca' });
});

// INSERT ITEM POST: get params and do your mojo!

app.post('/marcas', async (req, res) => {
  const {nombre, fundadores, fundacion } = req.body;

  try {

    const newMarca = new Marca({
      nombre,
      fundadores,
      fundacion
    });

    await newMarca.save();

    res.redirect('/marcas');
  } catch (error) {
    console.error('Error inserting Marca:', error);
    res.status(500).send('Internal Server Error');
  }
});




// INSERT ITEM GET: show form ----------- MODELOS------------------

app.get('/modelos/insert', async (req, res) => {
  try {
    const marcas = await Marca.find();
    res.render('insert_modelo', { title: 'Insert Modelo', marcas });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/modelos', async (req, res) => {
  const { IdMarca, nombre, fabricado, anyo, maxPotencia, numAsientos, image_url } = req.body;

  try {
    const marca = await Marca.findById({_id : IdMarca})
    console.log(marca)
    console.log(IdMarca)

    await Modelo.insertMany({

      nombre,
      fabricado,
      anyo,
      maxPotencia,
      numAsientos,
      image_url,
      marca: {
        "_id": IdMarca,
        "nombre": marca.nombre,
        "fundadores": marca.fundadores,
        "fundacion": marca.fundacion
      }
    });


    res.redirect('/modelos');
  } catch (error) {
    console.error('Error inserting Modelo:', error);
    res.status(500).send('Internal Server Error');
  }

});

// Error Handling
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
