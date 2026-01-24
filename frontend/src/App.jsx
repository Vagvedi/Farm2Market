import { useState } from 'react';
import { supabase } from './supabaseClient';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  const signUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) alert(error.message);
    else setUser(data.user);
  };

  const signIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else setUser(data.user);
  };

  if (user) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Welcome Farmer 👨‍🌾</h2>
        <p>User ID: {user.id}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Farm2Market Login</h2>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />
      <button onClick={signUp}>Sign Up</button>
      <button onClick={signIn} style={{ marginLeft: 10 }}>
        Login
      </button>
    </div>
  );
}

export default App;
