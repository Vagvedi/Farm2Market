import { supabase } from '../config/supabaseClient.js';

export const createCrop = async (req, res) => {
  try {
    const { name, price_per_kg, quantity_kg } = req.body;
    const farmer_id = req.user.id; // 🔥 from JWT

    if (!name || !price_per_kg || !quantity_kg) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const { data, error } = await supabase
      .from('crops')
      .insert([
        {
          name,
          price_per_kg,
          quantity_kg,
          farmer_id,
        },
      ])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
