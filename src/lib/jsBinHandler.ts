const BIN_ID = "67e099cd8960c979a5771cd1"; // Save this after first POST
const API_KEY = "$2a$10$j4/FP8wQ3hf4rdUbg77SL.N.s1nDjdqUXaG3fW2RxYEN/J/tjRWyu";

const getPortfolioFromJsonBin = async () => {
  const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
    headers: {
      "X-Master-Key": API_KEY,
    },
  });

  const result = await res.json();
  return result.record;
};

const savePortfolioToJsonBin = async (data: any) => {
  const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  return result.record;
};

export { getPortfolioFromJsonBin, savePortfolioToJsonBin };
