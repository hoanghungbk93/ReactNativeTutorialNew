import React, {Component} from 'react'
import {View, Image, Text, TextInput, Alert, FlatList, TouchableHighlight, Dimensions} from 'react-native'
const PhoneWidth = Dimensions.get('window').width
import firebase from 'react-native-firebase';
 let iosConfig = {
    apiKey: "AIzaSyDq1Pa7UGSlrKC0ORoWC_qO8_dYXi0Fzyk",
    appId : "1:357485505759:ios:1c7f749083b7c366",
    clientId: "357485505759-fm5e7sm6jcaf5vqd747l1m0aha77uk2r.apps.googleusercontent.com",
    databaseURL: "https://fir-practice-fa1ec.firebaseio.com",
    projectId: "fir-practice-fa1ec",
    storageBucket: "fir-practice-fa1ec.appspot.com",
    messagingSenderId: "357485505759"
  };
let app = firebase.initializeApp(iosConfig, 'footballApp');
const rootRef = app.database().ref()
const teamRef = rootRef.child('teamList')
export default class MainMenu extends Component{
    constructor(props)
    {
        super(props)
        this.state = {
            dataList : [],
            currentProjectName : "",
            refreshFlatList : false
        }

        this.onItemPress = this.onItemPress.bind(this)
    }
    onItemPress = (index) => 
    {
        //Alert.alert(this.state.dataList[index])
        this.props.navigation.navigate('Main',
        {
            name : this.state.dataList[index]
        })
    }
    componentDidMount()
    {
        teamRef.on('value', (childSnapshot) =>
        {
            const teamList = []
            childSnapshot.forEach(doc => {
                teamList.push(
                    {
                        key : doc.key,
                        memberName : doc.toJSON().memberName
                    }
                )
                this.setState(
                    {
                        dataList : teamList,
                        refreshFlatList : !this.state.refreshFlatList
                    }
                )
            });
        })
    }
    render()
    {
        return (
            <View style = {{
                flex : 1,
                flexDirection : 'column',
                justifyContent : 'flex-start'
            }}>
                <View style = {{
                    flexDirection : 'row',
                    height : 50,
                    marginTop : 10,
                    marginLeft : 10,
                    backgroundColor : 'white',
                    height : 50
                }}>
                    <TextInput
                        style = {{
                            marginLeft : 10,
                            fontSize : 25
                        }}
                        placeholder = "Enter new project name"
                        onChangeText = {
                            (text) =>
                            {
                                this.setState(
                                    {
                                        currentProjectName : text
                                    }
                                )
                            }
                        }
                    ></TextInput>
                    <TouchableHighlight
                        style = {{position : 'absolute', bottom : 0, alignSelf : 'flex-end', right : 0}}
                        onPress = {
                            () =>
                            {
                                if(this.state.currentProjectName !== "")
                                {
                                    currentDataList = this.state.dataList
                                    currentDataList.push({memberName : this.state.currentProjectName})
                                    this.setState(
                                        {
                                            dataList : currentDataList,
                                            refreshFlatList : !this.state.refreshFlatList
                                        }
                                    )
                                    teamRef.push(
                                        {
                                            memberName : this.state.currentProjectName
                                        }
                                    )
                                    
                                }
                            }
                        }
                    >
                        <Image
                            style = {{
                                width : 50,
                                height : 50,
                            }}
                            source = {require('../icon/icon.jpeg')}
                        >

                        </Image>
                    </TouchableHighlight>
                    

                </View>
                <FlatList
                data={this.state.dataList}
                renderItem={({item, index}) => 
                    {
                        // console.log(`Item = ${JSON.stringify(item)}, index = ${index}`);
                        return(
                            <TouchableHighlight 
                            onPress={() => {this.onItemPress(index)}}
                            >
                                <Text
                                    style = {{
                                        fontSize : 25,
                                        color : 'red'
                                    }}
                                >{item.memberName}</Text>
                            </TouchableHighlight>
                        )
                    }
                }
                extraData = {this.state.refreshFlatList}
                />

            </View>
        )
    }
}