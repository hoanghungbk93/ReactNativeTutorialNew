import React, {Component} from 'react'
import {View, Dimensions, Text, TextInput, Alert, TouchableHighlight, Keyboard, KeyboardAvoidingView} from 'react-native'
import firebase from 'react-native-firebase'
import Button from 'react-native-button'
const screenHeight = Dimensions.get('screen').height
export default class LoginComponent extends Component{
    constructor(props)
    {
        super(props)
        this.state = {
            isAuthenticated : false,
            userName : '',
            password : '',
            user : null,
            isLogin : false
        }
    }
    onAnonymousLogin = () => {
        firebase.auth().signInAnonymously()
            .then(() => {
                console.log(`Login successfully`);
                this.setState({
                    isAuthenticated: true,
                });
            })
            .catch((error) => {
                console.log(`Login failed. Error = ${error}`);
            });
    }

    onSignUp = () =>
    {
        firebase.auth().createUserWithEmailAndPassword(this.state.userName, this.state.password)
        .then(
            (Luser) =>
            {
                this.setState(
                    {
                        user : Luser
                    }
                )
                console.log(`Create user : ${JSON.stringify(Luser)}`)
            }
        )
    }
    onLogin = () =>
    {
        firebase.auth().signInWithEmailAndPassword(this.state.userName, this.state.password)
        .then(
            (Luser) =>
            {
                this.setState(
                    {
                        user : Luser
                    }
                )
                this.props.navigation.navigate('MainMenu')
                console.log(`login user : ${JSON.stringify(Luser)} success`)
            }
        ).catch(err => {
            Alert.alert('email or password wrong')
        })
    }
    render()
    {
        return(
            <KeyboardAvoidingView behavior="padding" enabled>
                <View style = {{
                        flex : 1, 
                        alignItems : 'center',
                        justifyContent : 'center',
                        flexDirection : 'column',
                        backgroundColor : 'yellow'
                        }}>
                    <View
                        style = {{
                            height : screenHeight / 4
                        }}
                    ></View>
                    {/* <Text style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        margin: 40
                    }}>Login with Firebase </Text> */}
                    {/* <Button containerStyle={{
                        padding: 10,
                        borderRadius: 4,
                        backgroundColor: 'rgb(226,161,184)'
                    }}
                        style={{ fontSize: 18, color: 'white' }}
                        onPress={this.onAnonymousLogin}
                    >Login anonymous</Button> */}
                    {/* <Text>
                        {this.state.isAuthenticated == true}
                    </Text> */}
                    <TextInput
                        style = {{
                            width : 200,
                            height : 40,
                            borderColor : 'gray',
                            borderWidth : 1,
                            marginBottom : 10
                        }}
                        placeholder = "Enter your email"
                        onChangeText = {
                            (text) => {
                                this.setState(
                                    {
                                        userName : text
                                    }
                                )
                            }
                        }
                    >

                    </TextInput>
                    <TextInput
                        style = {{
                            width : 200,
                            height : 40,
                            borderColor : 'gray',
                            borderWidth : 1,
                            marginBottom : 10
                        }}
                        placeholder = "Enter your password"
                        onChangeText = {
                            (text) => {
                                this.setState(
                                    {
                                        password : text
                                    }
                                )
                            }
                        }
                    >

                    </TextInput>
                    <View
                        style = {{flex:1, flexDirection : 'column', justifyContent : 'flex-start', alignItems : 'center'}}
                    >
                        <TouchableHighlight
                            style = {{
                                width : 200,
                                height : 50,
                                marginBottom : 10,
                                backgroundColor : 'green',
                                borderRadius : 10,
                                alignItems : 'center',
                                justifyContent : 'center'
                            }}
                            onPress = {this.onLogin}
                        >
                            <Text>Login</Text>
                        </TouchableHighlight>
                        <TouchableHighlight
                            style = {{
                                width : 200,
                                height : 50,
                                marginBottom : 10,
                                borderRadius : 10,
                                backgroundColor : 'red',
                                alignItems : 'center',
                                justifyContent : 'center'
                            }}
                            onPress = {this.onSignUp}
                        >
                            <Text >SignUp</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </KeyboardAvoidingView>
        )
    }
}
