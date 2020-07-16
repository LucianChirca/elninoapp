import { StatusBar } from 'expo-status-bar';
import React, { useState, setState } from "react";
import { StyleSheet, View, Dimensions, TouchableOpacity, Text, ScrollView, TextInput, Modal, Button, RefreshControl, TouchableHighlight } from 'react-native';
import {Block, Icon} from 'galio-framework'
import theme from './constants/theme.js'
import axios from 'axios'
import { Hoshi } from 'react-native-textinput-effects';
const { width, height } = Dimensions.get('screen');
import ActionSheet from 'react-native-actionsheet'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Searchbar } from 'react-native-paper';
import Swipeable from 'react-native-swipeable-row';

const localIp = 'http://192.168.1.7:3000/'
const oneDay = 24 * 60 * 60 * 1000
console.disableYellowBox = true;

export default function App() {
   const [todoItems, updateItems] = useState([]);
   const [modalVisible, updateModalVisible] = useState(false);
   const [actionSheet, updateActionSheetRef] = useState();
   const [newItemPriority, updateNewItemPriority] = useState(-1);
   const [isDatePickerVisible, updateDatePickerVisibility] = useState(false);
   const [newItemDate, updateNewItemDate] = useState();
   const [newItemTitle, updateNewItemTitle] = useState();
   const [newItemNotes, updateNewItemNotes] = useState();
   const [refreshing, setRefreshing] = React.useState(false);
   const [searchQuery, setSearchQuery] = React.useState('');
   let todayMidnight = new Date(Date.now())
   todayMidnight.setHours(0,0,0,0);
   const [currentDay, setCurrentDay] = React.useState(todayMidnight);


   const weekday = new Array(7)
   weekday[0]="Monday";
   weekday[1]="Tuesday";
   weekday[2]="Wednesday";
   weekday[3]="Thursday";
   weekday[4]="Friday";
   weekday[5]="Saturday";
   weekday[6]="Sunday";

   const dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit'})
   const [{ value: mo },,{ value: da },,{ value: ye }] = dtf.formatToParts(currentDay)
   const dayOfWeek = new Date(currentDay).getDay()

   const priorityOptions = ['High', 'Medium', 'Low', 'Cancel']


   function toggleCompleteTodoItem(id){
     updateItems([...todoItems].map(object => {
            if(object.id === id) {
              uploadChanges(id, object.title, !object.done)
              return {
                ...object,
                done: !object.done
              }
            }
            else return object;
          }))

   }

   function removeTodoItem(id){
     updateItems([...todoItems].filter(object => {
            return object.id !== id
          }))

   }

   function editTitle(id, text){
     updateItems([...todoItems].map(object => {
            if(object.id === id) {
              return {
                ...object,
                title: text
              }
            }
            else return object;
          }))
   }

   function toggleModal(){
     if (!modalVisible){
       updateNewItemDate(new Date())
       updateNewItemTitle("")
       updateNewItemNotes("")
       updateNewItemPriority("")
     }
    updateModalVisible(!modalVisible)
   }


   function getAllTodoItems(callback){
     axios({
     method: 'get',
     url: localIp + 'todoItems',
     headers:  {
       'Content-Type': 'application/json',
     },
     }).then(response=>{
       let data = response.data
       data.sort((a,b) => a.done < b.done)
       updateItems(response.data)
       callback()
       //alert(JSON.stringify(response.data))
     }).catch(err => {
       alert(err)
     })
   }

  function onFabPress(){
    toggleModal()
  }

  function getDateFromTimestamp(timestamp){
    let date = new Date(timestamp)
    const dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit'})
    const [{ value: mo },,{ value: da },,{ value: ye }] = dtf.formatToParts(date)
    return da + '/' + mo + '/' + ye
  }

  function getDateFromObj(date){
    const dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit'})
    const [{ value: mo },,{ value: da },,{ value: ye }] = dtf.formatToParts(date)
    return da + '/' + mo + '/' + ye
  }


  function getTimeFromTimestamp(timestamp){
    let date = new Date(timestamp)
    return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0')
  }

  function showActionSheet(){
    actionSheet.show()
  }

  function rightButtonPress(id){
    axios({
    method: 'delete',
    url: localIp + 'todoItems/' + id,
    headers:  {
      'Content-Type': 'application/json',
    },
    }).then(response=>{
      removeTodoItem(id)
      //alert("Success!")
      //alert(JSON.stringify(response.data))
    }).catch(err => {
      alert(err)
    })
  }

  function uploadChanges(id, title, done){
    let toSend={
      title: title,
      done: done
    }

    axios({
    method: 'put',
    url: localIp + 'todoItems/' + id,
    headers:  {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(toSend)
    }).then(response=>{
      //alert("Success!")
      //alert(JSON.stringify(response.data))
    }).catch(err => {
      alert(err)
    })
  }

  function submit(){
    let toSend = [{
      title: newItemTitle,
      notes: newItemNotes,
      priority: newItemPriority,
      dueDate: newItemDate.getTime(),
      categoryId: 1
    }]

    axios({
    method: 'post',
    url: localIp + 'todoItems',
    headers:  {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(toSend)
    }).then(response=>{
      updateModalVisible(false)
      //alert("Success!")
      //alert(JSON.stringify(response.data))
    }).catch(err => {
      alert(err)
    })

  }

  const showDatePicker = () => {
   updateDatePickerVisibility(true);
 };

 const hideDatePicker = () => {
   updateDatePickerVisibility(false);
 };

 const handleConfirm = (date) => {
   updateNewItemDate(date)
   hideDatePicker();
 };

 const onRefresh = ()=>{
   setRefreshing(true)
   getAllTodoItems(function(){
     setRefreshing(false)
   })
 }

const onChangeSearch = query => {
  setSearchQuery(query);
}




const rightButtons = [
  <TouchableHighlight onPress={rightButtonPress} style={{backgroundColor:theme.COLORS.WARNING_RED, flex:1,justifyContent:'center', bottom:3}}><Icon name="cross" family="entypo" color="white" size={60}/></TouchableHighlight>
];

function getRightButtons(id){
  return [
    <TouchableHighlight onPress={()=>rightButtonPress(id)} style={{backgroundColor:theme.COLORS.WARNING_RED, flex:1,justifyContent:'center', bottom:3}}><Icon name="cross" family="entypo" color="white" size={60}/></TouchableHighlight>
  ];
}



  return (
    <Block style={styles.container}>

    <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" >
    <Block class="modalContent" style={styles.modalContent}>
    <Block style={styles.textInputs}>
      <Hoshi
      label={'Title'}
      borderColor={theme.COLORS.FAB_BG_COLOR}
      borderHeight={1}
      inputPadding={10}
      value={newItemTitle}
      onChangeText={(text)=>updateNewItemTitle(text)}
    />
      <Hoshi
      label={'Notes'}
      borderColor={theme.COLORS.FAB_BG_COLOR}
      borderHeight={1}
      inputPadding={10}
      value={newItemNotes}
      onChangeText={(text)=>updateNewItemNotes(text)}
    />
    <Block style={{
      marginTop:20,
      paddingBottom:10,
      borderBottomWidth: 1,
      borderBottomColor: 'gray'
    }} row space="between">
        <Text style={{color:theme.COLORS.TEXT_COLOR, marginLeft:10, fontWeight:'bold'}} onPress={showActionSheet}>Priority</Text>
        <Text style={{color:theme.COLORS.TEXT_COLOR, marginRight:10}} onPress={showActionSheet}>{newItemPriority >= 0 ? priorityOptions[newItemPriority]:"None"}</Text>
        <ActionSheet
          ref={o => updateActionSheetRef(o)}
          title={'Please select from below'}
          options={priorityOptions}
          cancelButtonIndex={3}
          destructiveButtonIndex={3}
          onPress={(index) => { if (index < 3){updateNewItemPriority(index)}}}
        />
      </Block>
      <Block style={{
        marginTop:20,
        paddingBottom:10,
        borderBottomWidth: 1,
        borderBottomColor: 'gray'
      }} row space="between">
      <Text style={{color:theme.COLORS.TEXT_COLOR, marginLeft:10, fontWeight:'bold'}} onPress={showDatePicker}>Due Date</Text>
      <Text style={{color:theme.COLORS.TEXT_COLOR, marginRight:10}} onPress={showDatePicker}>{getDateFromObj(newItemDate)}</Text>
      <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
      </Block>
      <Block style={{marginTop:50}}>
      <Button onPress={submit} title="Submit new item"/>
      </Block>
  </Block>
    </Block>
    </Modal>

      <Block style={[styles.todoContainer, styles.shadow]}>

        <Block class="header" style={styles.header}>
          <Block class="currentDay" row space="between">

            <Block row >
              <Text style={{fontSize:50, color:theme.COLORS.TEXT_COLOR}}>
              {da}
              </Text>
              <Block style={{justifyContent:'center'}}>
                <Text style={{fontSize:18, color:theme.COLORS.TEXT_COLOR, fontWeight:'bold'}}>
                {mo}
                </Text>
                <Text style={{fontSize:18, color:theme.COLORS.TEXT_COLOR}}>
                {ye}
                </Text>
              </Block>

            </Block>
            <Block style={{justifyContent:'center'}}>
              <Icon name="angle-right" family="font-awesome" size={28}/>
            </Block>

            <Block right style={{justifyContent:'center'}}>
            <Text style={{fontSize:15, color:theme.COLORS.TEXT_COLOR}}>{weekday[dayOfWeek - 1].toUpperCase()}</Text>
            </Block>


          </Block>
      <Block style={{marginTop:10}}>
          <Searchbar
      placeholder="Search"
      onChangeText={onChangeSearch}
      value={searchQuery}
    />
    </Block>
        </Block>


        <Block class="todoItems" style={styles.todoItems}>
        <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        >
        {
          todoItems.filter((item)=>{
            let satisfiesQuery = item.title.toUpperCase().includes(searchQuery.toUpperCase()) || item.title.toUpperCase().indexOf(searchQuery.toUpperCase()) > -1
            let satisfiesDate = item.dueDate >= currentDay.getTime() && item.dueDate < currentDay.getTime() + oneDay
            return satisfiesQuery && satisfiesDate
          }).map((todo) => {
           return (
             <Swipeable key={todo.id} rightButtons={getRightButtons(todo.id)}>
             <Block class="todoItem"  style={styles.todoItem} row space="between">
              <Block class="todoItemText" style={styles.todoItemtext} left>
                <Block row>
                {
                  todo.priority !== null &&
                  <Block style={{justifyContent:'center', top:3, marginRight:3}}>
                    <Icon size={18} name="exclamation" family="font-awesome-5" color={todo.done ? 'gray' :theme.COLORS.EXCLAMATION_ARRAY[todo.priority]}/>
                  </Block>
                }
                <Block style={{width:180}}>
                  <TextInput
                  value={todo.title}
                  onChangeText={(text)=>editTitle(todo.id, text)}
                   style={{
                    color: todo.done ? theme.COLORS.DONE_TEXT_COLOR : theme.COLORS.TODO_TEXT_COLOR,
                    textDecorationLine: todo.done ? 'line-through': 'none',
                    fontSize: 18,
                    paddingTop: 10,
                    paddingBottom:5,
                  }} />
                </Block>
                </Block>
                  <Text
                  style={{
                    color: todo.done ? 'lightgray': 'gray',
                    paddingBottom: 7
                  }}
                  >
                  {"Due " + getDateFromTimestamp(todo.dueDate)}
                  </Text>
                </Block>
              <Block right style={{justifyContent:'center'}}>
                <TouchableOpacity onPress={()=>toggleCompleteTodoItem(todo.id)}>
                  <Icon color={todo.done ? theme.COLORS.DONE_ICON_COLOR : theme.COLORS.TEXT_COLOR} name={todo.done? "check-circle" : "circle"} family="feather" size={25}/>
                </TouchableOpacity>
              </Block>
             </Block>
             </Swipeable>
           );
        })}
        </ScrollView>
        </Block>





        <Block class="fab" style={[styles.fab, styles.shadow]}>
          <TouchableOpacity onPress={onFabPress} style={{alignItems:'center', justifyContent:'center', flex:1}}>
              <Icon name="plus" family="entypo" size={50} color={theme.COLORS.DARK_FAB_COLOR}/>
          </TouchableOpacity>
        </Block>
        <StatusBar style="auto" />
      </Block>
    </Block>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    height: height *0.45,
  },
  modalContent: {
    justifyContent:'center',
    alignItems:'center',
    flex:1
  },
  textInputs: {
    width: width * 0.8
  },
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.BACKGROUND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding:20
  },
  todoItems: {
    marginRight: 20,
    marginLeft: 30
  },
  todoItem: {
    marginVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  todoItemText: {

  },
  todoContainer: {
    height: height * 0.8,
    width: width * 0.85,
    backgroundColor: 'white'
  },
  fab: {
    height: theme.SIZES.FAB_SIZE,
    width: theme.SIZES.FAB_SIZE,
    backgroundColor: theme.COLORS.FAB_BG_COLOR,
    borderRadius: theme.SIZES.FAB_SIZE/ 2,
    position:'absolute',
    bottom:-theme.SIZES.FAB_SIZE/2,
    alignSelf:'center',
    shadowOpacity: 0.8,
  },
  shadow: {
    shadowColor: theme.COLORS.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.35,
  }
});
