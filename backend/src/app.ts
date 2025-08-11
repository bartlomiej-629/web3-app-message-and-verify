import express from 'express';
import cors from 'cors';
import signatureRouter from './routes/signature';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/verify-signature', signatureRouter);

export default app;
