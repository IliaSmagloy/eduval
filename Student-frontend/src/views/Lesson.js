/* eslint jsx-a11y/anchor-is-valid: 0 */
import history from '../history';
import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardFooter,
  Badge,
  Button,
  CardHeader,
  ListGroup,
  ListGroupItem,
  Form,
  Slider,
  FormInput,
  FormCheckbox,
  Alert
} from "shards-react";
import TimeoutAlert from "../components/common/TimeoutAlert";
import Colors from "../components/components-overview/Colors";
import Checkboxes from "../components/components-overview/Checkboxes";
import RadioButtons from "../components/components-overview/RadioButtons";
import ToggleButtons from "../components/components-overview/ToggleButtons";
import SmallButtons from "../components/components-overview/SmallButtons";
import SmallOutlineButtons from "../components/components-overview/SmallOutlineButtons";
import NormalButtons from "../components/components-overview/NormalButtons";
import NormalOutlineButtons from "../components/components-overview/NormalOutlineButtons";
import Forms from "../components/components-overview/Forms";
import FormValidation from "../components/components-overview/FormValidation";
import CompleteFormExample from "../components/components-overview/CompleteFormExample";
import ProgressBars from "../components/components-overview/ProgressBars";
import ButtonGroups from "../components/components-overview/ButtonGroups";
import InputGroups from "../components/components-overview/InputGroups";
import SeamlessInputGroups from "../components/components-overview/SeamlessInputGroups";
import CustomFileUpload from "../components/components-overview/CustomFileUpload";
import DropdownInputGroups from "../components/components-overview/DropdownInputGroups";
import CustomSelect from "../components/components-overview/CustomSelect";
import CoinImage from "../images/midEcoin.png"
import PageTitle from "../components/common/PageTitle";

import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import { withStyles } from '@material-ui/core/styles';
import StudentMessageCard from "../components/lessonCards/StudentMessageCard";

import awsIot  from 'aws-iot-device-sdk';
import "./Lesson.css";
import server from "../Server/Server"
import iotclient from "../iotClient/iotClient"
import { withTranslation } from 'react-i18next';

const headers = {
    'Authorization': 'Bearer ' + localStorage.getItem('idToken')
};
const EmojiEnum = {
      "EMOJI_HAPPY": "🙂",
      "EMOJI_THUMBS_UP" : "👍",
      "EMOJI_ANGEL": "👼",
      "EMOJI_GRIN":"😄",
      "EMOJI_SHUSH":"🤐",
      "EMOJI_ZZZ":"😴",
      "EMOJI_ANGRY":"😠",
      "EMOJI_THUMBS_DOWN":"👎"
};

var client;

const styles = theme => ({
  card: {
    maxWidth: 345,
    marginBottom: '30px ',
  },

  card_in_lesson: {
    maxWidth: 345,
    marginBottom: '30px ',
    backgroundColor: "#77dd77"
  },

  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  play: {
    color: "#77dd77",
    // transform: 'scale(1) translate(0%, 5%)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  play_pushed: {
    color: "Gold",
    marginLeft: 'auto',
    // transform: 'scale(1.2) translate(-10%, 5%)',
  },

  play_disabled:{
    color: "Silver",
    marginLeft: 'auto'
  },

  title:{
    color: "DarkBlue",
  },

  delete:{
    color: "red"
  },

  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    color: "white",
    backgroundColor: "DarkGreen",
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },

  delete_confirmation:
  {
    width: "50%",
    position: 'relative',
  }
});



class Lesson extends React.Component {

  constructor(props) {
      super(props);

  this.state = {

      reward_money : 0,
      lesson_id : props.match.params.id,
      student_id : localStorage.getItem('sub'),
      chosen_smile : -1,
      chosen_message : -1,
      showing_messages: false,
      message_modal_open: false,

      name: "Lesson",
      teacherId: 0,
      location: "string",
      description: "string",

        messageRows: [{
            message: "I have a question",
            enum: "MESSAGE_QUESTION",
            color:"Tomato",
            id: 0
        },
        {
            message: "May I go out?",
            enum: "MESSAGE_NEED_TO_LEAVE",
            color:"Orange",
            id: 1
        },
        {
            message: "I know the answer!",
            enum: "MESSAGE_ANSWER",
            color:"MediumSeaGreen",
            id: 2
        },
        {
            message: "I didn't understand",
            enum: "MESSAGE_CONFUSED",
            color:"Violet",
            id: 3
        },
        {
            message: "Speak louder please",
            enum: "MESSAGE_LOUDER",
            color:"SlateBlue",
            id: 4
        }
      ],

      currentEmojis: [],

      buttons_disabled: false,
      demoStudent: false,
     };
     this.setMessageModalChange = this.setMessageModalChange.bind(this)
     this.handleMessageModalOpen = this.handleMessageModalOpen.bind(this)
     this.handleMessageModalClose = this.handleMessageModalClose.bind(this)
     this.handleMessageClick = this.handleMessageClick.bind(this)

   }

   setMessageModalChange(value)
  {
    this.setState({message_modal_open: value})
  }

  handleMessageModalOpen = () => {
    this.setMessageModalChange(true);

    if(this.state.message_modal_open==true) {
        setTimeout(function(){
             this.setState({message_modal_open:false});
        }.bind(this),2000);  // wait 5 seconds, then reset to false
   }
  };

  handleMessageModalClose = () => {
    this.setState({buttons_disabled: false});
    this.setMessageModalChange(false);
  };


   componentDidMount(){
     var self = this;
     var student_payload = server.getStudentProfile( function(error){
         console.log("Error in getting Teacher Profile for Nav Bar");
         console.log(error);
     });
     if (student_payload)
     {
       self.setState({demoStudent: student_payload["https://emon-teach.com/demo_student"]});
     }

     server.getLessonStatus(
      function(response){
        if(response.data === "LESSON_END")
        {
          history.push("/my-courses/");
        }
      },
      function(error){
        console.log("Error in getLessonStatus in componentDidmount in Lesson", error);
      },
      this.state.lesson_id
     )

     const getHistory=() =>{
      var money = 0;
      var emojis = [];
      var self = this;
      server.getLessonMessages(function(response)
       {
         //iterating over the recieved messages
        var data=response.data;
        for(var res of data){
          //if got an emoji
          if(res.messageType != "EMON"){
              emojis =  [...emojis, EmojiEnum[res.emojiType]]
          }else
          {
            //if got an emony
            money +=res.value;
          }
        }
        self.setState(
          {
            reward_money: money,
            currentEmojis: emojis
          }
        );  
      }, function(error){
       console.log("Error in getLessonDetails in componentDidMount in Lesson.js ", error);
      }, self.state.lesson_id, self.state.student_id);
    }

    var LessonsMessageURL='lesson/'+this.state.lesson_id+'/messages/'+this.state.student_id;

    let onConnect = () => {
      console.log("Connected", this.state.student_id);
      getHistory();
    }

    let onMessages =  (topic, message) => {
      console.log("Message for", this.state.student_id, "topic", topic, "message", message);
      if(topic === LessonsMessageURL){
          console.log("topic, message", topic,JSON.parse(message));
          var res=JSON.parse(message);
          if(res.messageType === "EMOJI"){
              this.setState(prevState => ({
              currentEmojis : [...this.state.currentEmojis, EmojiEnum[res.emojiType]]
            }));
            this.setState({message: "You got an Emoji from your teacher: "+ EmojiEnum[res.emojiType], success: true});
            this.handleMessageModalOpen();
            window.scrollTo(0, 0);
          }else{
            let updated_reward_money = +this.state.reward_money + +res.value
            this.setState(prevState => ({
            reward_money : updated_reward_money
          }));
          this.setState({message: "You got "+ res.value+" EMons from your teacher!", success: true});
          this.handleMessageModalOpen();
            window.scrollTo(0, 0);
          }

      }else{
        console.log("Message for", this.state.student_id, "topic", topic, "message", message);
        var self = this;
        server.deleteLessonMessages(function(error){
          console.log("Error in deleteLessonMessages in onMessages in Lesson.js", error);
        }, self.state.lesson_id, self.state.student_id);

        this.setState({message: "The lesson ended", success: false, message_modal_open:false});
        window.scrollTo(0, 0);
        if(this.state.demoStudent)
        {
          history.push("/user-profile-lite/");
        }
        else {
          window.location.href = "/course-summery/" + JSON.stringify( {
              id: this.state.lesson_id,
              reward_money: this.state.reward_money,
              emojis: this.state.currentEmojis
            })
        }

      }
    }

    let onOffline = () => {
      console.log("Offline", this.state.student_id);
    } /* Basically we had it in the teacher part and
                              I had no idea whether it's important but it might be*/
    var self = this;
    iotclient.getKeys(function(response){
      iotclient.connect(self.state.lesson_id, self.state.student_id, onConnect, onMessages, onOffline);
    }, function(error){
      console.log("Error in getKeys in componentDidMount in Lesson.js", error);
    })

   server.getCourse(function(response) {
    self.setState(
      {name: response.data.name ,description : response.data.description,location: response.data.location});
  },function(error){
    console.log(error);
  }, self.state.lesson_id);


}

  handleMessageClick(message)
  {
    this.setState({chosen_message : message.id});
    var self = this;
    server.sendMessage(function(response) {
      self.setState({buttons_disabled: true});
      self.setState({message: "Your message sent to your teacher!", success: true});
      self.handleMessageModalOpen();
      window.scrollTo(0, 0)
    }, function(error) {
      console.log("Error in sendMessage in handleMessageClick in Lesson.js", error);
    },self.state.lesson_id,
    {messageType: "MESSAGE", studentId:  self.state.student_id, content: message.enum});
  }



  render() {

    const {messageRows, smileys} = this.state;
    const classes = this.props.classes;
    const { t } = this.props;

    return (
      <div>
        {this.state.error &&
          <Container fluid className="px-0" >
            <TimeoutAlert className="mb-0" theme="danger" msg={this.state.message} time={3000} />
          </Container>
        }

        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          className={classes.modal}
          open={this.state.message_modal_open}
          onClose={this.handleMessageModalClose}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={this.state.message_modal_open}>
            <div className={classes.paper}>
              <h3 id="transition-modal-title" style={{color:"white"}}>{this.state.message}</h3>
            </div>
          </Fade>
        </Modal>

      <Container fluid className="main-content-container px-4">




        {/* Page Header */}
        <Row noGutters className="page-header py-4">
          <PageTitle sm="4" title={this.state.description} subtitle={this.state.name} className="text-sm-left" />
        </Row>
        {/* First Row of Posts */}
        <Row>
          <Col lg="8" className="mb-4">
          <Card small className="mb-4 p-0 px-3 pt-1">
              <CardHeader >
                <h5 className="m-0">{t("Information")}</h5>

                <div className="mt-2">
                <p></p>
                  <p style={{fontSize:"20px" ,textAlign:"center"}}>{t("Current EMons Earned") + ":"} {this.state.reward_money} <img style={{width:"2em", marginLeft:"0.2em", marginBottom:"0.2em"}} src={CoinImage} /></p>
                </div>
              </CardHeader>

            </Card>
            <Card small className="p-0 px-3 pt-3">
              <CardHeader className="border-bottom">
                <h5 className="m-0">{t("Emojis from Teacher")}:</h5><br /><br />
                <ul className='rows' style={{textAlign:'center', padding:'0'}}>
                {this.state.currentEmojis.map((smile) => (<li style={{display:'inline', margin:'5px', fontSize:'2em'}} className='row'>{smile}</li>))}
                </ul>
              </CardHeader>


            </Card>
          </Col>

          <Col lg="4" className="mb-4" >
            {/* Sliders & Progress Bars */}
            <StudentMessageCard
            title={t("MsgTeacher")}
            subtitle={t("ChooseMsg")}
            send_questions={()=>{this.handleMessageClick(this.state.messageRows[0]);}}
            send_go_out={()=>{this.handleMessageClick(this.state.messageRows[1])}}
            send_answer={()=>{this.handleMessageClick(this.state.messageRows[2]);}}
            send_confused={()=>{this.handleMessageClick(this.state.messageRows[3]);}}
            send_louder={()=>{this.handleMessageClick(this.state.messageRows[4]);}}

            />
          </Col>
        </Row>

      </Container>
      </div>
    );
  }
}

export default withTranslation()(withStyles(styles)(Lesson));
