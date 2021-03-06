'use strict';
 
var React = require('react-native');
var Main = require('./mainView.ios.js');
var FBLogin = require('react-native-facebook-login');
var FBLoginManager = require('NativeModules').FBLoginManager;


var {
  StyleSheet,
  TouchableHighlight,
  View,
  Text,
  Component,
  TextInput,
  Image,
  AlertIOS,
  NativeModules,
  NetInfo,
  
} = React;

var styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#1B2B32',
	},
  fbLogo: {
    width:300,
    height:45,
    backgroundColor:'#125989',
    marginTop:20,
    borderRadius:10,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  fbLogoText: {
    textAlign:'center',
    color:'#FFFFFF',
    fontSize:20,
  },
  logo: {
    width:400,
    height:400,
  }

});



class LoginView extends Component {
  constructor(props){
    super(props);
    this.state = {
      loggedIn:false,
      userId: '',
      facebookId: '',
      
    }
  }


  //allow user to proceed to main events
  isAuthorized(loginState){
    var self = this;
    console.log('moving on!')
    if (loginState){
      this.props.navigator.push({
        title: "Tessellate",
        component:Main,
        passProps:{facebookId:this.state.facebookId,
        profilePicture:'.img',
        navRef: this.props.refs
        }
      })
      this.props.refs.setState({navBarHidden:true}) 
    }
  }

  

  //login using facebookID
  login(facebookId) {

    var self = this;
    var loginObject = {  
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': '',
        //'Host': 'http://10.6.1.173:8081'
      },
      body: JSON.stringify({
         facebookId:facebookId,
         name: 'Jonathan'
       })
    }


    fetch('http://tessellate-penguin.herokuapp.com/user', loginObject)  
      .then(function(res) {
        return res.json();
       })
      .then(function(resJson) {
        self.setState({facebookId:facebookId},function(){
          self.isAuthorized(self.state.user);
        })
        
        return resJson;
       })
      .catch((error) => {
        AlertIOS.alert(
           'Whoa! Something Went Wrong.',
           error.message,
           [
             {text: 'Try Again', onPress: () => {}}
           ]
         );

      });
  }

  render() {
    var _this = this;
    return (

      <View style={styles.container}>
        <Image resizeMode='contain' source={require('image!mainLogo')} style={styles.logo}/>
        
         <FBLogin style={{ marginBottom: 10, }}
        permissions={["email","user_friends","public_profile"]}
        onLogin={function(data){
        
            
               _this.setState({ user : data.credentials },function(){
                _this.login(data.credentials.userId);
              });
            
          
        }}
        onLogout={function(){
          //console.log("Logged out.");
          _this.setState({ user : null });
        }}
        onLoginFound={function(data){
          //console.log("Existing login found.");
          //console.log(data);
         
               _this.setState({ user : data.credentials },function(){
                _this.login(data.credentials.userId);
              });
            

        }}
        onLoginNotFound={function(){
          //console.log("No user logged in.");
          _this.setState({ user : null });
        }}
        onError={function(data){
          //console.log("ERROR");
          //console.log(data);
        }}
        onCancel={function(){
          //console.log("User cancelled.");
        }}
        onPermissionsMissing={function(data){
          //console.log("Check permissions!");
          //console.log(data);
        }}
      />

      </View>
      
    );
  }

  
}


module.exports = LoginView;