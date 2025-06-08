const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
    addBook,
    getBooks,
    getBookById,
    addReview,
    updateReview,
    deleteReview,
    search
} = require('../controllers/bookController');

router.get('/books', getBooks);
router.get('/books/:id', getBookById);
router.get('/search', search);

router.post('/add/books', auth, addBook);
router.post('/books/:id/reviews', auth, addReview);
router.put('/reviews/:id', auth, updateReview);
router.delete('/reviews/:id', auth, deleteReview);

module.exports = router;
