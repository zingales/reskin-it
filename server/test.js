module.exports = (req, res) => {
  res.json({ 
    message: 'JS test endpoint working!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  })
}
