const createAccountType = function (name, displayName, description) {
  return { name: name, displayName: displayName, description: description }
}

// The keys of this object will be the values allowed in the user table's `account_type` column.
// If you add more account types later, you'll need to write a migration to modify that constraint.
const accountTypes = {
  LIMITED: createAccountType('LIMITED', 'Limited Account',
    'This is a limited account. Upgrade soon to access all features.'),
  PREMIUM: createAccountType('PREMIUM', 'Premium Account',
    'This is a premium account. Thanks for supporting our app!'),
}

module.exports = accountTypes
