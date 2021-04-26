const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

const dir = 'dist'

app.use(express.static(dir))

app.get('/lecture/:id', (_, res) =>
{
	res.sendFile(path.join(__dirname + `/${dir}/lectureRate/index.html`));
});

app.get('*', function(_, res){
	res.sendFile(path.join(__dirname + `/${dir}/404/index.html`), 404);
});

app.listen(port, () =>
{
	console.log(`App from ${dir} directory is opened at http://localhost:${port}`);
});
