require('dotenv').config();

const app = require('./src/app');

const port = process.env.PORT || 5009;

app.listen(port, () => {
  console.log(`Jall API running on port ${port}`);
});
