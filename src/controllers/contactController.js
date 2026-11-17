import ContactMessage from '../models/ContactMessage.js';

export async function createContactMessage(req, res, next) {
  try {
    const { name, email, message } = req.body;
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Name, email and message are required' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Please provide a valid email' });
    const saved = await ContactMessage.create({ name, email, message });
    res.status(201).json({ message: 'Your message has been received', id: saved._id });
  } catch (error) { next(error); }
}
