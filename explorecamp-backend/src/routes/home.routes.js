import express from 'express';
const router = express.Router();

router.get('/home', (req, res) => {
    res.json({ msg: 'This is the home route!' });
});
export default router;