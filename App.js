import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  AsyncStorage,
  Dimensions,
  ScrollView
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import firebase from 'react-native-firebase';
import uuid from 'uuid/v4'; // Import UUID to generate UUID
import LoginComponent from './components/LoginComponent'
import MainMenu from './components/MainMenu'
import { createStackNavigator, createAppContainer } from 'react-navigation';
var options = {
  title: 'Select Image',
  storageOptions: {
    skipBackup: true,
    path: ''
  }
};
const ImageRow = ({ image, windowWidth, popImage }) => (
  <View>
    <Image
      source={{ uri: image }}
      style={[styles.img, { width: windowWidth / 2 - 15 }]}
      onError={popImage}
    />
  </View>
);
class MainScreen extends Component {
  constructor(props)
  {
    super(props)
    this.logout = this.logout.bind(this)
  }
  state = {
    imgSource: '',
    uploading: false,
    progress: 0,
    images: [],
    path : ""
  };
  componentDidMount() {
    const { navigation } = this.props;
      const PrName = navigation.getParam('name');
      console.log(`Prname :  ${JSON.stringify(PrName)}`)
      if (PrName.name.length != 0)
      {
        this.setState(
          { path: PrName.name },
            () => {
              console.log(this.state.path) // Mustkeom
              options.storageOptions.path = this.state.path
              let images;
              AsyncStorage.getItem(options.storageOptions.path)
                .then(data => {
                  images = JSON.parse(data) || [];
                  this.setState({
                    images: images
                  });
                })
                .catch(error => {
                  console.log(error);
                });
            }
        );
      }
    
      
      
      console.log(` path : ${this.state.path}`)
      console.log(`option :  ${options.storageOptions.path}`)
  }
  /**
   * Select image method
   */
  pickImage = () => {
    ImagePicker.showImagePicker(options, response => {
      if (response.didCancel) {
        console.log('You cancelled image picker 😟');
      } else if (response.error) {
        alert('And error occured: ', response.error);
      } else {
        const source = { uri: response.uri };
        this.setState({
          imgSource: source,
          imageUri: response.uri
        });
      }
    });
  };
  /**
   * Upload image method
   */
  uploadImage = () => {
    console.log(`option :  ${options.storageOptions.path}`)
    const ext = this.state.imageUri.split('.').pop(); // Extract image extension
    const filename = `${uuid()}.${ext}`; // Generate unique name
    this.setState({ uploading: true });
    firebase
      .storage()
      .ref(`tutorials/${options.storageOptions.path}/${filename}`)
      .putFile(this.state.imageUri)
      .on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        snapshot => {
          let state = {};
          state = {
            ...state,
            progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100 // Calculate progress percentage
          };
          if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
            const allImages = this.state.images;
            allImages.push(snapshot.downloadURL);
            state = {
              ...state,
              uploading: false,
              imgSource: '',
              imageUri: '',
              progress: 0,
              images: allImages,
              path : ''
            };
            AsyncStorage.setItem(options.storageOptions.path, JSON.stringify(allImages));
          }
          this.setState(state);
        },
        error => {
          unsubscribe();
          alert('Sorry, Try again.');
        }
      );
  };
  /**
   * Remove image from the state and persistance storage
   */
  removeImage = imageIndex => {
    let images = this.state.images;
    images.pop(imageIndex);
    this.setState({ images });
    AsyncStorage.setItem(options.storageOptions.path, JSON.stringify(images));
  };
  logout()
  {
    this.props.navigation.navigate('Login')
  } 
  render() {
    const { uploading, imgSource, progress, images } = this.state;
    const windowWidth = Dimensions.get('window').width;
    const disabledStyle = uploading ? styles.disabledBtn : {};
    const actionBtnStyles = [styles.btn, disabledStyle];
    return (
      <View style ={{
        flex : 1, flexDirection : 'column'
      }}>
        <TouchableOpacity
          style={actionBtnStyles}
          onPress={this.pickImage}
          disabled={uploading}
        >
          <View>
            <Text style={styles.btnTxt}>Pick image</Text>
          </View>
        </TouchableOpacity>
        <ScrollView>
          <View style={styles.container}>
            
            {/** Display selected image */}
            {imgSource !== '' && (
              <View>
                <Image source={imgSource} style={styles.image} />
                {uploading && (
                  <View
                    style={[styles.progressBar, { width: `${progress}%` }]}
                  />
                )}
                <TouchableOpacity
                  style={actionBtnStyles}
                  onPress={this.uploadImage}
                  disabled={uploading}
                >
                  <View>
                    {uploading ? (
                      <Text style={styles.btnTxt}>Uploading ...</Text>
                    ) : (
                      <Text style={styles.btnTxt}>Upload image</Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            )}

            <View>
              <Text
                style={{
                  fontWeight: '600',
                  paddingTop: 20,
                  alignSelf: 'center'
                }}
              >
                {images.length > 0
                  ? 'Your uploaded images'
                  : 'There is no image you uploaded'}
              </Text>
            </View>
            <FlatList
              numColumns={2}
              style={{ marginTop: 20 }}
              data={images}
              renderItem={({ item: image, index }) => (
                <ImageRow
                  windowWidth={windowWidth}
                  image={image}
                  popImage={() => this.removeImage(index)}
                />
              )}
              keyExtractor={index => index}
            />
          </View>
        </ScrollView>
        <TouchableOpacity
              style={styles.logoutBtn}
              onPress={this.logout}
            >
              <View>
                <Text style={styles.btnTxt}>Logout</Text>
              </View>
            </TouchableOpacity>
      </View>
    );
  }
}

const RootStack = createStackNavigator(
  {
    Login: LoginComponent,
    Main: MainScreen,
    MainMenu : MainMenu
  },
  {
    initialRouteName: 'Login',
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: '#f4511e',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
  }
);

const AppContainer = createAppContainer(RootStack);

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    marginTop: 20,
    paddingLeft: 5,
    paddingRight: 5
  },
  btn: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 20,
    backgroundColor: 'rgb(3, 154, 229)',
    marginTop: 20,
    alignItems: 'center'
  },
  logoutBtn: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 20,
    backgroundColor: 'rgb(3, 154, 229)',
    marginBottom: 20,
    alignItems: 'center'
  },
  disabledBtn: {
    backgroundColor: 'rgba(3,155,229,0.5)'
  },
  btnTxt: {
    color: '#fff'
  },
  image: {
    marginTop: 20,
    minWidth: 200,
    height: 200,
    resizeMode: 'contain',
    backgroundColor: '#ccc',
  },
  img: {
    flex: 1,
    height: 100,
    margin: 5,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#ccc'
  },
  progressBar: {
    backgroundColor: 'rgb(3, 154, 229)',
    height: 3,
    shadowColor: '#000',
  }
});