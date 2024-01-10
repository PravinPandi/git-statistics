import React, { useState } from 'react';
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Layout,
  Menu,
  theme,
  Input,
  message,
  Card,
  Avatar,
  Skeleton,
  Select,
} from 'antd';

import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { fetchUser } from './api';

const { Meta } = Card;
const { Search } = Input;
const { Option } = Select;
const { Header, Content } = Layout;

const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [user, setUser] = useState({});

  const [repoSearch, setRepoSearch] = useState('');

  const [filter, setFilter] = useState('login');

  const [repoFilter, setRepoFilter] = useState('name');

  const [chartData, setChartData] = useState(
    user?.repositories?.nodes.map((repo) => ({
      name: repo.name,
      Stars: repo?.stargazerCount ?? 0,
      PRs: repo?.pullRequests?.totalCount ?? 0,
      Issues: repo?.issues?.totalCount ?? 0,
      Commits: repo?.object?.history?.totalCount ?? 0,
    })) || []
  );

  const handleSearch = (value) => {
    if (!value.trim()) {
      message.error('Search value cannot be empty');
      return;
    }
    let query;
    if (filter === 'login') {
      query = `
        query {
          user(login: "${value}") {
            id
            avatarUrl
            login
            bio
            location
            repositories(first: 100) {
              nodes {
                name
                description
                url
                stargazerCount
                pullRequests {
                  totalCount
                }
                issues {
                  totalCount
                }
                object(expression: "master") {
                  ... on Commit {
                    history {
                      totalCount
                    }
                  }
                }
              }
            }
          }
        }
      `;
    } else {
      query = `
        query {
          search(query: "${value}", type: USER, first: 1) {
            nodes {
              ... on User {
                id
                avatarUrl
                login
                bio
                location
                repositories(first: 5) {
                  nodes {
                    name
                    description
                    url
                    stargazerCount
                    pullRequests {
                      totalCount
                    }
                    issues {
                      totalCount
                    }
                    object(expression: "master") {
                      ... on Commit {
                        history {
                          totalCount
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;
    }

    fetchUser(query, filter)
      .then((user) => {
        if (user) {
          message.success(`User Fetched Successfully`);
          console.log(user);

          // Sort repositories by stargazerCount
          const sortedRepos = [...user.repositories.nodes].sort(
            (a, b) => b.stargazerCount - a.stargazerCount
          );

          // Set sorted repositories back to user
          user.repositories.nodes = sortedRepos;
          setUser(user);

          // Set chartData here
          setChartData(
            sortedRepos.map((repo) => ({
              name: repo.name,
              Stars: repo?.stargazerCount ?? 0,
              PRs: repo?.pullRequests?.totalCount ?? 0,
              Issues: repo?.issues?.totalCount ?? 0,
              Commits: repo?.object?.history?.totalCount ?? 0,
            })) || []
          );
        } else {
          message.error('User not found');
        }
      })
      .catch((error) => {
        message.error('Failed to fetch user');
      });
  };

  const handleFilter = (value) => {
    setFilter(value);
  };

  const handleRepoFilter = (value) => {
    setRepoFilter(value);
  };

  const handleRepoSearch = (value) => {
    setRepoSearch(value);

    const filteredRepos = user?.repositories?.nodes.filter((repo) =>
      repo?.[repoFilter]
        ?.toString()
        ?.toLowerCase()
        ?.includes(value.toLowerCase())
    );

    if (filteredRepos.length === 0) {
      message.error('No data found');
    }
  };

  const handleRepoClick = (repo) => {
    message.info(`
      Stars: ${repo?.stargazerCount ?? 'N/A'},
      Pull Requests: ${repo?.pullRequests?.totalCount ?? 'N/A'},
      Issues: ${repo?.issues?.totalCount ?? 'N/A'},
      Commits: ${repo?.object?.history?.totalCount ?? 'N/A'}
    `);

    setChartData([
      {
        name: repo.name,
        Stars: repo?.stargazerCount ?? 0,
        PRs: repo?.pullRequests?.totalCount ?? 0,
        Issues: repo?.issues?.totalCount ?? 0,
        Commits: repo?.object?.history?.totalCount ?? 0,
      },
    ]);
  };

  console.log(process.env.REACT_APP_API_TOKEN, 'chartData');

  return (
    <Layout>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <Menu.Item key="1" disabled className="text-2xl">
            Git Statistics
          </Menu.Item>
        </Menu>
      </Header>
      <Layout>
        <Layout
          style={{
            padding: '0 24px 24px',
          }}
          className="flex justify-end space-x-4"
        >
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 800,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <div className="flex justify-end m-4">
              <Search
                placeholder="github username"
                onSearch={handleSearch}
                className="w-48 mr-2"
              />
              <Select
                defaultValue="login"
                className="w-48"
                onChange={handleFilter}
              >
                <Option value="login">User Name</Option>
                <Option value="location">Global Search</Option>
              </Select>
            </div>
            {user?.login ? (
              <>
                <Card style={{ width: 300 }}>
                  <Meta
                    avatar={<Avatar src={user?.avatarUrl} />}
                    title={user?.login}
                    description={`Bio: ${
                      user?.bio || 'No bio provided'
                    }, Location: ${user?.location || 'No location provided'}`}
                  />
                </Card>

                <div className="flex justify-end m-4">
                  <Search
                    placeholder="search repository"
                    onSearch={handleRepoSearch}
                    className="w-48 mr-2"
                  />
                  <Select
                    defaultValue="name"
                    className="w-48"
                    onChange={handleRepoFilter}
                  >
                    <Option value="name">Name</Option>
                    <Option value="description">Description</Option>
                    <Option value="url">URL</Option>
                  </Select>
                </div>

                <h2 className="text-2xl font-bold m-4">
                  Highest Starred Repos
                </h2>
                <div className="flex space-x-4 overflow-auto">
                  {user?.repositories?.nodes
                    .filter((repo) =>
                      repo?.[repoFilter]
                        ?.toString()
                        ?.toLowerCase()
                        ?.includes(repoSearch.toLowerCase())
                    )
                    .slice(0, 5)
                    .map((repo) => (
                      <div key={repo.name} className="w-72">
                        <Card
                          title={repo.name}
                          onClick={() => handleRepoClick(repo)}
                          className="flex flex-col cursor-pointer"
                        >
                          <p className="flex-grow">{repo.description}</p>
                          <p>
                            <a
                              href={repo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              Repository Link
                            </a>
                          </p>
                        </Card>
                      </div>
                    ))}
                  {user?.repositories?.nodes.filter((repo) =>
                    repo[repoFilter]
                      ?.toString()
                      ?.toLowerCase()
                      .includes(repoSearch.toLowerCase())
                  ).length > 5 && (
                    <div className="w-72">
                      <Card title="More data" disabled>
                        <p>
                          There are more repositories. Please refine your
                          search.
                        </p>
                      </Card>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="m-4">
                <Skeleton
                  avatar
                  paragraph={{
                    rows: 4,
                  }}
                />{' '}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-around mt-4">
              {chartData?.length > 0 && (
                <div className="w-full sm:w-1/2 sm:mb-0 mb-4">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Stars" fill="#8884d8" />
                      <Bar dataKey="PRs" fill="#82ca9d" />
                      <Bar dataKey="Issues" fill="#ffc658" />
                      <Bar dataKey="Commits" fill="#ff7300" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {chartData?.length > 0 && (
                <div className="w-full sm:w-1/2">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Stars" stroke="#8884d8" />
                      <Line type="monotone" dataKey="PRs" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="Issues" stroke="#ffc658" />
                      <Line
                        type="monotone"
                        dataKey="Commits"
                        stroke="#ff7300"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};
export default App;
