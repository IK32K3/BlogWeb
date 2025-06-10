const app = require("./index");
const port = 3000;
require('events').EventEmitter.defaultMaxListeners = 15;

app.listen(port, () => {
    console.log(`Running on http://localhost:${port}`);
});