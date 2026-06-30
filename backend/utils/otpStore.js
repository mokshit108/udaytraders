// /utils/otpStore.js

const otpStore = new Map();

const setOtp = (email, otp) => {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP valid for 10 minutes
  otpStore.set(email, { otp, expiresAt });
};

const getOtp = (email) => {
  return otpStore.get(email);
};

const deleteOtp = (email) => {
  otpStore.delete(email);
};

module.exports = { setOtp, getOtp, deleteOtp };
