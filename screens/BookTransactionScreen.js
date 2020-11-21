import React from 'react';
import { Text,View,TouchableOpacity,TextInput,Image,  StyleSheet,  KeyboardAvoidingView ,ToastAndroid,Alert} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase'
import db from '../config.js'

export default class BookTransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal',
        transactionMessage: ''
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="bookid"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }                   // from databaser
      else if(buttonState==="studentid"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }

    initiateBookIssue = async()=>{
      //add a transaction
      db.collection("transactions").add({
        // var we created
        'studentId': this.state.scannedStudentId,
        'bookId' : this.state.scannedBookId,
        'date' : firebase.firestore.Timestamp.now().toDate(),
        'transactionType': "Issue"
      })
      //change book status
      db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability': false
      })
      //change number  of issued books for student
      db.collection("students").doc(this.state.scannedStudentId).update({
        'noOfBooksIssued': firebase.firestore.FieldValue.increment(1)
      })
    }

    initiateBookReturn = async()=>{
      //add a transaction
      db.collection("transactions").add({
        'studentId': this.state.scannedStudentId, 
        'bookId' : this.state.scannedBookId,
        'date' : firebase.firestore.Timestamp.now().toDate(),
        'transactionType': "Return"
      })
      //change book status
      db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability': true
      })
      //change number  of issued books for student
      db.collection("students").doc(this.state.scannedStudentId).update({
        'noOfBooksIssued': firebase.firestore.FieldValue.increment(-1)
      })
    }

 handleTransaction=async()=>{
   var transactionType = await this.checkBookEligiblity()
   if(!transactionType){
     Alert.alert('Book Does Not exist in the library database')
   this.setState({
     scannedStudentId: '', 
     scannedBookId : '',
   })
    }
    else if(transactionType=== 'Issue'){
                                    
      var isStudentEligible= await this.checkStudentEligiblityForBookIssue()
    if(isStudentEligible){
      this.initiateBookIssue()
      Alert.alert('Book issued to the student')
    }
    }
    else{
      var isStudentEligible= await this.checkStudentEligiblityForBookReturn()
      if(isStudentEligible){
        this.initiateBookReturn()
        Alert.alert('book returned by the student')
      }
    }
 }
 checkStudentEligiblityForBookIssue=async()=>{
// var = const
  const studentRef=await db.collection('students').where('studentid', '==', this.state.scannedStudentId).get()
  var isStudentEligible= ''
  if(studentRef.docs.length === 0){
    this.setState({
      scannedStudentId: '',
      scannedBookId: ''
    })
    isStudentEligible=false
Alert.alert('studentid does not exist in the databse')

  }
  else{               //doc is a variable here
    studentRef.docs.map(doc =>{
 var student = doc.data()
 if(student.noOfBooksIssued < 2){
   isStudentEligible= trure
 }
 else{
   isStudentEligible=false
   Alert.alert('2 books issued already')
   this.setState({
     scannedBookId: '',
     scannedStudentId: ''
   })
 }
    })
  }
  return isStudentEligible
 }
 checkStudentEligiblityForBookReturn=async()=>{
  // var = const
    const transactionRef=await db.collection('transactions').where('bookid', '==', this.state.scannedBookId).get()
    var isStudentEligible= ''
    transactionRef.docs.map(doc =>{
      var lastBookTransaction =doc.data()
      if(lastBookTransaction.studentid === this.state.scannedBookId){
        isStudentEligible =true
      }
      else{
        isStudentEligible=false
        Alert.alert('the book wasnt taken by the student')
      this.setState({
        scannedStudentId: '',
        scannedBookId: '',
      })
      }
    })
    return isStudentEligible
 }
 checkBookEligiblity=async()=>{
   const bookref = await db.collection('books').where('bookid', '==', this.state.scannedBookId).get()
   var transactionTypes = ''
   if(bookref.docs.length=== 0){
transactionTypes= false
   }
  else{
    bookref.docs.map(doc =>{
      var book = doc.data()
      if(book.bookAvailability){
        transactionTypes= 'Issue'
      }
      else{
        transactionTypes= 'Return'
      }
    })
  }
  return transactionTypes
 }
    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView  style={styles.container} behavior="padding" enabled>
            <View>
              <Image
                source={require("../assets/book.png")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText={text =>this.setState({scannedBookId:text})}
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("bookid")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>

            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText ={text => this.setState({scannedStudentId:text})}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("studentid")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={async()=>{
                var transactionMessage = this.handleTransaction();
                this.setState(
                  {scannedBookId:'',
                   scannedStudentId:''})
              }}>
          <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
      backgroundColor: '#FBC02D',
      width: 100,
      height:50
    },
    submitButtonText:{
      padding: 10,
      textAlign: 'center',
      fontSize: 20,
      fontWeight:"bold",
      color: 'white'
    }
  });