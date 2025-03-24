// const getPortfolioFromJsonBin = async () => {
//   const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
//     headers: {
//       "X-Master-Key": API_KEY,
//     },
//   });

//   const result = await res.json();
//   return result.record;
// };

// const savePortfolioToJsonBin = async (data: any) => {
//   const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//       "X-Master-Key": API_KEY,
//     },
//     body: JSON.stringify(data),
//   });

//   const result = await res.json();
//   return result.record;
// };

// export { getPortfolioFromJsonBin, savePortfolioToJsonBin };
