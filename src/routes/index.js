const {Router} = require('express');
const {db} = require('../firebase');
const router = Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage()});
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucketName = 'descargalibros1';
const bucket = storage.bucket(bucketName);
  

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/home', (req, res) => {
    res.render('home');
});

router.get('/book', (req, res) => {
    res.render('book');
});

router.post('/book', upload.single('pdf'), async (req, res) => {
    const { titulo, autor, genero } = req.body;
    const pdf = req.file; // El archivo PDF subido

    if (!pdf) {
        return res.status(400).send('No se subió ningún archivo PDF.');
    }

    const blob = bucket.file(pdf.originalname);
    const blobStream = blob.createWriteStream({
        metadata: {
            contentType: pdf.mimetype,
        },
    });

    blobStream.on('error', (err) => res.status(500).send(err));

    blobStream.on('finish', () => {
        blob.makePublic().then(() => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

            db.collection('books').add({
                titulo,
                autor,
                genero,
                pdfUrl: publicUrl
            })
            .then(() => res.redirect('/catalog'))
            .catch((error) => res.status(500).send(error.message));
        }).catch((error) => res.status(500).send(error.message));
    });

    blobStream.end(pdf.buffer);
});

router.get('/catalog', async (req, res) => {
    const QuerySnapshot = await db.collection('books').get()

    const books = QuerySnapshot.docs.map(doc =>({
        id: doc.id,
        ...doc.data()
    }))
    console.log(books);
    //res.render('./views/index');
    //res.send('Hello');
    res.render('catalog', {books});
});

router.get('/deleteBook/:id', async (req,res) => {
    const QuerySnapshot = await db.collection('books').doc(req.params.id).delete();


   res.redirect('/catalog');
    
})



router.get('/users', async (req,res) => {
    const QuerySnapshot = await db.collection('users').get()

    const users = QuerySnapshot.docs.map(doc =>({
        id: doc.id,
        ...doc.data()
    }))
    console.log(users);
    //res.render('./views/index');
    res.send('Hello');
})



module.exports = router;