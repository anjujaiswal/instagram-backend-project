const userType = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

const userStatus = {
  BLOCK: 'block',
  // UNBLOCK: 'unblock'
  ACTIVE: 'active',
  INACTIVE: 'inActive',
  // DELETE: 'delete',
  PENDING: 'pending'
};

const errorMsg = {
  EXPIRED: 'jwt expired',
  INVALID: 'invalid signature'
};

const statusType = {
  ACTIVE: 'active',
  INACTIVE: 'inActive',
  DELETE: 'delete',
  PENDING: 'pending'
};
const TokenType = {
  LOGIN: 'login',
  FORGET: 'forget',
  RESET: 'reset'
};
module.exports = { userType, userStatus, errorMsg, statusType, TokenType };
