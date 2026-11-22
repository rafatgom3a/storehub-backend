import ContactMessage from '../models/ContactMessage.js';

export async function createContactMessage(req, res, next) {
  try {
    const { name, email, message } = req.body;
    if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string' || !name.trim() || !email.trim() || !message.trim()) {
      return res.status(400).json({ message: 'Name, email and message are required' });
    }
    if (name.trim().length < 2 || name.trim().length > 80) return res.status(400).json({ message: 'Name must be between 2 and 80 characters.' });
    if (email.trim().length > 254 || !/^\S+@\S+\.\S+$/.test(email.trim())) return res.status(400).json({ message: 'Please provide a valid email' });
    if (message.trim().length < 10 || message.trim().length > 2000) return res.status(400).json({ message: 'Message must be between 10 and 2000 characters.' });
    const saved = await ContactMessage.create({ name: name.trim(), email: email.trim().toLowerCase(), message: message.trim() });
    res.status(201).json({ message: 'Your message has been received', id: saved._id });
  } catch (error) { next(error); }
}
