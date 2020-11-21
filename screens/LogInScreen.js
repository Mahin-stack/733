import React from 'react';
import {View, StyleSheet, Text, TextInput, Alert, KeyboardAvoidingView, Image, TouchableOpacity} from 'react-native';
import db from '../config'
import firebase from 'firebase';

export default class LogInScreen extends React.Component{
    constructor(){
        super()
        this.state={
            emailId: '',
            password: ''
        }
    }
    logIn=async(emailId, password)=>{
        // if we dont write it meANS TRUE
    if(emailId && password){
   try{
 const reponse= await firebase.auth().signInWithEmailAndPassword(emailId, password)
 if(response){
     this.props.navigation.navigate('Transaction')
 }
   }
   catch(error){
       //   error '404 '= code    switch = if    break= else
    switch(error.code){
    case 'User not found' : 
    Alert.alert('User Doesnt exist')
    break;
    case 'Invalid Email':
    Alert.alert('Incorrect Email Or Password')
    }   
   }
    }
    else{
        Alert.alert('Pls Enter The EmailId Again')
    }
    }
render(){
    return(
        <KeyboardAvoidingView style={{alignItems: "center", marginTop: 50}}>
        <View>
        <Image
        source={require('../assets/booklogo.jpg')}
        style={{width: 200, height: 200}}
        />
         <Text style={{textAlign: "center", fontSize:30}}>Wili</Text>
        </View>
        <View>
            <TextInput
            style={styles.inputBox}
            placeholder= 'Enter the Email Id'
            // @ sign will come
            keyboardType='email-address'
            onChangeText={(text)=>{
           this.setState({
               emailId: text
           })
            }}
            />
              <TextInput
            style={styles.inputBox}
            placeholder= 'Enter the password'
            //password will nt be visile
           secureTextEntry={true}
            onChangeText={(text)=>{
           this.setState({
               password: text
           })
            }}
            />
        </View>
        <View>
            <TouchableOpacity style={{height: 30, width: 90, borderWidth: 2, marginTop: 20, padding: 5, borderRadius: 10}}
        onPress={()=>{
            this.logIn(this.state.emailId, this.state.password)
        }}>
            <Text>LogIn</Text>
            </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
        
    )
}
}

const styles = StyleSheet.create({
inputBox:{
    width: 200,
    height: 40,
    borderWidth: 1.5,
    borderRightWidth: 0,
    fontSize: 20
}
})
