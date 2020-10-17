const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const Jimp = require('jimp');
const bodyParser = require('body-parser');
const csv = require('csvtojson');
const { createDecipher } = require('crypto');

// Init app
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).array('myImage', 2);

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|csv|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}


// EJS
app.set('view engine', 'ejs');

// Public Folder
app.use(express.static('./public'));

app.get('/', (req, res) => res.render('index'));

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.render('index', {
        msg: err
      });
    }
    else {
      if (req.files == undefined) {
        res.render('index', {
          msg: 'Error: No File Selected!'
        });
      } else {
        res.render('edit', {
          file: `uploads/${req.files[1].filename}`,
          csv: `uploads/${req.files[0].filename}`,
        });
      }
    }
  });
});

app.post('/api/coordinates', (req, res) => {
  csv().fromFile(`./public/${req.body['3'].csv}`).then((data) => {
    const name= req.body['3'].file.split('.').slice(0,-1).join('.');
    let count=0;
    data.forEach((cred,i) => {
      Jimp.read(`./public/${req.body[3].file}`)
        .then(image => {
          Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(font => {
            // console.log(req.body);
            count++;
            image.print(font, req.body['0'].x, req.body['0'].y + 10, { text: cred.Name }, req.body[0].w);
            image.print(font, req.body['1'].x, req.body['1'].y + 10, { text: cred.Position }, req.body[1].w);
            image.print(font, req.body[2].x, req.body[2].y + 10, { text: cred.project }, req.body[2].w);
            image.write(`./public/final/${name}/${i}.png`);
          });
        })
    })
    res.status(200).json({
      file : name,
      len : count
    });
  })
  .catch(err => {
    console.log(err);
  });

})

app.get('/final', (req, res) => {
  res.render('final');
})

app.get('/hello', (req, res) => {
  res.render('hello');
})

const port = 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));