# Script to start the application

npm start

# External Libraries used

antd
axios
recharts

# Work Flow

The application's workflow is structured as follows:

Design and UI: Ant Design was used for designing the user interface.

Charts: Recharts was implemented to create visual representations of data.

Data Retrieval: GraphQL was used to fetch data from the server.

# Features

User Search: The application allows users to search for a GitHub username, retrieving relevant details like username, profile image, bio, and location.

Repository Information: It fetches specific user repository information, sorts it based on the repository with the highest number of stars, and presents the top 5 repositories.

Search and Filter: Users can utilize the search and filter option placed above the repository cards to perform specific searches based on various fields.

Statistical Charts: The application includes two charts that showcase statistics such as stars, pull requests (PRs), issues, and commits for each repository.
