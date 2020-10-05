import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import routes from './routes';
import models, { connectDb } from './models';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cors());

app.use(async (req, res, next) => {
    req.context = {
        models,
    };
    next();
});

app.use('/poll', routes.poll);

connectDb().then(async () => { 
    app.listen(process.env.PORT, ()=> 
        console.log(`Listening on port ${process.env.PORT}`), 
    );
});





