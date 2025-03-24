// ProtectedApp.tsx
import { useState } from "react";
import App from "../App";

const PASSWORD = import.meta.env.VITE_PASSWORD;

export default function ProtectedApp() {
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PASSWORD) {
      setAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  };

  if (authenticated) {
    return <App />;
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-2xl">Enter Password</h1>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="p-2 rounded text-black"
        />
        <button type="submit" className="bg-blue-500 px-4 py-2 rounded">
          Enter
        </button>
      </form>
    </div>
  );
}
