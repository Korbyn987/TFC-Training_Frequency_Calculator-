export const linking = {
  prefixes: ['http://localhost:19006', 'http://localhost:5001'],
  config: {
    screens: {
      Login: 'Login',
      CreateAccount: 'CreateAccount',
      Recovery: 'Recovery',
      'reset-password': {
        path: 'reset-password',
        parse: {
          token: token => token,
        },
      },
      Main: {
        screens: {
          Home: 'Home',
          'Recovery Guide': 'recovery-guide',
          Profile: 'Profile',
          About: 'About',
        },
      },
    },
  },
};
