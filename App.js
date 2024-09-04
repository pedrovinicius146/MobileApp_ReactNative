import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue } from 'firebase/database';


const firebaseConfig = {
  apiKey: "AIzaSyA-GLirk9h5aW2gLBjq96u-KH9HikdAwfo",
  authDomain: "apisotero-5bdca.firebaseapp.com",
  databaseURL: "https://apisotero-5bdca-default-rtdb.firebaseio.com",
  projectId: "apisotero-5bdca",
  storageBucket: "apisotero-5bdca.appspot.com",
  messagingSenderId: "796624481557",
  appId: "1:796624481557:web:475a5631753a41b75d0d1c"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth();
const database = getDatabase(app);

const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [backgroundColor, setBackgroundColor] = useState('white');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const usersRef = ref(database, 'users/');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRegisteredUsers(Object.values(data));
      }
    });
  }, []);

  const handleLogin = async () => {
    if (email !== '' && password !== '') {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Login realizado com sucesso');
      } catch (error) {
        console.error('Erro ao realizar login:', error);
        alert('Email ou senha inválidos');
      }
    } else {
      alert('Preenchimento inválido!!!');
    }
  };

  const handleCepChange = async (text) => {
    setCep(text);
    if (text.length === 8) {
      try {
        setLoading(true);
        const response = await axios.get(`https://viacep.com.br/ws/${text}/json`);
        const { logradouro, localidade, bairro } = response.data;
        setRua(logradouro);
        setCidade(localidade);
        setBairro(bairro);
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        alert('CEP não encontrado. Verifique e tente novamente.');
      } finally {
        setLoading(false);
      }
    } else {
      setRua('');
      setCidade('');
      setBairro('');
    }
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    if (name !== '' && email !== '' && password !== '' && cep !== '' && rua !== '' && cidade !== '' && bairro !== '') {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        const newUserRef = ref(database, 'users/' + auth.currentUser.uid);
        await set(newUserRef, {
          name,
          email,
          password,
          cep,
          rua,
          cidade,
          bairro
        });
        setRegisteredUsers([...registeredUsers, { name, email, password, cep, rua, cidade, bairro }]);
        setIsModalVisible(false);
        alert('Cadastro realizado com sucesso');
      } catch (error) {
        console.error('Erro ao cadastrar:', error);
        alert('Erro ao cadastrar. Tente novamente.');
      }
    } else {
      alert('Preenchimento inválido!!!');
    }
  };

  const toggleBackgroundColor = () => {
    setBackgroundColor(backgroundColor === 'gray' ? 'white' : 'gray');
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: backgroundColor }]}>
      <View style={styles.container}>
        <Text style={styles.heading}>Login</Text>
        <View style={styles.inputContainer}>
          <Image source={require('./envelope.png')} style={styles.image} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={text => setEmail(text)}
            value={email}
          />
        </View>
        <View style={styles.inputContainer}>
          <Image source={require('./lock.png')} style={styles.image} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            secureTextEntry
            onChangeText={text => setPassword(text)}
            value={password}
          />
        </View>
        <TouchableOpacity style={styles.butao} onPress={handleLogin}>
          <Text style={styles.texto_l}>LOGIN</Text>
        </TouchableOpacity>
        <Text style={styles.cad}>Não possui conta?</Text>
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <Text style={styles.registerLink}>Cadastre-se!!</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isModalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <View style={styles.containerModal}>
            <Text style={styles.heading}>Cadastro</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome"
              onChangeText={text => setName(text)}
              value={name}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              onChangeText={text => setEmail(text)}
              value={email}
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              secureTextEntry
              onChangeText={text => setPassword(text)}
              value={password}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmar Senha"
              secureTextEntry
              onChangeText={text => setConfirmPassword(text)}
              value={confirmPassword}
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="CEP"
                onChangeText={handleCepChange}
                value={cep}
              />
            </View>
            {loading ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Rua"
                  value={rua}
                  editable={false}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Cidade"
                  value={cidade}
                  editable={false}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Bairro"
                  value={bairro}
                  editable={false}
                />
              </>
            )}
            <TouchableOpacity style={styles.butao} onPress={handleRegister}>
              <Text style={styles.texto_l}>Cadastrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.butao} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.texto_l}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>

      <TouchableOpacity style={styles.switchButton} onPress={toggleBackgroundColor}>
        <Text style={styles.switchButtonText}>Mudar Cor</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },
  modalContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'black',
  },
  containerModal: {
    backgroundColor: 'white',
    width: 300,
    height: 800,
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 30,
    marginBottom: 30,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: 'black',
  },
  input: {
    width: 190,
    height: 40,
    borderColor: 'green',
    borderWidth: 1,
    marginBottom: 30,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  image: {
    width: 24,
    height: 24,
    marginRight: 10,
    marginBottom: 28,
  },
  registerLink: {
    marginTop: 20,
    marginBottom: 50,
    color: 'blue',
  },
  cad: {
    fontSize: 20,
    marginTop: 20,
  },
  butao: {
    backgroundColor: 'blue',
    width: 180,
    height: 42,
    borderRadius: 5,
    marginBottom: 12,
  },
  texto_l: {
    textAlign: 'center',
    lineHeight: 42,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 3,
  },
  switchButton: {
    alignItems: 'center',
    lineHeight: 42,
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'blue',
    width: 100,
    borderRadius: 20,
  },
  switchButtonText: {
    color: 'white',
  },
});

export default App;
