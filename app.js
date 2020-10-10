// const express = require('express');
// var Jimp = require('jimp');
// const app = express();

// Jimp.read('1.jpeg')
//   .then(image => {
//     Jimp.loadFont(Jimp.FONT_SANS_32_WHITE).then(font => {
//       let x=image.getWidth()/2;
//       let y=10;
//       console.log(x,y);
//       image.print(font,0,10,{text:'Shubham Trivedi',alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER},image.getWidth());
//       image.print(font,0,50,{text:'Winner',alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER},image.getWidth());
//       image.print(font,0,90,{text:'Fuddu Detector',alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER},image.getWidth());
//       image.write('ddqa.jpg');
//     });
//   })
//   .catch(err => {
//     console.log(err);
//   });


// app.listen(4000, () => {
//   console.log('server is starting at 4000');
// })

const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('myImage');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

// Init app
const app = express();

// EJS
app.set('view engine', 'ejs');

// Public Folder
app.use(express.static('./public'));

app.get('/', (req, res) => res.render('index'));

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if(err){
      res.render('index', {
        msg: err
      });
    } else {
      if(req.file == undefined){
        res.render('index', {
          msg: 'Error: No File Selected!'
        });
      } else {
        res.render('index', {
          msg: 'File Uploaded!',
          file: `uploads/${req.file.filename}`
        });
      }
    }
  });
});

const port = 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));