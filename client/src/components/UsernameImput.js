function UsernameInput({ onUsernameSet }) {
	const [tempUsername, setTempUsername] = useState('');

	const handleUsernameSubmit = (e) => {
	  e.preventDefault();
	  if (tempUsername.trim()) {
		onUsernameSet(tempUsername);
		localStorage.setItem('username', tempUsername);
	  }
	};

	return (
	  <div className="flex items-center justify-center min-h-screen bg-gray-800">
		<form onSubmit={handleUsernameSubmit} className="bg-gray-900 p-6 rounded shadow-md">
		  <label htmlFor="username" className="text-white block mb-2">Introduce tu nombre de usuario:</label>
		  <input
			id="username"
			type="text"
			value={tempUsername}
			onChange={(e) => setTempUsername(e.target.value)}
			className="text-black mb-4 p-2 w-full"
			required
		  />
		  <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full">
			Ingresar al Chat
		  </button>
		</form>
	  </div>
	);
  }
  