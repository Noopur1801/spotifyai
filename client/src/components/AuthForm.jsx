import React, { useState } from 'react';

const AuthForm = ({ onAuthSuccess }) => {
   const [isLogin, setIsLogin] = useState(true);
   const [formData, setFormData] = useState({ username: '', email: '', password: '' });
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);

   const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/signup';
      const payload = isLogin
         ? { email: formData.email, password: formData.password }
         : formData;

      try {
         const response = await fetch(`http://localhost:5000${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.message || 'Authentication failed');
         }

         localStorage.setItem('token', data.token);
         localStorage.setItem('user', JSON.stringify({ id: data._id, username: data.username, role: data.role }));

         if (onAuthSuccess) onAuthSuccess(data);
      } catch (err) {
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 overflow-hidden">
         {/* Background Image Layer */}
         <div
            className="absolute inset-0 bg-cover bg-center filter brightness-50"
            style={{
               backgroundImage: `url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1920&q=80')`
            }}
         />

         {/* Dark overlay for contrast */}
         <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

         {/* Floating Glassmorphism Login Card */}
         <div className="relative z-10 w-full max-w-md mx-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl text-white">
            <h2 className="text-3xl font-bold mb-6 text-center tracking-wide text-white">
               {isLogin ? 'Login' : 'Create Account'}
            </h2>

            {error && (
               <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-sm mb-4 text-center">
                  {error}
               </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
               {!isLogin && (
                  <div>
                     <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1 font-medium">Username</label>
                     <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required={!isLogin}
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                        placeholder="DJ_Nova"
                     />
                  </div>
               )}

               <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1 font-medium">Email</label>
                  <input
                     type="email"
                     name="email"
                     value={formData.email}
                     onChange={handleChange}
                     required
                     className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                     placeholder="dj@example.com"
                  />
               </div>

               <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1 font-medium">Password</label>
                  <input
                     type="password"
                     name="password"
                     value={formData.password}
                     onChange={handleChange}
                     required
                     className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                     placeholder="••••••••"
                  />
               </div>

               <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg cursor-pointer disabled:opacity-50"
               >
                  {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
               </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-300">
               {isLogin ? "Don't have an account? " : "Already have an account? "}
               <button
                  onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  className="text-indigo-300 hover:text-white font-semibold underline ml-1 focus:outline-none cursor-pointer"
               >
                  {isLogin ? 'Register' : 'Login'}
               </button>
            </div>
         </div>
      </div>
   );
};

export default AuthForm;