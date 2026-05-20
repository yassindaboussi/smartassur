const News = require('../models/News');

const getNews = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'Actualité non trouvée' });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createNews = async (req, res) => {
  try {
    const { title, content } = req.body;
    const image = req.file ? req.file.filename : '';
    const news = await News.create({ title, content, image });
    res.status(201).json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateNews = async (req, res) => {
  try {
    const { title, content } = req.body;
    const update = { title, content };
    if (req.file) update.image = req.file.filename;
    const news = await News.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!news) return res.status(404).json({ message: 'Actualité non trouvée' });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteNews = async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ message: 'Actualité supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getNews, getNewsById, createNews, updateNews, deleteNews };
