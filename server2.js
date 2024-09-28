import {createServer} from 'http';

const PORT = process.env.PORT;

const users = [
    {id: 1, name: 'John', email: 'john@example.com', password: '1234561'},
    {id: 2, name: 'John2', email: 'john2@example.com', password: '1234562'},
    {id: 3, name: 'John3', email: 'john3@example.com', password: '1234563'},
];

const logger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
}
const jsonMiddleware = (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
}

const getUsersHandler = (req, res) => {
    res.write(JSON.stringify(users));
    res.end();
}

const getUserByIdHandler = (req, res) => {
    const id = req.url.split('/')[3];
    const user = users.find((user) => user.id === parseInt(id));
    if (user) {
        res.write(JSON.stringify(user));
        res.end();
    } else {
        res.statusCode = 404;
        res.write(JSON.stringify({message: "User not found"}));
    }
    res.end();
}

const createUserHandler = (req, res) => {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const newUser = JSON.parse(body);
        users.push(newUser);
        res.statusCode = 201;
        res.write(JSON.stringify(newUser));
        res.end();
    })
}

const notFoundHandler = (req, res) => {
    res.statusCode = 404;
    res.write(JSON.stringify({message: "Route not found"}));
    res.end();
}


const server = createServer((req, res) => {
    logger(req, res, () => {
        jsonMiddleware(req, res, () => {
            if (req.url === '/api/users' && req.method === 'GET') {
                getUsersHandler(req, res);
            } else if (req.url.match(/\/api\/users\/([0-9]+)/) && req.method === 'GET') {
                getUserByIdHandler(req, res);
            } else if(req.url === '/api/users' && req.method === 'POST') {
                createUserHandler(req, res);
            }
            else {
                notFoundHandler(req, res);
            }
        });
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})

