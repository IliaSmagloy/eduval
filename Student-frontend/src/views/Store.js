/* eslint jsx-a11y/anchor-is-valid: 0 */
import history from '../history';
import React from "react";
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardFooter,
  Badge,
  Button
} from "shards-react";

import PageTitle from "../components/common/PageTitle";
import TimeoutAlert from "../components/common/TimeoutAlert";
import awsIot  from 'aws-iot-device-sdk';
import CoinImage from "../images/midEcoin.png"
import server from '../Server/Server';



class Store extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: res,
      course:{},
      balance:555,
      // Third list of posts.
      PostsListThree: [],
      lessons_status: {},

    };
    
    var headers = {
        'Authorization': 'Bearer ' + localStorage.getItem('idToken')
    };
    //getting data on the course
    server.getCourse((response) => {
        this.setState({course: response.data});
    },null, this.props.match.params.id);

    //getting emon balance of student in the course
    server.getEmonBalanceByCourse((response) =>{
      this.setState({balance: response.data ? response.data : 0});
    }, null, this.props.match.params.id);

    //adding a fake item to the course
    // axios.post('https://api.emon-teach.com/shop/'+this.props.match.params.id+ '/items',
    // {id:0, name:"Cool Item", description:"cool",cost:1,amountAvailable:4,sellByDate: "2019-06-12"},
    //  {headers: headers})
    //   .then(response =>{console.log(response.data); } );

    server.getShopItems((response) =>{
      var data = Array.from(response.data);
      this.setState({
        PostsListThree: data.filter(elem => elem.amountAvailable>0)
      });
    }, null, this.props.match.params.id);

    let res=[];
  }

  sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

  stringToColour(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
  }

  stringToInitials(str){
    return str.split(" ").map((n)=>n[0].toUpperCase()).join("");
  }

  getCorrectTextColor(hex){

    const threshold = 130;


    function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
    function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
    function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
    function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

    hex = cutHex(hex);
    let hRed = hexToR(hex);
    let hGreen = hexToG(hex);
    let hBlue = hexToB(hex);

    let cBrightness = ((hRed * 299) + (hGreen * 587) + (hBlue * 114)) / 1000;
      if (cBrightness > threshold){return "#000000";} else { return "#ffffff";}
  }

  postbuy(post){
    if(this.state.balance< post.cost){
      this.setState({message: "you dont have enough EMons to buy this item ", error: true ,success :false});
      return;
    }
    if(post.amountAvailable === 0){
      this.setState({message: "The item is sold out ", error: true,success :false});
      return;
    }

    server.orderItem((response) =>{
      this.setState({message: "The items is successfully bought", success: true, error:false});
    }, null, this.props.match.params.id, post.id, 1);

    this.sleep(500);
    //getting emon balance of student in the course

    server.getEmonBalanceByCourse((response) =>{
      this.setState({
        balance: response.data ? response.data : 0
      });
      post.amountAvailable--;
    }, null, this.props.match.params.id);

    server.getShopItems(response =>{
      this.setState({
        PostsListThree: response.data.filter(elem => elem.amountAvailable>0)
      }); 
    }, null, this.props.match.params.id);
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }


  render() {
    const {
      PostsListOne,
      PostsListTwo,
      PostsListThree,
      PostsListFour
    } = this.state;
    var rand;



    return (


      <Container fluid className="main-content-container px-4">
                {this.state.error &&
          <Container fluid className="px-0" >
          <TimeoutAlert className="mb-0" theme="danger" msg={this.state.message} time={3000} />
          </Container>
          }

               {this.state.success &&
          <Container fluid className="px-0">
          <TimeoutAlert className="mb-0" theme="success" msg={this.state.message} time={3000} />
          </Container>
          }
        {/* Page Header */}
        <Row noGutters className="page-header py-4">
          <PageTitle sm="4" title={this.state.course.name+"'s Store"} subtitle="You can buy stuff with your EMons"
                     className="text-sm-left" />


        </Row>
        <Row >
              <Col >
                <div style={{fontSize: 20}}><p>You have {this.state.balance} <img alt="EMons" style={{width:"1.5em", marginLeft:"0.2em", marginBottom:"0.2em"}} src={CoinImage} /> in this course</p></div>
              </Col>
        </Row>

        <Row >
              <Col >
                <p style={{fontSize: 20}}>{Array.from(this.state.PostsListThree).length == 0 ? "The store is empty!" : null}</p>
              </Col>
        </Row>


        {/* First Row of Posts */}
        <Row>
           { Array.from(this.state.PostsListThree).map((post, idx) => (
            <Col lg="4" key={idx}>
              <Card small className="card-post mb-4">
                <CardBody>
                <Row>
                <Col md={{ span: 1, offset: 0}}>
                <div data-letters={this.stringToInitials(post.name)} style={{"--background-color" :  this.stringToColour(post.name), "--font-color" : this.getCorrectTextColor(this.stringToColour(post.name))}} className="blog-comments__meta text-mutes">
                {}
                </div>
                </Col>
                <Col md={{ span: 1, offset: 1 }}>
                <h4 className="card-title" style={{ color:  this.stringToColour(post.name) }}>{post.name}</h4>
                </Col>
                </Row>




                  <p className="card-text text-muted" style={{ color:  this.getRandomColor() }}><b>Description: </b>{" "+ post.description}</p>
                  <p className="card-text text-muted" style={{ color:  this.getRandomColor() }}><b>Cost: </b>{" "+post.cost}</p>
                  <p className="card-text text-muted" style={{ color:  this.getRandomColor() }}><b>Amount Left: </b>{" "+post.amountAvailable}</p>

                </CardBody>
                <CardFooter className="border-top d-flex">
                  <div className="card-post__author d-flex">
                    <div className="d-flex flex-column justify-content-center ml-3">
                    <a ><Button ssize="sm"   theme="white" onClick={() => {this.postbuy(post)}}>
                      <i className="far  mr-1" /> Buy
                    </Button></a>
                    </div>
                  </div>
                  </CardFooter>


              </Card>
            </Col>
          ))}
        </Row>

      </Container>


    );

  }

}

export default Store;
