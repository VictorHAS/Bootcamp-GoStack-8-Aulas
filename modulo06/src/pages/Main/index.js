import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Keyboard, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../services/api';

import {
  Container,
  Form,
  Input,
  SubmitButton,
  List,
  User,
  Remove,
  Avatar,
  Name,
  Bio,
  ProfileButton,
  ProfileButtonText,
} from './styles';

export default function Main({ navigation }) {
  const [newUser, setNewUser] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleAddUser() {
    if (newUser === '') {
      return alert('Digite um nome de usuario');
    }
    setLoading(true);
    const userExist = users.find(
      user => user.login.toUpperCase() === newUser.toUpperCase()
    );
    if (userExist) {
      setLoading(false);
      return alert('O usuario já foi adicionado');
    }
    await api
      .get(`/users/${newUser}`)
      .then(response => {
        if (response) {
          const data = {
            name: response.data.name,
            login: response.data.login,
            bio: response.data.bio,
            avatar: response.data.avatar_url,
          };

          setUsers([...users, data]);
          setNewUser('');
          setLoading(false);
          return Keyboard.dismiss();
        }
      })
      .catch(err => {
        alert('Usuario não encontrado.');
      });
    return setLoading(false);
  }

  function handleNavigate(user) {
    navigation.navigate('User', { user });
  }

  function handleDelete(login) {
    setUsers(users.filter(user => user.login !== login));
    alert(`${login} removido!`);
  }

  useEffect(() => {
    async function loadUsers() {
      const response = await AsyncStorage.getItem('users');

      if (response) {
        setUsers(JSON.parse(response));
      }
    }

    loadUsers();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  return (
    <Container>
      <Form>
        <Input
          autoCorrect={false}
          autoCapitalize="none"
          placeholder="Adicionar usuário"
          value={newUser}
          onChangeText={text => setNewUser(text)}
          returnKeyType="send"
          onSubmitEditing={handleAddUser}
        />
        <SubmitButton loading={loading} onPress={handleAddUser}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Icon name="add" size={20} color="#FFF" />
          )}
        </SubmitButton>
      </Form>

      <List
        data={users}
        keyExtractor={user => user.login}
        renderItem={({ item }) => (
          <User>
            <Remove
              name="delete"
              size={20}
              onPress={() => handleDelete(item.login)}
            />
            <Avatar source={{ uri: item.avatar }} />
            <Name>{item.name}</Name>
            <Bio>{item.bio}</Bio>

            <ProfileButton onPress={() => handleNavigate(item)}>
              <ProfileButtonText>Ver perfil</ProfileButtonText>
            </ProfileButton>
          </User>
        )}
      />
    </Container>
  );
}

Main.navigationOptions = {
  title: 'Usuários',
};

Main.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }).isRequired,
};
