import React from "react";
import clsx from 'clsx';

import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import { withStyles } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import SendIcon from '@material-ui/icons/Send';
import Alert from 'react-bootstrap/Alert';

import { withTranslation } from 'react-i18next';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';

import {
  Row,
  Col,
} from "shards-react";

import server from "../../Server/Server";

const styles = theme => ({
  card: {
    marginBottom: '30px ',
  },

  title:{
    color: "DarkBlue",
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: "40%",
  },
  instruction: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(2),
  },

  button:{
    width:"45%",
    marginTop: '28px ',

  }
});

class UserAccountCard extends React.Component
{
  constructor(props) {
    super(props);
    this.state =
    {
      title: this.props.title,
      details:
      {
        username: "",
        firstName: "",
        lastName: "",
        newPassword: "",
        email: "",
        phoneNum: "",
        oldPassword: "",
      },
      wrongPassword:this.props.wrongPassword,
      usernameTaken:this.props.usernameTaken,
      emailTaken: this.props.emailTaken,
      weak_password: this.props.weakPassword,
      tooMany:this.props.tooMany,
      isPhoneNumber:false,
      isEmail: false,
      fieldError: false,
      showNewPassword: false,
      showCurrPassword: false,
    }
    this.setState({details:  this.props.details});

    this.setUsername = this.setUsername.bind(this);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);

    this.setEmail = this.setEmail.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.checkEmail = this.checkEmail.bind(this);

    this.setFirstName = this.setFirstName.bind(this);
    this.handleFirstNameChange = this.handleFirstNameChange.bind(this);

    this.setLastName = this.setLastName.bind(this);
    this.handleLastNameChange = this.handleLastNameChange.bind(this);

    this.setNewPassword = this.setNewPassword.bind(this);
    this.handleNewPasswordChange = this.handleNewPasswordChange.bind(this);

    this.setConfirmPassword = this.setConfirmPassword.bind(this);
    this.handleConfirmPasswordChange = this.handleConfirmPasswordChange.bind(this);

    this.handleClickShowNewPassword = this.handleClickShowNewPassword.bind(this);
    this.handleClickShowCurrPassword = this.handleClickShowCurrPassword.bind(this);
    this.handleMouseDownPassword = this.handleMouseDownPassword.bind(this);


    this.setPhoneNumber = this.setPhoneNumber.bind(this);
    this.handlePhoneNumberChange = this.handlePhoneNumberChange.bind(this);
    this.checkPhoneNumber = this.checkPhoneNumber.bind(this);
    this.submit = this.submit.bind(this);
  }

  componentDidUpdate(prevProps, prevState)
  {
    if(prevProps.details!=this.props.details)
    {
      this.setState({details: this.props.details});
      this.checkPhoneNumber(this.props.details.phoneNum);
      this.checkEmail(this.props.details.email);
      console.log("New Details", this.props.details);
    }
    if(prevProps.wrongPassword!=this.props.wrongPassword)
    {
      this.setState({wrongPassword: this.props.wrongPassword});
    }
    if(prevProps.usernameTaken!=this.props.usernameTaken)
    {
      this.setState({usernameTaken: this.props.usernameTaken});
      this.setState({fieldError:true})
    }
    if(prevProps.emailTaken!=this.props.emailTaken)
    {
      this.setState({emailTaken: this.props.emailTaken});
      this.setState({fieldError:true})
    }
    if(prevProps.weakPassword!=this.props.weakPassword)
    {
      this.setState({weak_password: this.props.weakPassword});
      this.setState({fieldError:true})
    }
    if(prevProps.tooMany!=this.props.tooMany)
    {
      this.setState({tooMany: this.props.tooMany});
    }
  }

  setUsername(value)
  {
    this.setState({fieldError:false})
    var dets = this.state.details;
    dets.username = value;
    this.setState({details: dets});
  }
  handleUsernameChange(evnt)
  {
    this.props.changedUsername();
    this.setState({usernameTaken:false})
    this.setUsername(evnt.target.value);
  }

  setEmail(value)
  {
    var dets = this.state.details;
    dets.email = value;
    this.setState({details: dets});
  }
  handleEmailChange(evnt)
  {
    this.props.changedEmail();
    this.setState({emailTaken:false})
    this.setState({fieldError:false})
    this.checkEmail(evnt.target.value);
    this.setEmail(evnt.target.value);
  }

  checkEmail(value)
  {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    var arr_result = re.exec(value);
    console.log("Arr_Result", arr_result);
    if(!arr_result )
    {
      this.setState({isEmail: false})
    }
    else {
      this.setState({isEmail: true})
    }
  }


  setFirstName(value)
  {
    var dets = this.state.details;
    dets.firstName = value;
    this.setState({details: dets});
  }
  handleFirstNameChange(evnt)
  {
    this.setFirstName(evnt.target.value);
  }

  setLastName(value)
  {
    var dets = this.state.details;
    dets.lastName = value;
    this.setState({details: dets});
  }
  handleLastNameChange(evnt)
  {
    this.setLastName(evnt.target.value);
  }

  setNewPassword(value)
  {
    var dets = this.state.details;
    dets.newPassword = value;
    this.setState({details: dets});
  }
  handleNewPasswordChange(evnt)
  {
    var pass = evnt.target.value;
    if(pass.length>0 && (pass.length < 8 || pass.toLowerCase() === pass 
    || pass.toUpperCase() === pass || !pass.match(/[0-9]/)))
    {
      this.setState({weak_password:true});
    }
    else 
    {
      this.setState({weak_password:false});
    }
    this.setNewPassword(evnt.target.value);
  }

  setConfirmPassword(value)
  {
    var dets = this.state.details;
    dets.oldPassword = value;
    this.setState({details: dets});
  }
  handleConfirmPasswordChange(evnt)
  {
    this.setState({fieldError:false})
    this.setState({wrongPassword:false});
    this.props.changedOldPassword();
    this.setConfirmPassword(evnt.target.value);
  }

  setPhoneNumber(value)
  {
    var dets = this.state.details;
    dets.phoneNum = value;
    this.setState({details: dets});
  }
  handlePhoneNumberChange(evnt)
  {
    this.setState({fieldError:false})
    this.checkPhoneNumber(evnt.target.value);
    this.setPhoneNumber(evnt.target.value);
  }

  checkPhoneNumber(value)
  {
    var re = RegExp('^(0|(\\+[0-9]{3}))[0-9]{9}$','g');
    var arr_result = re.exec(value);
    console.log("Arr_Result", arr_result);
  
    if (value == "")  {
      this.setState({isPhoneNumber: true})
    }
    else if(!arr_result)
    {
      this.setState({isPhoneNumber: false})
    }
    else {
      this.setState({isPhoneNumber: true})
    }
  }

  handleClickShowNewPassword = () => {
    this.setState({showNewPassword: !this.state.showNewPassword});
  };
  handleClickShowCurrPassword = () => {
    this.setState({showCurrPassword: !this.state.showCurrPassword});
  };


  handleMouseDownPassword = event => {
    event.preventDefault();
  };


  submit()
  {
    if (!this.state.isPhoneNumber || this.state.oldPassword==""
          || !this.state.isEmail || this.state.usernameTaken || this.state.emailTaken
          || this.state.weak_password)
    {
      this.setState({fieldError:true})
      return
    }
    this.props.updateTeacher(this.state.details);
  }

  render(){
    const classes = this.props.classes;
    const { t } = this.props;

    return(
      <Card className={classes.card}>
      {(this.state.details.demoStudent) &&
        <Alert variant = "warning">
          <Alert.Heading style={{color:"white"} }>{t("Welcome to the System!")}</Alert.Heading>
          <p>
            {t("firstEntry")}. <br/>
            {t("continueLearning")}. <br/>
            {t("futureLogin")}.
          </p>
        </Alert>
      }
      {(this.state.tooMany) &&
        <Alert variant = "warning">
          <Alert.Heading style={{color:"white"} }>{t("Your Account is blocked!")}</Alert.Heading>
          <p>
            {t("You've accessed your account too many times")}. <br/>
            {t("Contact system administrator or look for instructions in your mail for further instructions")}.
          </p>
        </Alert>
      }
      {this.state.wrongPassword &&
        <Alert variant = "danger">
          <Alert.Heading style={{color:"white"}}>{t("Wrong Confirmation Password!")}</Alert.Heading>
            <p> {t("The password near the button has to be your correct one")}. <br />
            {t("Please contact administrator for further information")}.</p>
        </Alert>
      }
      {this.state.weak_password &&
        <Alert variant = "danger">
          <Alert.Heading style={{color:"white"}}>{t("NewPasswordWeak")}</Alert.Heading>
            <p> {t("NewPasswordContain")}
           {t("OneDigitUpperLower")}</p>
        </Alert>
      }

      {this.state.fieldError &&
        <Alert variant = "dark">
          <Alert.Heading style={{color:"white"}}>{t("One of the Fields filled is wrong!")}</Alert.Heading>
            <p> {t("Check which field is marked with red or consult an administrator")}</p>
        </Alert>
      }

        <CardHeader
          classes={{
            title: classes.title,
          }}
          title={this.state.title}
        />
        <CardContent>
          <form className={classes.container}
          onSubmit={(event)=>{
            event.preventDefault();
            this.submit();
          }}>
            <div>
              <TextField
                required
                error={this.state.usernameTaken}
                id="standard-required"
                label={t("Username")}
                value={this.props.details.username}
                className={classes.textField}
                onChange={this.handleUsernameChange}
                margin="normal"
              />
              <TextField
                required
                error={!this.state.isEmail || this.state.emailTaken}
                id="standard-required"
                label={t("Email")}
                type="email"
                value={this.props.details.email}
                onChange={this.handleEmailChange}
                className={classes.textField}
                margin="normal"
              />
              <TextField
                required
                id="standard-required"
                label={t("First Name")}
                value={this.props.details.firstName}
                onChange={this.handleFirstNameChange}

                className={classes.textField}
                margin="normal"
              />
              <TextField
                required
                id="standard-required"
                label={t("Last Name")}
                value={this.props.details.lastName}
                onChange={this.handleLastNameChange}
                className={classes.textField}
                margin="normal"
              />
              <FormControl className={classes.textField} margin="normal">
                <InputLabel htmlFor="standard-adornment-password">{t("New Password")+(this.state.details.demoStudent?"*": "")}</InputLabel>
                <Input
                  error={this.state.weak_password}

                  id="standard-adornment-password"
                  type={this.state.showNewPassword ? 'text' : 'password'}
                  value={this.state.details.newPassword}
                  onChange={this.handleNewPasswordChange}
                  required={this.state.details.demoStudent}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={this.handleClickShowNewPassword}
                        onMouseDown={this.handleMouseDownPassword}
                      >
                        {this.state.showNewPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>

              <TextField
                error={!this.state.isPhoneNumber}
                id="standard-required"
                label={t("Phone Number")}
                onChange={this.handlePhoneNumberChange}
                value={this.props.details.phoneNum}
                className={classes.textField}
                margin="normal"
              />
              <Typography className={classes.instruction}>
                {
                  (!this.state.details.demoStudent ? t("EnterCurrentPassword") : "")
                  + t("PressToComplete")
                }
              </Typography>
              { !this.state.details.demoStudent &&
                <FormControl className={classes.textField} margin="normal">
                  <InputLabel htmlFor="standard-adornment-password">{t("Current Password")}</InputLabel>
                  <Input
                    error={this.state.wrongPassword}
                    id="standard-adornment-password"
                    type={this.state.showCurrPassword ? 'text' : 'password'}
                    value={this.state.details.old_password}
                    onChange={this.handleConfirmPasswordChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={this.handleClickShowCurrPassword}
                          onMouseDown={this.handleMouseDownPassword}
                        >
                          {this.state.showCurrPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              }
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  type="submit"
                  endIcon={<SendIcon/>}
                >
                  {t("Send")}
                </Button>

            </div>
          </form>
        </CardContent>
      </Card >
    );
  }
}

UserAccountCard.propTypes = {
  classes:PropTypes.object.isRequired,
};


export default withTranslation()(withStyles(styles)(UserAccountCard));
