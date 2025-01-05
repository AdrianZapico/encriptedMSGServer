
import jwt from 'jsonwebtoken';
import User from '../Models/User';
import dotenv from 'dotenv';

dotenv.config();



const register = async (req, res) => {
  const { name, email, password, avatar = '' } = req.body; // Definir um valor padrão para avatar
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Usuário já existe' });

    const user = new User({ name, email, password, avatar });
    await user.save();
    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Usuário não encontrado' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Senha incorreta' });

    // Gerar o token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      name: user.name,
      avatar: user.avatar,
    });
    
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
};




export { register, login };
