/* eslint-disable no-shadow */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  Loading,
} from './styles';

export default function User({ navigation }) {
  const [stars, setStars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const user = navigation.getParam('user');

  useEffect(() => {
    load(page);
  }, []);

  async function load(page) {
    const response = await api.get(`/users/${user.login}/starred`, {
      params: { page },
    });

    setStars(page >= 2 ? [...stars, ...response.data] : response.data);
    setPage(page);
    setLoading(false);
    setRefreshing(false);
  }

  function loadMore() {
    load(page + 1);
  }

  function refreshList() {
    setRefreshing(true);
    setStars([]);
    load(1);
  }

  function handleNavigate(repository) {
    navigation.navigate('Repository', { repository });
  }

  return (
    <Container>
      <Header>
        <Avatar source={{ uri: user.avatar }} />
        <Name>{user.name}</Name>
        <Bio>{user.bio}</Bio>
      </Header>

      {loading ? (
        <Loading />
      ) : (
        <Stars
          data={stars}
          onRefresh={refreshList}
          refreshing={refreshing}
          keyExtractor={star => String(star.id)}
          onEndReachedThreshold={0.2}
          onEndReached={loadMore}
          renderItem={({ item }) => (
            <Starred onPress={() => handleNavigate(item)}>
              <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
              <Info>
                <Title>{item.name}</Title>
                <Author>{item.owner.login}</Author>
              </Info>
            </Starred>
          )}
        />
      )}
    </Container>
  );
}

User.navigationOptions = ({ navigation }) => ({
  title: navigation.getParam('user').name,
});

User.propTypes = {
  navigation: PropTypes.shape({
    getParam: PropTypes.func,
    navigate: PropTypes.func,
  }).isRequired,
};
