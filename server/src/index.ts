import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import { deleteNoteHandler } from './delete';

dotenv.config();
const logger = pino();

const app = express();
app.use(cors());
app.use(express.json());

const limiter = rateLimit({ windowMs: 1000 * 60, max: 60 });
app.use(limiter);

app.post('/delete-note', async (req, res) => {
  try {
    await deleteNoteHandler(req, res, logger);
  } catch (err: any) {
    logger.error(err, 'Unhandled error in /delete-note');
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => logger.info(`Server listening on ${port}`));

