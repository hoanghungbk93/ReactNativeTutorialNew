import React, {Component} from 'react'
import {View, Image, Text, TextInput, Alert, FlatList, TouchableHighlight, Dimensions} from 'react-native'
const PhoneWidth = Dimensions.get('window').width
export default class MainMenu extends Component{
    constructor(props)
    {
        super(props)
        this.state = {
            dataList : [
                {
                    name : "hung"
                },
                {
                    name : 'chip'
                }
            ],
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
                                if(this.state.currentProjectName.lenght != 0)
                                {
                                    currentDataList = this.state.dataList
                                    currentDataList.push({name : this.state.currentProjectName})
                                    this.setState(
                                        {
                                            dataList : currentDataList,
                                            refreshFlatList : !this.state.refreshFlatList
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
                                >{item.name}</Text>
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