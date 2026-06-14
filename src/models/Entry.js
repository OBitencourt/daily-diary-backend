import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Por favor, adicione uma data']
  },
  text: {
    type: String,
    required: [true, 'Por favor, adicione o conteúdo da entrada']
  },
  mood: {
    type: String,
    required: [true, 'Por favor, registe o seu humor'], 
    enum: {
      values: ['radiante', 'feliz', 'neutro', 'triste', 'pessimo'],
      message: '{VALUE} não é um humor válido. Escolha entre: radiante, feliz, neutro, triste ou pessimo.'
    }
  },
  tags: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Garantir que um utilizador não pode ter duas entradas na mesma data
entrySchema.index({ user: 1, date: 1 }, { unique: true });

const Entry = mongoose.model('Entry', entrySchema);
export default Entry;
