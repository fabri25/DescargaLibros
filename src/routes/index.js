const {Router} = require('express');
const {db} = require('../firebase');
const router = Router();


router.get('/', (req, res) => {
    res.render('index');
});

router.get('/home', (req, res) => {
    res.render('home');
});

router.get('/book', (req, res) => {
    res.render('book');
});

router.post('/book', async (req, res) =>{
    //console.log(req.body);
    const {titulo,autor,genero} = req.body;
    db.collection('books').add({
        titulo,
        autor,
        genero
    })
    
    //res.send('enviado');
    res.redirect('/catalog');
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