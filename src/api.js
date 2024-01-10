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
