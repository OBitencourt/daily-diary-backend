import Entry from '../models/Entry.js';

const normalizeDate = (dateStr) => {
  const date = new Date(dateStr);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

export const createEntry = async (req, res) => {
  try {
    req.body.user = req.user.id;
    req.body.date = normalizeDate(req.body.date || new Date());

    const entry = await Entry.create(req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Já existe uma entrada para esta data' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getEntries = async (req, res) => {
  try {
    let query = { user: req.user.id };

    if (req.query.month && req.query.year) {
      const month = parseInt(req.query.month) - 1;
      const year = parseInt(req.query.year);
      const startDate = new Date(Date.UTC(year, month, 1));
      const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (req.query.mood) {
      query.mood = req.query.mood;
    }

    if (req.query.tags) {
      const tags = req.query.tags.split(',');
      query.tags = { $all: tags };
    }

    const entries = await Entry.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, count: entries.length, data: entries });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const searchEntries = async (req, res) => {
  try {
    const { q } = req.query;
    const entries = await Entry.find({
      user: req.user.id,
      text: { $regex: q, $options: 'i' }
    }).sort({ date: -1 });

    res.status(200).json({ success: true, count: entries.length, data: entries });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const moodStats = await Entry.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const monthlyStats = await Entry.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: { month: { $month: '$date' }, year: { $year: '$date' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        mostFrequentMood: moodStats.length > 0 ? moodStats[0]._id : null,
        monthlyEntries: monthlyStats
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getEntry = async (req, res) => {
  try {
    const entry = await Entry.findOne({ _id: req.params.id, user: req.user.id });
    if (!entry) return res.status(404).json({ success: false, error: 'Entrada não encontrada' });
    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateEntry = async (req, res) => {
  try {
    let entry = await Entry.findOne({ _id: req.params.id, user: req.user.id });
    if (!entry) return res.status(404).json({ success: false, error: 'Entrada não encontrada' });

    if (req.body.date) req.body.date = normalizeDate(req.body.date);

    entry = await Entry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findOne({ _id: req.params.id, user: req.user.id });
    if (!entry) return res.status(404).json({ success: false, error: 'Entrada não encontrada' });

    await entry.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
