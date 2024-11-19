const parseString = (codeString) => {
  const regex = /const\s+(\w+)\s*=\s*["'](.*?)["'];/g;
  const matches = [];
  
  let match;
  while ((match = regex.exec(codeString)) !== null) {
    const [fullLine, variable, text] = match;
    matches.push({ column1: variable, column2: text, column3: fullLine });
  }
  
  return matches;
};

// Endpoint to create CSV
router.post("/create-csv", async (req, res) => {
  const { codes } = req.body;  // Expecting a single string in req.body.codes
  if (typeof codes !== "string" || codes.trim() === "") {
    return res.status(400).json({ error: "Invalid input, provide a valid string of code." });
  }

  const parsedData = parseString(codes);

  // Manually create CSV content with '|' delimiter
  const headers = ['\"Error Code\"', '\"Error Messsage\"', '\"Generated Message\"'];
  const rows = parsedData.map(item => `\"${item.column1}"|"${item.column2}"|"${item.column3}\"`);

  const csvContent = [headers.join('|'), ...rows].join('\n');

  // Write to CSV file
  try {
    const outputPath = 'output.csv';
    fs.writeFileSync(outputPath, csvContent);  // Write CSV content to file
    res.download(outputPath); // Send CSV file for download
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating CSV file." });
  }
});