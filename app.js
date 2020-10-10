const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const Jimp = require('jimp');
const bodyParser=require('body-parser');

// Init app
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

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
          file: `uploads/${req.file.filename}`,
          flag : true
        });
      }
    }
  });
});

app.post('/api/coordinates',(req,res)=>{
Jimp.read(`./public/${req.body[3].file}`)
  .then(image => {
    Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(font => {
        // console.log(data);
        image.print(font,req.body[0].name.x,req.body[0].name.y,{text:req.body[0].value},req.body[0].name.w);
        image.print(font,req.body[1].position.x,req.body[1].position.y,{text:req.body[1].value},req.body[1].position.w);
        image.print(font,req.body[2].project.x,req.body[2].project.y,{text:req.body[2].value},req.body[2].project.w);
      image.write(`./public/final/${req.body[3].file}`);
      console.log("going...............");
    });
    res.json('data recieved');
  })
  .catch(err => {
    console.log(err);
  });
  
})

app.get('/final',(req,res)=>{
  res.render('final');
})

app.get('/hello',(req,res)=>{
  res.render('hello');
})

const port = 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));