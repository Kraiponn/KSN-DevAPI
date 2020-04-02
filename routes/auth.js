const express = require('express');
const {
  getMe, 
  getUsers,
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword
} = require('../controllers/auth');


const router = express.Router();

const { protect, isAuthorize } = require('../middleware/auth');

router.post('/register', register);

router.post('/login', login);

router.get('/logout', logout);

router.get('/', getUsers);

router.get('/me', protect, isAuthorize('publisher', 'admin'), getMe);

router.put('/updatedetails', protect, updateDetails);

router.put('/updatepassword', protect, updatePassword);

router.post('/forgotpassword', forgotPassword);

router.put('/resetpassword/:resetToken', resetPassword);


module.exports = router;