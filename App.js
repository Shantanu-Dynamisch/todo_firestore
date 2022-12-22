import React, {useEffect, useState, Component} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Alert,
  ActivityIndicator,
  ScrollView,
  ImageBackground,
} from 'react-native';
import database from '@react-native-firebase/database';
import PushNotification from 'react-native-push-notification';
// import Login from './Screen/login';
export default function App() {
  const [inputTextValue, setInputTextValue] = useState(null);
  const [list, setList] = useState(null);
  const [isUpdateData, setIsUpdateData] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [isloading, setIsloading] = useState(false); // new code
  const [pageCurrent, setPageCurrent] = useState(1); // new code

  useEffect(() => {
    setIsloading(true); //mew code
    getDatabase();
    createChannels();
  }, [pageCurrent]); //new code

  const createChannels = () => {
    PushNotification.createChannel({
      channelId: 'test-channel',
      channelName: 'Test Channel',
    });
  };

  const getDatabase = async () => {
    try {
      // const data = await database().ref('todo').once('value');
      const data = await database()
        .ref('todos')
        .on('value', tempData => {
          console.log(data);
          setList(tempData.val());
        })+pageCurrent;
      setIsloading(false);  // new code
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddData = async () => {
    try {
      if (inputTextValue.length > 0) {
        const index = list.length;
        const response = await database().ref(`todos/${index}`).set({
          value: inputTextValue,
        });

        console.log(response);

        setInputTextValue('');

        PushNotification.localNotification({
          channelId: 'test-channel',
          channelName: 'todo-added',
          message: 'todo added to firebase',
        });
      } else {
        alert('Please Enter Value & Then Try Again');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdateData = async () => {
    try {
      if (inputTextValue.length > 0) {
        const response = await database()
          .ref(`todos/${selectedCardIndex}`)
          .update({
            value: inputTextValue,
          });

        console.log(response);
        setInputTextValue('');
        setIsUpdateData(false);
      } else {
        alert('Please Enter Value & Then Try Again');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleCardPress = (cardIndex, cardValue) => {
    try {
      setIsUpdateData(true);
      setSelectedCardIndex(cardIndex);
      setInputTextValue(cardValue);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCardLongPress = (cardIndex, cardValue) => {
    try {
      Alert.alert('Alert', `Are You Sure To Delete ${cardValue} ?`, [
        {
          text: 'Cancel',
          onPress: () => {
            console.log('Cancel Is Press');
          },
        },
        {
          text: 'Ok',
          onPress: async () => {
            try {
              const response = await database()
                .ref(`todos/${cardIndex}`)
                .remove();

              setInputTextValue('');
              setIsUpdateData(false);
              console.log(response);
            } catch (err) {
              console.log(err);
            }
          },
        },
      ]);

      // setIsUpdateData(true);
      // setSelectedCardIndex(cardIndex);
      // setInputTextValue(cardValue);
    } catch (err) {
      console.log(err);
    }
  };


  const renderFooter = () => {
    return isloading ? (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    ) : null;
  };

  const handleSetLoadmore = () =>{
    // setPageCurrent(pageCurrent + 1)
    // setIsloading(true)
  }

  return (
    <View style={styles.container}>
      {/* <StatusBar hidden={true} /> */}
      {/* <ImageBackground
      source={require('./Image/bgImage.jpg')}
      resizeMode="cover"
      style={styles.imgBackground}
      >

        
      </ImageBackground> */}
      <View>
        {/* <Text
          style={{
            fontSize: 50,
            fontWeight: 'bold',
            marginTop: 50,
            marginBottom: 20,
            color: 'black',
          }}>
          Todo App
        </Text> */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            marginTop: 50,
            marginBottom: 10,
            marginLeft:10,
            color: 'black',
            alignSelf:'center',
          }}>
          Add Your todo..
        </Text>
        <TextInput
          style={styles.inputBox}
          placeholder="Enter Your Todo....."
          value={inputTextValue}
          onChangeText={value => setInputTextValue(value)}
        />
        {!isUpdateData ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddData()}>
            <Text style={{color: '#fff'}}>Add</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleUpdateData()}>
            <Text style={{color: '#fff'}}>Update</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.cardContainer}>
        <Text style={{marginVertical: 20, fontSize: 25, fontWeight: 'bold',color:'black'}}>
          Todo List
        </Text>

        <FlatList
          data={list}
          renderItem={item => {
            const cardIndex = item.index;
            if (item.item !== null) {
              return (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleCardPress(cardIndex, item.item.value)}
                  onLongPress={() =>
                    handleCardLongPress(cardIndex, item.item.value)
                  }>
                  <Text style={{color:"grey"}}>{item.item.value}</Text>
                </TouchableOpacity>
              );
            }
          }}
          ListFooterComponent={renderFooter()}  // new code
          onEndReached={handleSetLoadmore()}  //new code
          onEndReachedThreshold={0} //new code

        />
      </ScrollView>
    </View>
  );
}

const {height, width} = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  inputBox: {
    width: width - 50,
    borderRadius: 15,
    borderWidth: 2,
    marginVertical: 10,
    padding: 10,
    color:'black'
  },
  addButton: {
    backgroundColor: 'orange',
    alignItems: 'center',
    padding: 10,
    borderRadius: 50,
  },
  cardContainer: {
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#fff',
    width: width - 50,
    padding: 20,
    borderRadius: 30,
    marginVertical: 10,

  },
  loader: {
    marginTop: 10,
    alignItems: 'center',
  },
  imgBackground: {
    width: '100%',
    height: '100%',
  },
});

// **** **** ***** *****
// import {
//   StyleSheet,
//   Text,
//   View,
//   TextInput,
//   Dimensions,
//   TouchableOpacity,
//   FlatList,
//   ScrollView,
//   Alert,
//   alert,
// } from 'react-native';
// import React, {useEffect, useState} from 'react';
// import database from '@react-native-firebase/database';

// const App = () => {
//   const [inputTextValue, SetinputTextValue] = useState('');
//   const [list, Setlist] = useState([]);
//   const [isUpdateData, SetisUpdateData] = useState(null);
//   const [seletedCardIndex, setSeletedCardIndex] = useState(null);

//   // useEffect(() => {
//   //   console.log("useeffect called")
//   //   getDatabase();
//   // }, []);

//   // const getDatabase = async () => {
//   //   console.log("GetDatabase function called")
//   //   try {
//   //     // const data = await database().ref('todo').once('value');
//   //     const data = await database()
//   //       .ref('todo1')
//   //       .on('value', tempData => {
//   //         console.log(data);
//   //         console.log(tempData.val())
//   //         Setlist(tempData.val());

//   //       });
//   //   } catch (error) {
//   //     console.log('error', error);
//   //   }
//   // };

//   const handleAddData = async () => {
//     console.log("handelAddData function called")
//     // try {
//     //   if (inputTextValue.length > 0) {
//     //     console.log("inputTextValue = ", inputTextValue)
//     //     const index = list.length ;
//     //     console.log("list.length  = ", list.length )
//     //     const response = await database().ref(`todo1/${index + 1}`).set({
//     //       value: inputTextValue,
//     //     });
//     //     console.log('Hello2');
//     //     console.log(response);
//     //     SetinputTextValue('');
//     //   } else {
//     //     alert('Please enter value');
//     //   }
//     // } catch (error) {
//     //   console.log(error);
//     // }
//     try {
//       const response = await database().ref('todos/5').set({
//         value:inputTextValue,
//       });
//       console.log(response);
//     } catch (error) {
//       console.log(error)
//     }
//   };

//   const handleUpdateData = async () => {
//     try {
//       if (inputTextValue.length > 0) {
//         const response = await database()
//           .ref(`todo1/${seletedCardIndex}`)
//           .update({
//             value: inputTextValue,
//           });
//         console.log(response);
//         SetinputTextValue('');
//         SetisUpdateData(false);
//       } else {
//         alert('Please enter value');
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const handleCardPress = (cardIndex, cardValue) => {
//     try {
//       SetisUpdateData(true);
//       setSeletedCardIndex(cardIndex);
//       SetinputTextValue(cardValue);
//       console.log(cardIndex);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const handleCardLongPress = (cardIndex, cardValue) => {
//     Alert.alert('Alert ', `Are You Sure To Delete ${cardValue}`, [
//       {
//         text: 'Cancel',
//         onPress: () => {
//           console.log('Cancel is pressed !! ');
//         },
//       },
//       {
//         text: 'Ok',
//         onPress: async () => {
//           try {
//             const response = await database().ref(`todo1/${cardIndex}`).remove();
//             SetinputTextValue('');
//             SetisUpdateData(false);
//             console.log(response);
//           } catch (error) {
//             console.log(error);
//           }
//         },
//       },
//     ]);
//     // SetisUpdateData(true);
//     // setSeletedCardIndex(cardIndex);
//     // SetinputTextValue(cardValue);
//     // console.log(cardIndex);
//     try {
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return (
//     <View style={styles.body}>
//       <View>
//         <Text style={styles.heading}>TODO App</Text>
//         <TextInput
//           style={styles.inputtext}
//           placeholder="Enter You'r todo"
//           value={inputTextValue}
//           onChangeText={value => SetinputTextValue(value)}
//         />
//         {!isUpdateData ? (
//           <TouchableOpacity
//             disabled={! list.length}
//             style={styles.addButton}
//             onPress={() => handleAddData()}>
//             <Text style={styles.buttText}>Add Todo</Text>
//           </TouchableOpacity>
//         ) : (
//           <TouchableOpacity
//             style={styles.addButton}
//             onPress={() => handleUpdateData()}>
//             <Text style={styles.buttText}>Update Todo</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       <View style={styles.cardContainer}>
//         <Text
//           style={{
//             marginVertical: 20,
//             fontSize: 40,
//             fontWeight: 'bold',
//             color: 'black',
//           }}>
//           TODO List
//         </Text>

//         <FlatList
//           data={list}
//           renderItem={item => {
//             const cardIndex = item.index;
//             console.log(item);
//             if (item.item != null) {
//               return (
//                 <TouchableOpacity
//                   style={styles.card}
//                   onPress={() => handleCardPress(cardIndex, item.item.value)}
//                   onLongPress={() =>
//                     handleCardLongPress(cardIndex, item.item.value)
//                   }>
//                   <Text style={styles.cardText}>{item.item.value}</Text>
//                 </TouchableOpacity>
//               );
//             }
//           }}
//         />
//       </View>
//     </View>
//   );
// };

// export default App;

// const {height, width} = Dimensions.get('screen');

// const styles = StyleSheet.create({
//   body: {
//     flex: 1,
//     alignItems: 'center',
//     backgroundColor: 'white',
//   },
//   heading: {
//     marginTop:100,
//     fontSize: 50,
//     fontWeight: 'bold',
//     color: 'black',
//   },
//   inputtext: {
//     width: width - 30,
//     borderRadius: 15,
//     borderWidth: 2,
//     marginTop: 20,
//     color: 'black',
//     fontSize:20,
//   },
//   addButton: {
//     backgroundColor: 'orange',
//     alignItems: 'center',
//     padding: 10,
//     borderRadius: 10,
//     marginTop: 20,
//     // width:200,
//   },
//   buttText: {
//     color: 'white',
//     fontSize:20,
//   },
//   cardContainer: {
//     marginVertical: 20,
//     elevation: 10,
//   },
//   card: {
//     backgroundColor: '#d3d3d3',
//     width: width - 50,
//     padding: 20,
//     borderRadius: 15,
//     marginVertical: 10,
//   },
//   cardText: {
//     color:'black',
//     fontSize:18,
//   },
// });

// *****************************************************
// import {StyleSheet, Text, View} from 'react-native';
// import React, {useEffect, useState} from 'react';
// import firestore from '@react-native-firebase/firestore';

// const App = () => {
//   const [myData, setMydata] = useState(null);
//   useEffect(() => {
//     GetDatabase();
//   }, []);

//   const GetDatabase = async () => {
//     try {
//       const data = await firestore()
//         .collection('testing')
//         .doc('aaKoJFm7JPFAfEuzgZ9l')
//         .get();
//       console.log(data._data);
//       setMydata(data._data);
//     } catch (error) {
//       console.log('error', error);
//     }
//   };
//   return (
//     <View>
//       <Text>Name: {myData ? myData.name : 'Loading...'}</Text>
//       <Text>Age: {myData ? myData.age : 'Loading...'}</Text>
//       <Text>
//         Hobby: {myData ? myData.hobby.map(list => list) : 'Loading...'}
//       </Text>
//     </View>
//   );
// };

// export default App;

// const styles = StyleSheet.create({});

// ***************************88

// import {
//   StyleSheet,
//   Text,
//   View,
//   TextInput,
//   Dimensions,
//   TouchableOpacity,
//   FlatList, } from 'react-native'
// import React, {useEffect, useState} from 'react';
// import database from '@react-native-firebase/database';

// const App = () => {
//   const [inputTextValue, SetInputTextvalue] = useState(null);
//   const [list, Setlist] = useState(null);

//   const handleAddData = async()=>{
//     try {
//       const response = await database().ref('todos/2').set({
//         value:inputTextValue
//       });
//       console.log(response);
//     } catch (error) {
//       console.log(error)
//     }
//     console.log('hello')
//   }

//   return (
//     <View style={styles.body}>
//       <View>
//         <Text style={{textAlign: 'center', fontSize: 30, fontWeight: 'bold',color:'black'}}>
//           TODO Appp
//         </Text>
//         <TextInput
//           style={styles.inputtext}
//           placeholder="Enter You'r todo"
//           value={inputTextValue}
//           onChangeText={value => SetInputTextvalue(value)}
//         />
//         <TouchableOpacity
//           style={styles.addButton}
//           onPress={() => handleAddData()}>
//           <Text style={styles.buttText}>Add</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   )
// }

// export default App

// const {height, width} = Dimensions.get('screen');

// const styles = StyleSheet.create({
//   body: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   inputtext: {
//     width: width - 30,
//     borderRadius: 15,
//     borderWidth: 2,
//     marginTop: 50,
//   },
//   addButton: {
//     backgroundColor: 'orange',
//     alignItems: 'center',
//     padding: 10,
//     borderRadius: 50,
//     marginTop: 20,
//   },
//   buttText: {
//     color: 'white',
//   },
// })
