import React from 'react';
import { Text, View, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import db from '../config'
import firebase from 'firebase'

export default class SearchScreen extends React.Component {
  constructor(props){
    super(props)
    this.state={
      allTransactions: [],
      lastVisibleTransaction: null,
      search: '',
    }
  }
  componentDidMount=async()=>{
                                            // only 10 list in the screen
   const querry = await db.collection('transactions').limit(10).get()
   querry.docs.map(doc =>{
     this.setState({
                // spread operator= ... = it doesnt allow the orignal array to change it adds the new data to the array 
       allTransactions: [...this.state.allTransactions, doc.data()],
       lastVisibleTransaction: doc,
     })
   }) 
  }
  fetchMoreTransactions= async()=>{
    var text= this.state.search.toUpperCase()
    var enteredText= text.split(' ')
    if(enteredText[0].toUpperCase()=== 'B'){
    const querry= await db.collection('transcations').where('bookid', '==', text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
  querry.docs.map(doc =>{
    this.setState({
      allTransactions: [...this.state.allTransactions, doc.data()],
      lastVisibleTransaction: doc,
    })
  }) 
  }
  else if(enteredText[0].toUpperCase()=== 'S'){
    const querry= await db.collectio('transactions').where('studentid', '==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
  querry.docs.map(doc =>{
    this.setState({
      allTransactions: [...this.state.allTransactions, doc.data()],
      lastVisibleTransaction: doc,
    })
  })
  }
  }
  searchTransactions= async(text)=>{
var enteredText= text.split(' ')
var text=text.toUpperCase()
if(enteredText[0].toUpperCase()=== 'B'){
  const transaction= await db.collection('transactions').where('bookid', '==', text).get()
  transaction.docs.map(doc =>{
    this.setState({
      allTransactions: [...this.state.allTransactions, doc.data()],
      lastVisibleTransaction: doc,
    })
  })
}
else if(enteredText[0].toUpperCase()=== 'S'){
  const transaction= await db.collectio('transactions').where('studentid', '==',text).get()
transaction.docs.map(doc =>{
  this.setState({
    allTransactions: [...this.state.allTransactions, doc.data()],
    lastVisibleTransaction: doc,
  })
})
}
  }
    render() {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style= {styles.searchBar}>
            <TextInput
            style={styles.bar}
            placeholder= 'Enter the Id'
            onChangeText={(text)=>{
              this.setState({
                search: text
              })
            }}
            /> 
<TouchableOpacity
style={styles.searchbutton}
onPress={()=>{
  this.searchTransactions(this.state.search)
}}
>
  <Text>Search</Text>
</TouchableOpacity>
          </View>
          <FlatList
          data= {this.state.allTransactions}
          //typical syntax
          renderItem={({item})=>{
          <View style={{borderBottomWidth: 2}}>
          <Text>{'Book Id' + item.bookid}</Text>
          <Text>{'Student Id' + item.studentid}</Text>
          <Text>{'Transaction Type' + item.transactionType}</Text>
          <Text>{'Date' + item.date.toDate()}</Text>
          </View>
          }}
          keyExtractor={(item, index)=>index.toString()}
          onEndReached={this.fetchMoreTransactions}
          onEndReachedThreshold={0.7}
          />
        </View>
      );
    }
  }
  const styles= StyleSheet.create({
    container:{
flex: 1,
marginTop: 20,
    },
    searchBar:{
flexDirection: 'row',
height: 35,
width: 'auto',
borderWidth: 1,
alignItems: 'center',
backgroundColor: 'grey',
    },
bar:{
  borderBottomWidth: 2,
  height: 30,
  width: 300,
  paddingLeft: 10,
},
searchBar:{
borderWidth: 1,
height: 35,
width: 50,
alignItems: 'center',
justifyContent: 'center',
backgroundColor: 'green',
},
  })