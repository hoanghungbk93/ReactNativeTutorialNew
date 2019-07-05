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
  ScrollView,
  Alert,
  TextInput,
  Keyboard
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import firebase from 'react-native-firebase';
import uuid from 'uuid/v4'; // Import UUID to generate UUID
import LoginComponent from './components/LoginComponent'
import MainMenu, {teamRef} from './components/MainMenu'
import { createStackNavigator, createAppContainer } from 'react-navigation';
var options = {
  title: 'Select Image',
  storageOptions: {
    skipBackup: true,
    path: ''
  }
};
var ImageRow = ({ image, windowWidth, popImage }) => (
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
    imgSource: {},
    uploading: false,
    progress: 0,
    images: [],
    memberList : [],
    path : "",
    memberName : '',
    memberBirth : '',
    key : '',
  };
  componentDidMount() {
    let { navigation } = this.props;
      let PrName = navigation.getParam('name');
      console.log(`Prname :  ${JSON.stringify(PrName)}`)
      if (PrName.teamName.length != 0)
      {
        this.setState(
          { path: PrName.teamName, key : PrName.key },
            () => {
              console.log(this.state.path) // Mustkeom
              let images;
              AsyncStorage.getItem(this.state.path)
                .then(data => {
                  images = JSON.parse(data) || [];
                  this.setState({
                    images: images
                  });
                })
                .catch(error => {
                  console.log(error);
                });
                teamRef.child(this.state.key).on('value', (childSnapshot) =>
                  {
                      const memberList = []
                      childSnapshot.forEach(doc => {
                        memberList.push(
                              {
                                  key : doc.key,
                                  memberName : doc.toJSON().memberName,
                                  memberBirth : doc.toJSON().memberBirth,
                              }
                          )
                          this.setState(
                              {
                                memberList : memberList,
                              }
                          )
                      });
                  })
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
        Alert.alert(`And error occured: ', ${response.error}`);
      } else {
        var source = { uri: response.uri };
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
    if(this.state.memberBirth === "" || this.state.memberName === "")
    {
      Alert.alert('please enter empty feild');
      return
    }
    var ext = this.state.imageUri.split('.').pop(); // Extract image extension
    var filename = `${uuid()}.${ext}`; // Generate unique name
    this.setState({ uploading: true });
    let key = teamRef.child(this.state.key).push({
      memberName : this.state.memberName,
      memberBirth : this.state.memberBirth
    }).key
    firebase
      .storage()
      .ref(`tutorials/${this.state.path}/${key}`)
      .putFile(this.state.imageUri)
      .on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        snapshot => {
          let state = {};
          state = {
            ...this.state,
            progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100 // Calculate progress percentage
          };
          if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
            var allImages = this.state.images;
            allImages.push(snapshot.downloadURL);
            state = {
              ...state,
              uploading: false,
              imgSource: {},
              imageUri: '',
              progress: 0,
              images: allImages,
            };
            AsyncStorage.setItem(this.state.path, JSON.stringify(allImages));
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
    this.setState({ images : images });
    AsyncStorage.setItem(this.state.path, JSON.stringify(images));
  };
  logout()
  {
    this.props.navigation.navigate('Login')
  } 
  getFileName(url)
  {
    return url.split('?')[0].slice(url.split('?')[0].lastIndexOf('%2F') + 3)
  }
  getNameAndBirth(key)
  {
    ret = {}
    for(let i = 0; i < this.state.memberList.length; i++)
    {
      if(this.state.memberList[i].key == key)
      {
        ret =  {
          memberBirth : this.state.memberList[i].memberBirth,
          memberName : this.state.memberList[i].memberName
        }
        break;
      }
    }
    return ret
  }
  render() {
    var { uploading, imgSource, progress, images } = this.state;
    var windowWidth = Dimensions.get('window').width;
    var disabledStyle = uploading ? styles.disabledBtn : {};
    var actionBtnStyles = [styles.btn, disabledStyle];
    return (
      <View style ={{
        flex : 1, flexDirection : 'column'
      }}>
        <TextInput
            style = {{
                height : 40,
                borderColor : 'gray',
                borderWidth : 1,
                marginBottom : 10
            }}
            placeholder = "Enter member name"
            autoCorrect={false}
            autoCapitalize = 'none'
            onChangeText = {
                (text) => {
                    this.setState(
                        {
                          memberName : text
                        }
                    )
                }
            }
        >

        </TextInput>
        <TextInput
            style = {{
                height : 40,
                borderColor : 'gray',
                borderWidth : 1,
                marginBottom : 10
            }}
            autoCorrect={false}
            placeholder = "Enter member birth"
            autoCapitalize = 'none'
            onChangeText = {
                (text) => {
                    this.setState(
                        {
                            memberBirth : text
                        }
                    )
                }
            }
            onTouchCancel = {                     
                    Keyboard.dismiss                       
            }
            onSubmitEditing={Keyboard.dismiss}
        >

        </TextInput>
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
            {Object.keys(imgSource).length !== 0 && (
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
              style={{ marginTop: 20 }}
              data={images}
              renderItem={({ item: image, index }) => (
                <View style = {{flexDirection : 'row'}}>
                  <ImageRow
                    windowWidth={windowWidth}
                    image={image}
                    popImage={() => this.removeImage(index)}
                  />
                  <View style ={{flexDirection : 'column', marginTop : 10}}>
                    <Text>{Object.keys(this.getNameAndBirth(this.getFileName(image))).length !== 0 ? this.getNameAndBirth(this.getFileName(image)).memberName : "undefine"}</Text>
                    <Text>{Object.keys(this.getNameAndBirth(this.getFileName(image))).length !== 0 ? this.getNameAndBirth(this.getFileName(image)).memberBirth : "undefine"}</Text>
                  </View>
                </View>
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

var RootStack = createStackNavigator(
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

var AppContainer = createAppContainer(RootStack);

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}
var styles = StyleSheet.create({
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