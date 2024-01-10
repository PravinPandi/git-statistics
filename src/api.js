import axios from 'axios';

export const fetchUser = (query, filter) => {
  return axios
    .post(
      'https://api.github.com/graphql',
      { query },
      {
        headers: {
          Authorization: `Bearer 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`,
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