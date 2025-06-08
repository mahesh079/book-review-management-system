const Book = require('../models/Book');
const Review = require('../models/Review');

// Add book
exports.addBook = async (req, res) => {
    try {
        const book = new Book(req.body);
        await book.save();
        res.json(book);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all books
exports.getBooks = async (req, res) => {
    const { author, genre, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (author) filter.author = new RegExp(author, 'i');
    if (genre) filter.genre = new RegExp(genre, 'i');

    const books = await Book.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit));
    res.json(books);
};

// Book details + reviews + average rating
exports.getBookById = async (req, res) => {
    const book = await Book.findById(req.params.id);
    const reviews = await Review.find({ book: book._id }).populate('user', 'username');
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);
    res.json({ book, avgRating, reviews });
};

// Add review
exports.addReview = async (req, res) => {
    console.log("Adding review for book ID:", req.params.id, req.body);

    const { rating, comment } = req.body;
    const existing = await Review.findOne({ book: req.params.id, user: req.user._id });
    if (existing) return res.status(400).json({ error: "You already reviewed this book" });

    const review = new Review({ book: req.params.id, user: req.user._id, rating, comment });
    await review.save();
    res.json(review);
};

// Update review
exports.updateReview = async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (review.user.toString() !== req.user._id.toString()) return res.status(403).json({ error: "Unauthorized" });

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    await review.save();
    res.json(review);
};

// Delete review
exports.deleteReview = async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (review.user.toString() !== req.user._id.toString()) return res.status(403).json({ error: "Unauthorized" });

    await review.deleteOne();
    res.json({ message: "Review deleted" });
};

// Search
exports.search = async (req, res) => {
    const { q } = req.query;
    const books = await Book.find({
        $or: [
            { title: new RegExp(q, 'i') },
            { author: new RegExp(q, 'i') }
        ]
    });
    res.json(books);
};
