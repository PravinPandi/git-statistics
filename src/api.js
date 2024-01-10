import axios from 'axios';

export const fetchUser = (query, filter) => {
  return axios
    .post(
      'https://api.github.com/graphql',
      { query },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_API_TOKEN}`,
        },
      }
    )
    .then((response) => {
      let { user } = response.data.data;

      if (filter == 'location' || filter == 'bio') {
        user = response.data.data.search.nodes[0];
      }

      return user;
    })
    .catch((error) => {
      throw error;
    });
};