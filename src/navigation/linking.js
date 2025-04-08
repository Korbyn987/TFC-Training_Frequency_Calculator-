export const linking = {
  prefixes: ['http://localhost:19006', 'http://localhost:5001'],
  config: {
    screens: {
      Login: 'Login',
      CreateAccount: 'CreateAccount',
      Recovery: 'Recovery',
      ResetPassword: {
        path: 'ResetPassword',
        parse: {
          token: (token) => token,
        },
      },
      Tabs: {
        screens: {
          Home: 'Home',
          Calculator: 'Calculator',
          Profile: 'Profile',
          About: 'About',
        },
      },
    },
  },
};
